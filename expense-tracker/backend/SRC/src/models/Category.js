import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify category type'],
      enum: ['income', 'expense'],
    },
    icon: {
      type: String,
      default: 'default',
    },
    color: {
      type: String,
      default: '#6B7280',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-specific categories
categorySchema.index({ user: 1, type: 1 });
categorySchema.index({ user: 1, name: 1 });

// Prevent duplicate category names per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
