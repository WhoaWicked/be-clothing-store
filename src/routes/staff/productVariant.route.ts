import { Router } from "express";
import * as productVariantController from '../../controllers/staff/productVariant.controller';
import { protect, staff } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/staff/variant';

router.get(`${BASE_URL}/:id`, protect, staff, productVariantController.getProductVariantById);
router.get(`${BASE_URL}/product/:productId`, protect, staff, productVariantController.getProductVariantsByProductId);
router.post(`${BASE_URL}/create`, protect, staff, productVariantController.createProductVariant);
router.put(`${BASE_URL}/update/:id`, protect, staff, productVariantController.updateProductVariant);
router.delete(`${BASE_URL}/delete/:id`, protect, staff, productVariantController.deleteProductVariant);
export default router;