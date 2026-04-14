const SummaryCards = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(data?.income?.total || 0),
      type: 'income',
      icon: '↑',
    },
    {
      title: 'Total Expense',
      value: formatCurrency(data?.expense?.total || 0),
      type: 'expense',
      icon: '↓',
    },
    {
      title: 'Balance',
      value: formatCurrency(data?.balance || 0),
      type: data?.balance >= 0 ? 'income' : 'expense',
      icon: '●',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                card.type === 'income'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
