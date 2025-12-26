import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import * as orderController from '../../controllers/user/order.controller';
const router = Router();
const BASE_URL = '/user/order';

router.post(`${BASE_URL}/place-order`, protect, orderController.createOrder);

export default router;
