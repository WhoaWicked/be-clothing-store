import { query } from "../../config/db-middleware";
import { CategoryFilterParams, CategoryList, InsertCategoryValues, UpdateCategoryValues } from "../../types/staff/category.type";

export const countCategories = async (filters: CategoryFilterParams) => {
    const { category_name, category_code } = filters;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    if (category_name) {
        conditions.push(`c.category_name ILIKE $${++paramCount}`);
        params.push(`%${category_name}%`);
    }
    if (category_code) {
        conditions.push(`c.category_code ILIKE $${++paramCount}`);
        params.push(`%${category_code}%`);
    }
    let queryStr = `SELECT COUNT(*) AS total FROM categories c LEFT JOIN users u ON c.created_by = u.id`;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    const response = await query(queryStr, params);
    return parseInt(response.rows[0].total, 10);
}

export const findCategories = async (filters: CategoryFilterParams): Promise<CategoryList[]> => {
    const { page, limit, category_name, category_code } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    if (category_name) {
        conditions.push(`category_name ILIKE $${++paramCount}`);
        params.push(`%${category_name}%`);
    }
    if (category_code) {
        conditions.push(`category_code ILIKE $${++paramCount}`);
        params.push(`%${category_code}%`);
    }
    let queryStr = `SELECT
    c.id AS category_id, 
    c.category_name, 
    c.category_code,
    c.is_active,
	CONCAT(u.first_name, ' ', u.last_name) as creator_name,
    c.created_by, 
    c.updated_at,
    c.created_at 
    FROM categories c
    LEFT JOIN users u ON c.created_by = u.id`;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += ` ORDER BY c.id DESC LIMIT $${++paramCount} OFFSET $${++paramCount};`;
    params.push(limit, offset);
    const response = await query(queryStr, params);
    return response.rows;
}

export const findCategoryById = async (id: number) => {
    const queryStr: string = `
    SELECT
    c.id AS category_id, 
    c.category_name, 
    c.category_code,
    c.is_active,
	CONCAT(u.first_name, ' ', u.last_name) as creator_name,
    c.created_by, 
    c.created_at 
    FROM categories c
    LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1;
    `;
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const findCategoryByName = async (name: string) => {
    const queryStr: string = 'SELECT id, category_name, category_code, created_by, created_at FROM categories WHERE category_name = $1;';
    const response = await query(queryStr, [name]);
    return response.rows[0];
}

export const findCategoryByCode = async (category_code: string) => {
    const queryStr: string = 'SELECT id, category_name, category_code, created_by, created_at FROM categories WHERE category_code = $1;';
    const response = await query(queryStr, [category_code]);
    return response.rows[0];
}

export const insertCategory = async (values: InsertCategoryValues) => {
    const queryStr: string = 'INSERT INTO categories (category_name, category_code, created_by) VALUES ($1, $2, $3);';
    await query(queryStr, [values.category_name, values.category_code, values.created_by]);
    return;
}

export const updateCategoryById = async (values: UpdateCategoryValues, id: number) => {
    const queryStr: string = 'UPDATE categories SET category_name = $1, is_active = $2, updated_by = $3, updated_at = NOW() WHERE id = $4;';
    await query(queryStr, [values.category_name, values.is_active, values.updated_by, id]);
    return;
}

export const deleteCategoryById = async (id: number) => {
    const queryStr: string = 'DELETE FROM categories WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}