import Transaction from '../models/Transaction.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/apiResponse.js';

// @desc    Get monthly summary
// @route   GET /api/v1/analytics/monthly
// @access  Private
export const getMonthlySummary = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0);

  const pipeline = [
    {
      $match: {
        user: req.user._id,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$categoryInfo.name',
          categoryId: '$category',
          color: '$categoryInfo.color',
          icon: '$categoryInfo.icon',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.type',
        categories: {
          $push: {
            categoryId: '$_id.categoryId',
            name: '$_id.category',
            color: '$_id.color',
            icon: '$_id.icon',
            total: '$total',
            count: '$count',
          },
        },
        total: { $sum: '$total' },
        transactionCount: { $sum: '$count' },
      },
    },
  ];

  const results = await Transaction.aggregate(pipeline);

  const income = results.find((r) => r._id === 'income') || {
    _id: 'income',
    categories: [],
    total: 0,
    transactionCount: 0,
  };
  const expense = results.find((r) => r._id === 'expense') || {
    _id: 'expense',
    categories: [],
    total: 0,
    transactionCount: 0,
  };

  successResponse(res, 200, {
    period: {
      year: parseInt(currentYear),
      month: parseInt(currentMonth),
      startDate,
      endDate,
    },
    income: {
      total: income.total,
      count: income.transactionCount,
      byCategory: income.categories.sort((a, b) => b.total - a.total),
    },
    expense: {
      total: expense.total,
      count: expense.transactionCount,
      byCategory: expense.categories.sort((a, b) => b.total - a.total),
    },
    balance: income.total - expense.total,
  }, 'Monthly summary retrieved successfully');
});

// @desc    Get yearly summary
// @route   GET /api/v1/analytics/yearly
// @access  Private
export const getYearlySummary = catchAsync(async (req, res, next) => {
  const year = req.query.year || new Date().getFullYear();

  const pipeline = [
    {
      $match: {
        user: req.user._id,
        date: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.month',
        income: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] },
        },
        incomeCount: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$count', 0] },
        },
        expenseCount: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$count', 0] },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  const monthlyData = await Transaction.aggregate(pipeline);

  // Fill in missing months
  const fullYearData = [];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  for (let i = 0; i < 12; i++) {
    const monthData = monthlyData.find((m) => m._id === i + 1) || {
      _id: i + 1,
      income: 0,
      expense: 0,
      incomeCount: 0,
      expenseCount: 0,
    };
    fullYearData.push({
      month: i + 1,
      monthName: monthNames[i],
      income: monthData.income,
      expense: monthData.expense,
      incomeCount: monthData.incomeCount,
      expenseCount: monthData.expenseCount,
      balance: monthData.income - monthData.expense,
    });
  }

  // Calculate yearly totals
  const yearlyTotals = fullYearData.reduce(
    (acc, month) => ({
      income: acc.income + month.income,
      expense: acc.expense + month.expense,
      balance: acc.balance + month.balance,
    }),
    { income: 0, expense: 0, balance: 0 }
  );

  successResponse(res, 200, {
    year: parseInt(year),
    monthly: fullYearData,
    totals: yearlyTotals,
  }, 'Yearly summary retrieved successfully');
});

// @desc    Get spending trends
// @route   GET /api/v1/analytics/trends
// @access  Private
export const getTrends = catchAsync(async (req, res, next) => {
  const { period = '6months' } = req.query;
  let monthsBack = 6;

  if (period === '3months') monthsBack = 3;
  if (period === '1year') monthsBack = 12;

  const today = new Date();
  const startDate = new Date(today.setMonth(today.getMonth() - monthsBack));

  const pipeline = [
    {
      $match: {
        user: req.user._id,
        type: 'expense',
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ];

  const trends = await Transaction.aggregate(pipeline);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const formattedTrends = trends.map((t) => ({
    period: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    amount: t.total,
    count: t.count,
    month: t._id.month,
    year: t._id.year,
  }));

  // Calculate average
  const avgSpending =
    formattedTrends.length > 0
      ? formattedTrends.reduce((acc, t) => acc + t.amount, 0) / formattedTrends.length
      : 0;

  successResponse(res, 200, {
    period: `Last ${monthsBack} months`,
    trends: formattedTrends,
    averageMonthlySpending: avgSpending,
  }, 'Spending trends retrieved successfully');
});

// @desc    Get category comparison
// @route   GET /api/v1/analytics/category-comparison
// @access  Private
export const getCategoryComparison = catchAsync(async (req, res, next) => {
  const { type = 'expense', limit = 10 } = req.query;

  const pipeline = [
    {
      $match: {
        user: req.user._id,
        type,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $group: {
        _id: {
          categoryId: '$category',
          name: '$categoryInfo.name',
          color: '$categoryInfo.color',
          icon: '$categoryInfo.icon',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $limit: parseInt(limit),
    },
  ];

  const categories = await Transaction.aggregate(pipeline);

  const total = categories.reduce((acc, c) => acc + c.total, 0);

  const withPercentage = categories.map((c) => ({
    ...c,
    percentage: total > 0 ? ((c.total / total) * 100).toFixed(2) : 0,
  }));

  successResponse(res, 200, {
    type,
    total,
    categories: withPercentage,
  }, 'Category comparison retrieved successfully');
});

// @desc    Get dashboard overview
// @route   GET /api/v1/analytics/dashboard
// @access  Private
export const getDashboardOverview = catchAsync(async (req, res, next) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Current month stats
  const monthStats = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const monthIncome = monthStats.find((s) => s._id === 'income')?.total || 0;
  const monthExpense = monthStats.find((s) => s._id === 'expense')?.total || 0;

  // Recent transactions
  const recentTransactions = await Transaction.find({ user: req.user._id })
    .populate('category', 'name type icon color')
    .sort('-date')
    .limit(5);

  successResponse(res, 200, {
    currentMonth: {
      income: monthIncome,
      expense: monthExpense,
      balance: monthIncome - monthExpense,
    },
    recentTransactions,
  }, 'Dashboard overview retrieved successfully');
});
