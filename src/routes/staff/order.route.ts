import * as orderController from '../../controllers/staff/order.controller';
import { Router } from 'express';
import { protect, staff } from '../../middlewares/auth.middleware';
const router = Router();
const BASE_URL = '/staff/order';

router.get(`${BASE_URL}/list`, protect, staff, orderController.getOrderList);
router.patch(`${BASE_URL}/cancelled/:orderId`, protect, staff, orderController.cancelledOrder);
router.patch(`${BASE_URL}/shipped/:orderId`, protect, staff, orderController.shippedOrder);
router.patch(`${BASE_URL}/delivered/:orderId`, protect, staff, orderController.deliveredOrder);

export default router;