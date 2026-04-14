import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import SummaryCards from './SummaryCards';
import { CategoryPieChart, MonthlyBarChart, TrendsLineChart } from './Charts';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [yearlySummary, setYearlySummary] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [monthly, yearly, trends] = await Promise.all([
        analyticsService.getMonthlySummary(),
        analyticsService.getYearlySummary(selectedYear),
        analyticsService.getTrends(selectedPeriod),
      ]);
      setMonthlySummary(monthly.data);
      setYearlySummary(yearly.data);
      setTrendsData(trends.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto"
          >
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={monthlySummary} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        {monthlySummary?.expense?.byCategory && (
          <CategoryPieChart
            data={monthlySummary.expense.byCategory}
            title="Expenses by Category"
          />
        )}

        {/* Income by Category */}
        {monthlySummary?.income?.byCategory &&
          monthlySummary.income.byCategory.length > 0 && (
            <CategoryPieChart
              data={monthlySummary.income.byCategory}
              title="Income by Category"
            />
          )}
      </div>

      {/* Monthly Overview */}
      {yearlySummary?.monthly && (
        <MonthlyBarChart data={yearlySummary.monthly} />
      )}

      {/* Trends */}
      {trendsData?.trends && <TrendsLineChart data={trendsData.trends} />}
    </div>
  );
};

export default Analytics;
