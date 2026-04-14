import express from 'express';
import {
  getMonthlySummary,
  getYearlySummary,
  getTrends,
  getCategoryComparison,
  getDashboardOverview,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/dashboard', getDashboardOverview);
router.get('/monthly', getMonthlySummary);
router.get('/yearly', getYearlySummary);
router.get('/trends', getTrends);
router.get('/category-comparison', getCategoryComparison);

export default router;
