import { Request, Response, NextFunction } from "express";
import * as reviewService from "../../services/user/review.service";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const sortType = req.query.sort as string || '';
        if (!productId || isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'รหัสสินค้าที่ส่งมาไม่ถูกต้อง'
            });
        }
        const response = await reviewService.getReviewsByProductId(productId, sortType);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลรีวิวสำเร็จ',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

export const createReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { productId, rating, comment } = req.body;
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลรีวิวไม่ครบถ้วน'
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5'
            });
        }
        const values = { productId, rating, comment };
        await reviewService.createReview(values, userId);
        res.status(201).json({
            success: true,
            message: 'สร้างรีวิวสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}

export const deleteReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const reviewId = Number(req.params.reviewId);
        if (!reviewId || isNaN(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'รหัสรีวิวที่ส่งมาไม่ถูกต้อง'
            });
        }
        await reviewService.deleteReview(reviewId, userId);
        res.status(200).json({
            success: true,
            message: 'ลบรีวิวสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}