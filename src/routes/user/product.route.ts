import { Router } from "express";
import * as productController from '../../controllers/user/product.controller';
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/product';

router.get(`${BASE_URL}/list`, protect, productController.getProducts);

export default router;