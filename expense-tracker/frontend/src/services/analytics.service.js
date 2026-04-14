import api from './api';

export const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getMonthlySummary: async (params = {}) => {
    const response = await api.get('/analytics/monthly', { params });
    return response.data;
  },

  getYearlySummary: async (year) => {
    const response = await api.get('/analytics/yearly', { params: { year } });
    return response.data;
  },

  getTrends: async (period = '6months') => {
    const response = await api.get('/analytics/trends', { params: { period } });
    return response.data;
  },

  getCategoryComparison: async (type = 'expense', limit = 10) => {
    const response = await api.get('/analytics/category-comparison', {
      params: { type, limit },
    });
    return response.data;
  },
};
