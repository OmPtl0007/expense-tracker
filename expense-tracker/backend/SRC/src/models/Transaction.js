import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: ['income', 'expense'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ date: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function () {
  return this.amount.toFixed(2);
});

// Pre-save hook to ensure category matches transaction type
transactionSchema.pre('save', async function (next) {
  const Category = mongoose.model('Category');
  const category = await Category.findById(this.category);

  if (category && category.type !== this.type) {
    throw new Error('Category type does not match transaction type');
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
