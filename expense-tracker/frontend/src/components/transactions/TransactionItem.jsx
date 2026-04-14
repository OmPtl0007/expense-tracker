const TransactionItem = ({ transaction, onDelete, onEdit }) => {
  const { amount, type, category, description, date } = transaction;
  const categoryData = category || {};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${categoryData.color}20` }}
        >
          <span className="text-lg">
            {categoryData.icon === 'default' ? '📁' : '📁'}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{categoryData.name || 'Unknown'}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          <p className="text-xs text-gray-400">{formatDate(date)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span
          className={`font-semibold ${
            type === 'income' ? 'text-income' : 'text-expense'
          }`}
        >
          {type === 'income' ? '+' : '-'}
          {formatCurrency(amount)}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(transaction)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(transaction._id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
