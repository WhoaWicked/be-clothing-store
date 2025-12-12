import { Router } from "express";
import * as categoryController from '../../controllers/staff/category.controller';
import { protect, staff } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/staff/category';

router.get(`${BASE_URL}/list`, protect, staff, categoryController.getCategories);
router.get(`${BASE_URL}/list/:id`, protect, staff, categoryController.getCategoryById);
router.post(`${BASE_URL}/create`, protect, staff, categoryController.createCategory);
router.put(`${BASE_URL}/update/:id`, protect, staff, categoryController.updateCategory);
router.delete(`${BASE_URL}/delete/:id`, protect, staff, categoryController.deleteCategory);

export default router;