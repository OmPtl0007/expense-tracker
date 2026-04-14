import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';
import { transactionService } from '../services/transaction.service';
import SummaryCards from '../components/analytics/SummaryCards';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, statsData] = await Promise.all([
        analyticsService.getDashboard(),
        transactionService.getStats(),
      ]);
      setDashboardData(dashboard.data);
      setStats(statsData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link to="/transactions" className="btn-primary">
          View All Transactions
        </Link>
      </div>

      {/* Summary Cards */}
      {stats && <SummaryCards data={stats} />}

      {/* Current Month Overview */}
      {dashboardData?.currentMonth && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Month Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(dashboardData.currentMonth.income)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Expense</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(dashboardData.currentMonth.expense)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Balance</p>
              <p
                className={`text-xl font-bold ${
                  dashboardData.currentMonth.balance >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(dashboardData.currentMonth.balance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {dashboardData?.recentTransactions && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h3>
          {dashboardData.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent transactions
            </p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${transaction.category?.color}20`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: transaction.category?.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.category?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-income'
                        : 'text-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
