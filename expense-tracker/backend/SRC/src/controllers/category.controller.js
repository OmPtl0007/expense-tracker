import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/apiResponse.js';

// Default categories to create for new users
const defaultCategories = [
  { name: 'Salary', type: 'income', icon: 'wallet', color: '#10B981' },
  { name: 'Business', type: 'income', icon: 'briefcase', color: '#3B82F6' },
  { name: 'Investments', type: 'income', icon: 'chart-up', color: '#8B5CF6' },
  { name: 'Gifts', type: 'income', icon: 'gift', color: '#EC4899' },
  { name: 'Other Income', type: 'income', icon: 'plus', color: '#6B7280' },
  { name: 'Food & Dining', type: 'expense', icon: 'restaurant', color: '#F59E0B' },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#3B82F6' },
  { name: 'Shopping', type: 'expense', icon: 'bag', color: '#EC4899' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#8B5CF6' },
  { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#EF4444' },
  { name: 'Healthcare', type: 'expense', icon: 'heart', color: '#10B981' },
  { name: 'Housing', type: 'expense', icon: 'home', color: '#6366F1' },
  { name: 'Education', type: 'expense', icon: 'book', color: '#14B8A6' },
  { name: 'Personal Care', type: 'expense', icon: 'user', color: '#F97316' },
  { name: 'Other Expense', type: 'expense', icon: 'minus', color: '#6B7280' },
];

// @desc    Initialize default categories for user
// @route   POST /api/v1/categories/init
// @access  Private
export const initializeCategories = catchAsync(async (req, res, next) => {
  // Check if user already has categories
  const existingCount = await Category.countDocuments({ user: req.user.id });

  if (existingCount > 0) {
    return successResponse(res, 200, { message: 'Categories already initialized' }, 'Categories already exist');
  }

  // Create default categories
  const categories = await Category.insertMany(
    defaultCategories.map((cat) => ({
      ...cat,
      user: req.user.id,
      isDefault: true,
    }))
  );

  successResponse(res, 201, categories, 'Default categories created successfully');
});

// @desc    Get all categories for user
// @route   GET /api/v1/categories
// @access  Private
export const getCategories = catchAsync(async (req, res, next) => {
  const { type } = req.query;

  const query = { user: req.user.id };
  if (type) {
    query.type = type;
  }

  const categories = await Category.find(query).sort({ type: 1, name: 1 });

  successResponse(res, 200, categories, 'Categories retrieved successfully');
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  successResponse(res, 200, category, 'Category retrieved successfully');
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, type, icon, color } = req.body;

  // Check for duplicate
  const existing = await Category.findOne({
    name: new RegExp(`^${name}$`, 'i'),
    type,
    user: req.user.id,
  });

  if (existing) {
    return next(new AppError(`Category '${name}' already exists for ${type}`, 400));
  }

  const category = await Category.create({
    name,
    type,
    icon: icon || 'default',
    color: color || '#6B7280',
    user: req.user.id,
  });

  successResponse(res, 201, category, 'Category created successfully');
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
export const updateCategory = catchAsync(async (req, res, next) => {
  let category = await Category.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Prevent updating default categories
  if (category.isDefault && req.body.name) {
    return next(new AppError('Cannot rename default categories', 400));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  successResponse(res, 200, category, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Prevent deleting default categories
  if (category.isDefault) {
    return next(new AppError('Cannot delete default categories', 400));
  }

  await category.deleteOne();

  successResponse(res, 200, null, 'Category deleted successfully');
});

// @desc    Get all available default categories
// @route   GET /api/v1/categories/defaults/list
// @access  Private
export const getDefaultCategories = catchAsync(async (req, res, next) => {
  successResponse(res, 200, defaultCategories, 'Default categories retrieved successfully');
});
