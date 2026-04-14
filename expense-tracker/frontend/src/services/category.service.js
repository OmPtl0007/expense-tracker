import api from './api';

export const categoryService = {
  initialize: async () => {
    const response = await api.post('/categories/init');
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  getDefaults: async () => {
    const response = await api.get('/categories/defaults/list');
    return response.data;
  },
};
