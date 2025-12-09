import { query } from '../../config/db-middleware';
import { InsertProductValues, UpdateProductValues } from '../../types/staff/product.type';

export const countProducts = async () => {
    const queryStr: string = 'SELECT COUNT(*) AS total FROM products';
    const response = await query(queryStr);
    return parseInt(response.rows[0].total, 10);
}

export const findProducts = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;
    const queryStr: string = 'SELECT id, category_id, name, description, base_price, image_path, is_active, created_by, created_at FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const response = await query(queryStr, [limit, offset]);
    return response.rows;
}

export const findProductByName = async (name: string) => {
    const queryStr: string = 'SELECT id, category_id, name, description, base_price, image_path, is_active, created_by, created_at FROM products WHERE name = $1';
    const response = await query(queryStr, [name]);
    return response.rows[0];
}

export const findProductById = async (id: number) => {
    const queryStr: string = 'SELECT id, category_id, name, description, base_price, image_path, is_active, created_by, created_at FROM products WHERE id = $1';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const insertProduct = async (values: InsertProductValues) => {
    const queryStr: string = 'INSERT INTO products (category_id, name, description, base_price, image_path, created_by) VALUES ($1, $2, $3, $4, $5, $6);';
    await query(queryStr, values);
    return;
}

export const updateProductById = async (values: UpdateProductValues, id: number) => {
    const queryStr: string = 'UPDATE products SET category_id = $1, name = $2, description = $3, base_price = $4, image_path = $5, is_active = $6, updated_by = $7, updated_at = NOW() WHERE id = $8;';
    await query(queryStr, [values.category_id, values.name, values.description, values.base_price, values.image_path, values.is_active, values.updated_by, id]);
    return;
}

export const deleeteProductById = async (id: number) => {
    const queryStr: string = 'DELETE FROM products WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}

export const checkCategoryById = async (id: number) => {
    const queryStr: string = 'SELECT id FROM categories WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}