import { Router } from "express";
import * as reviewController from "../../controllers/user/review.controller";
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/user/review';

router.get(`${BASE_URL}/product/:productId`, reviewController.getReviews);
router.post(`${BASE_URL}/create`, protect, reviewController.createReview);
router.delete(`${BASE_URL}/delete/:reviewId`, protect, reviewController.deleteReview);

export default router;