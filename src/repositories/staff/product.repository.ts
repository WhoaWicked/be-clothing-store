import { query } from '../../config/db-middleware';
import { InsertProductValues, ProductById, ProductFilterParams, ProductList, UpdateProductValues } from '../../types/staff/product.type';

export const countProducts = async (filters: ProductFilterParams) => {
    const { product_code, product_name, category_name, gender_name } = filters;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    if (product_code) {
        conditions.push(`p.product_code ILIKE $${++paramCount}`);
        params.push(`%${product_code}%`)
    }
    if (product_name) {
        conditions.push(`p.product_name ILIKE $${++paramCount}`);
        params.push(`%${product_name}%`);
    }
    if (category_name) {
        conditions.push(`c.category_name ILIKE $${++paramCount}`);
        params.push(`%${category_name}%`);
    }
    if (gender_name) {
        conditions.push(`g.gender_name ILIKE $${++paramCount}`);
        params.push(`%${gender_name}%`);
    }
    let queryStr = `
    SELECT COUNT(*) AS total FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN genders g ON g.id = p.gender_id
    `;
    if (conditions.length > 0) {
        queryStr += `WHERE ${conditions.join(' AND ')}`;
    }
    const response = await query(queryStr, params);
    return parseInt(response.rows[0].total, 10);
}

export const findProducts = async (filters: ProductFilterParams): Promise<ProductList[]> => {
    const { page, limit, product_code, product_name, category_name, gender_name } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    if (product_code) {
        conditions.push(`p.product_code ILIKE $${++paramCount}`);
        params.push(`%${product_code}%`);
    }
    if (product_name) {
        conditions.push(`p.product_name ILIKE $${++paramCount}`);
        params.push(`%${product_name}%`);
    }
    if (category_name) {
        conditions.push(`c.category_name ILIKE $${++paramCount}`);
        params.push(`%${category_name}%`);
    }
    if (gender_name) {
        conditions.push(`g.gender_name ILIKE $${++paramCount}`);
        params.push(`%${gender_name}%`);
    }
    let queryStr = `
    SELECT
    p.id,
    p.product_code,
    p.product_name,
    p.category_id,
    c.category_name,
    p.gender_id,
    g.gender_name,
    p.description,
    p.base_price,
    p.image_path,
    p.best_seller,
    p.is_active,
    p.created_at
    FROM products p
    JOIN categories c
    ON c.id = p.category_id
    JOIN genders g
    ON g.id = p.gender_id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    const response = await query(queryStr, params);
    return response.rows;
}

export const findProductByName = async (product_name: string): Promise<ProductById> => {
    const queryStr: string = 'SELECT id, product_code, category_id, gender_id, product_name, description, base_price, image_path, best_seller, is_active, created_by, created_at FROM products WHERE product_name = $1';
    const response = await query(queryStr, [product_name]);
    return response.rows[0];
}

export const findProductById = async (id: number): Promise<ProductById> => {
    const queryStr: string = 'SELECT id, product_code, category_id, gender_id, product_name, description, base_price, image_path, best_seller, is_active, created_by, created_at FROM products WHERE id = $1';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const findProductByCode = async (product_code: string): Promise<ProductById> => {
    const queryStr: string = 'SELECT id FROM products WHERE product_code = $1';
    const response = await query(queryStr, [product_code]);
    return response.rows[0];
}

export const insertProduct = async (values: InsertProductValues) => {
    const queryStr: string = 'INSERT INTO products (product_code, category_id, gender_id, product_name, description, base_price, image_path, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);';
    await query(queryStr, [values.product_code, values.category_id, values.gender_id, values.product_name, values.description, values.base_price, values.image_path, values.created_by]);
    return;
}

export const updateProductById = async (values: UpdateProductValues, id: number) => {
    const queryStr: string = 'UPDATE products SET category_id = $1, gender_id = $2, product_name = $3, description = $4, base_price = $5, image_path = $6, best_seller = $7, is_active = $8, updated_by = $9, updated_at = NOW() WHERE id = $10;';
    await query(queryStr, [values.category_id, values.gender_id, values.product_name, values.description, values.base_price, values.image_path, values.best_seller, values.is_active, values.updated_by, id]);
    return;
}

export const deleteProductById = async (id: number) => {
    const queryStr: string = 'DELETE FROM products WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}

export const checkCategoryById = async (id: number) => {
    const queryStr: string = 'SELECT id FROM categories WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const checkGenderById = async (id: number) => {
    const queryStr: string = 'SELECT id FROM genders WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}