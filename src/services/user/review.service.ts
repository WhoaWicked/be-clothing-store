import * as reviewRepository from '../../repositories/user/review.repository';
import { createHttpError } from '../../exceptions/http.exception';

export const getReviewsByProductId = async (productId: number, sortType: string) => {
    const reviews = await reviewRepository.findReviewsByProductId(productId, sortType);
    return reviews;
}

export const createReview = async (values: any, userId: number) => {
    await reviewRepository.insertReview(values, userId);
    return;
}

export const deleteReview = async (reviewId: number, userId: number) => {
    const existReview = await reviewRepository.findReviewById(reviewId, userId);
    if (!existReview) {
        throw createHttpError(404, 'ไม่พบรีวิวที่ต้องการลบ');
    }
    await reviewRepository.deleteReviewById(reviewId, userId);
    return;
}