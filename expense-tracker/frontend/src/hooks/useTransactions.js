import { useState, useCallback } from 'react';
import { transactionService } from '../services/transaction.service';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getAll(params);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = async (transactionData) => {
    try {
      setError(null);
      const response = await transactionService.create(transactionData);
      setTransactions((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      throw err;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      setError(null);
      const response = await transactionService.update(id, transactionData);
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await transactionService.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      throw err;
    }
  };

  const getStats = async () => {
    try {
      const response = await transactionService.getStats();
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
  };
};

export default useTransactions;
