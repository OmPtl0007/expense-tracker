import { useState } from 'react';
import { analyticsService } from '../services/analytics.service';

export const useAnalytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getDashboard();
      setDashboardData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getMonthlySummary({ year, month });
      setMonthlyData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch monthly summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlySummary = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getYearlySummary(year);
      setYearlyData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch yearly summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (period = '6months') => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getTrends(period);
      setTrendsData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trends');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryComparison = async (type = 'expense', limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getCategoryComparison(type, limit);
      setCategoryData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch category comparison');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    monthlyData,
    yearlyData,
    trendsData,
    categoryData,
    loading,
    error,
    fetchDashboard,
    fetchMonthlySummary,
    fetchYearlySummary,
    fetchTrends,
    fetchCategoryComparison,
  };
};

export default useAnalytics;
