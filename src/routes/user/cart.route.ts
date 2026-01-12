import { Router } from "express";
import * as cartController from '../../controllers/user/cart.controller';
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/cart';

router.put(`${BASE_URL}/upsert`, protect, cartController.upsertCart);
router.get(`${BASE_URL}`, protect, cartController.getCartItems);
router.put(`${BASE_URL}/update/:cartItemId`, protect, cartController.updateCartItemQuantity);
router.delete(`${BASE_URL}/delete/:cartItemId`, protect, cartController.removeCartItem);

export default router;