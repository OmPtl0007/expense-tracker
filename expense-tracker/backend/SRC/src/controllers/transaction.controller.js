import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/apiResponse.js';

// @desc    Get all transactions for user
// @route   GET /api/v1/transactions
// @access  Private
export const getTransactions = catchAsync(async (req, res, next) => {
  const { type, category, startDate, endDate, sort, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { user: req.user.id };

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Build sort
  let sortOption = '-createdAt';
  if (sort) {
    sortOption = sort;
  }

  // Pagination
  const skip = (page - 1) * limit;
  const limitNum = parseInt(limit);

  // Execute query
  const transactions = await Transaction.find(query)
    .populate('category', 'name type icon color')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const total = await Transaction.countDocuments(query);

  successResponse(res, 200, {
    transactions,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  }, 'Transactions retrieved successfully');
});

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
export const getTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('category', 'name type icon color');

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  // Ensure user owns the transaction
  if (transaction.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this transaction', 403));
  }

  successResponse(res, 200, transaction, 'Transaction retrieved successfully');
});

// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private
export const createTransaction = catchAsync(async (req, res, next) => {
  const { amount, type, category, description, date } = req.body;

  const transaction = await Transaction.create({
    amount,
    type,
    category,
    description,
    date: date || Date.now(),
    user: req.user.id,
  });

  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('category', 'name type icon color');

  successResponse(res, 201, populatedTransaction, 'Transaction created successfully');
});

// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private
export const updateTransaction = catchAsync(async (req, res, next) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  // Ensure user owns the transaction
  if (transaction.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this transaction', 403));
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name type icon color');

  successResponse(res, 200, transaction, 'Transaction updated successfully');
});

// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private
export const deleteTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  // Ensure user owns the transaction
  if (transaction.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this transaction', 403));
  }

  await transaction.deleteOne();

  successResponse(res, 200, null, 'Transaction deleted successfully');
});

// @desc    Get transaction statistics
// @route   GET /api/v1/transactions/stats/overview
// @access  Private
export const getTransactionStats = catchAsync(async (req, res, next) => {
  const stats = await Transaction.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = stats.find((s) => s._id === 'income');
  const expense = stats.find((s) => s._id === 'expense');

  successResponse(res, 200, {
    income: {
      total: income ? income.total : 0,
      count: income ? income.count : 0,
    },
    expense: {
      total: expense ? expense.total : 0,
      count: expense ? expense.count : 0,
    },
    balance: (income ? income.total : 0) - (expense ? expense.total : 0),
  }, 'Statistics retrieved successfully');
});
