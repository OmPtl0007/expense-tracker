import Joi from 'joi';
import AppError from '../utils/AppError.js';

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Transaction validation schemas
export const transactionSchema = Joi.object({
  amount: Joi.number().min(0.01).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().hex().length(24).required(),
  description: Joi.string().max(500).allow('', null),
  date: Joi.date().iso(),
});

// Category validation schemas
export const categorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('income', 'expense').required(),
  icon: Joi.string().allow('', null),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
});

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new AppError(messages.join(', '), 400));
    }

    next();
  };
};

// Query validation for filtering
export const validateQuery = (req, res, next) => {
  const allowedQueryParams = ['type', 'category', 'startDate', 'endDate', 'page', 'limit', 'sort'];
  const invalidParams = Object.keys(req.query).filter(
    (param) => !allowedQueryParams.includes(param)
  );

  if (invalidParams.length > 0) {
    return next(new AppError(`Invalid query parameters: ${invalidParams.join(', ')}`, 400));
  }

  next();
};
