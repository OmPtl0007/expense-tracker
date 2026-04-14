import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, transactionSchema, validateQuery } from '../middleware/validation.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(validateQuery, getTransactions)
  .post(validate(transactionSchema), createTransaction);

router.route('/stats/overview').get(getTransactionStats);

router
  .route('/:id')
  .get(getTransaction)
  .put(validate(transactionSchema), updateTransaction)
  .delete(deleteTransaction);

export default router;
