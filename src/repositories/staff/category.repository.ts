import { query } from "../../config/db-middleware";
import { InsertCategoryValues, UpdateCategoryValues } from "../../types/staff/category.type";

export const countCategories = async () => {
    const queryStr: string = 'SELECT COUNT(*) AS total FROM categories';
    const response = await query(queryStr);
    return parseInt(response.rows[0].total, 10);
}

export const findCategories = async (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const queryStr: string = 'SELECT id, name, slug, category_code, created_by, created_at FROM categories ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const response = await query(queryStr, [limit, offset]);
    return response.rows;
}

export const findCategoryById = async (id: number) => {
    const queryStr: string = 'SELECT id, name, slug, category_code, created_by, created_at FROM categories WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const findCategoryByName = async (name: string) => {
    const queryStr: string = 'SELECT id, name, slug, category_code, created_by, created_at FROM categories WHERE name = $1;';
    const response = await query(queryStr, [name]);
    return response.rows[0];
}

export const findCategoryBySlug = async (slug: string) => {
    const queryStr: string = 'SELECT id, name, slug, category_code, created_by, created_at FROM categories WHERE slug = $1;';
    const response = await query(queryStr, [slug]);
    return response.rows[0];
}

export const findCategoryByCode = async (category_code: string) => {
    const queryStr: string = 'SELECT id, name, slug, category_code, created_by, created_at FROM categories WHERE category_code = $1;';
    const response = await query(queryStr, [category_code]);
    return response.rows[0];
}

export const insertCategory = async (values: InsertCategoryValues) => {
    const queryStr: string = 'INSERT INTO categories (name, slug, category_code, created_by) VALUES ($1, $2, $3, $4);';
    await query(queryStr, [values.name, values.slug, values.category_code, values.created_by]);
    return;
}

export const updateCategoryById = async (values: UpdateCategoryValues, id: number) => {
    const queryStr: string = 'UPDATE categories SET name = $1, slug = $2, updated_by = $3, updated_at = NOW() WHERE id = $4;';
    await query(queryStr, [values.name, values.slug, values.updated_by, id]);
    return;
}

export const deleteCategoryById = async (id: number) => {
    const queryStr: string = 'DELETE FROM categories WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}