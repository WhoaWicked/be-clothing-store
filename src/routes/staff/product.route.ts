import { Router } from "express";
import * as productController from '../../controllers/staff/product.controller';
import { protect, staff } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
const router = Router();
const BASE_URL = '/staff/product';

router.get(`${BASE_URL}/list`, protect, staff, productController.getProducts);
router.get(`${BASE_URL}/list/:id`, protect, staff, productController.getProductById);
router.post(`${BASE_URL}/create`, protect, staff, upload.single('image'), productController.createProduct);
router.put(`${BASE_URL}/update/:id`, protect, staff, upload.single('image'), productController.updateProduct);
router.patch(`${BASE_URL}/update-status/:id`, protect, staff, productController.updateProductStatus);
router.delete(`${BASE_URL}/delete/:id`, protect, staff, productController.deleteProduct);

export default router;