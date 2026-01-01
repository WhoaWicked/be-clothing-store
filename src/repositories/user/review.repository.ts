import { query } from '../../config/db-middleware';

export const findReviewsByProductId = async (productId: number, sortType: string) => {
    let queryStr = `
        SELECT
        r.id AS review_id,
        r.product_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
    `;

    switch (sortType) {
        case 'oldest':
            queryStr += ' ORDER BY r.created_at ASC';
            break;
        case 'highest':
            queryStr += ' ORDER BY r.rating DESC';
            break;
        case 'lowest':
            queryStr += ' ORDER BY r.rating ASC';
            break;
        default:
            queryStr += ' ORDER BY r.created_at DESC';
    }

    const response = await query(queryStr, [productId]);
    return response.rows;
}

export const findReviewById = async (reviewId: number, userId: number) => {
    const queryStr = 'SELECT * FROM reviews WHERE id = $1 AND user_id = $2';
    const response = await query(queryStr, [reviewId, userId]);
    return response.rows[0];
}

export const insertReview = async (values: any, userId: number) => {
    const { productId, rating, comment } = values;
    const queryStr = `
    INSERT INTO reviews (product_id, user_id, rating, comment)
    VALUES ($1, $2, $3, $4);
    `;
    await query(queryStr, [productId, userId, rating, comment]);
    return;
}

export const deleteReviewById = async (reviewId: number, userId: number) => {
    const queryStr = `
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2;
    `;
    await query(queryStr, [reviewId, userId]);
    return;
}