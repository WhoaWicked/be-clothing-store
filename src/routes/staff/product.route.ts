import { Router } from "express";
import * as productController from '../../controllers/staff/product.controller';
import { protect, staff } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/staff/products';

router.get(`${BASE_URL}/list`, protect, staff, productController.getProducts);
router.get(`${BASE_URL}/list/:id`, protect, staff, productController.getProductById);
router.post(`${BASE_URL}/create`, protect, staff, productController.createProduct);
router.put(`${BASE_URL}/update/:id`, protect, staff, productController.updateProduct);
router.delete(`${BASE_URL}/delete/:id`, protect, staff, productController.deleteProduct);

export default router;