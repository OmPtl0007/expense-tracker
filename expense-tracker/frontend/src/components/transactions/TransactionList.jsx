import { useState, useEffect } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import TransactionItem from './TransactionItem';
import TransactionForm from './TransactionForm';
import Modal from '../common/Modal';

const TransactionList = () => {
const {
  transactions,
  loading,
  error,
  pagination,
  fetchTransactions,
  addTransaction,        // ✅ ADD THIS
  updateTransaction,     // ✅ ADD THIS
  deleteTransaction,
} = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchTransactions(filters);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction._id, data);
    } else {
      await addTransaction(data);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions(filters);
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    fetchTransactions(filters);
  };

  const clearFilters = () => {
    setFilters({ type: '', startDate: '', endDate: '' });
    fetchTransactions({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button onClick={applyFilters} className="btn-primary flex-1">
              Filter
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && transactions.length === 0 && (
          <p className="text-center text-gray-500">No transactions found</p>
        )}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => fetchTransactions({ ...filters, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchTransactions({ ...filters, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
};

export default TransactionList;
