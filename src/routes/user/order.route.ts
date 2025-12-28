import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import * as orderController from '../../controllers/user/order.controller';
const router = Router();
const BASE_URL = '/user/order';

router.post(`${BASE_URL}/place-order`, protect, orderController.createOrder);
router.get(`${BASE_URL}/list`, protect, orderController.getOrderList);
router.put(`${BASE_URL}/cancel/:orderId`, protect, orderController.cancelOrder);

export default router;
