import { query } from '../../config/db-middleware';

export const findGenders = async () => {
    const queryStr = 'SELECT id, gender_name FROM genders ORDER BY created_at DESC';
    const response = await query(queryStr);
    return response.rows;
}

export const findCategories = async () => {
    const queryStr = 'SELECT id, category_name FROM categories ORDER BY created_at DESC';
    const response = await query(queryStr);
    return response.rows;
}