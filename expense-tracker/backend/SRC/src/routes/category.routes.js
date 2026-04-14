import express from 'express';
import {
  initializeCategories,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getDefaultCategories,
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, categorySchema } from '../middleware/validation.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/init', initializeCategories);
router.get('/defaults/list', getDefaultCategories);
router
  .route('/')
  .get(getCategories)
  .post(validate(categorySchema), createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(validate(categorySchema), updateCategory)
  .delete(deleteCategory);

export default router;
