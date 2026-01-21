import { query } from '../../config/db-middleware';
import { InsertProductValues, ProductById, ProductFilterParams, ProductList, UpdateProductValues } from '../../types/staff/product.type';
import { PoolClient } from 'pg';

export const countProducts = async (filters: ProductFilterParams) => {
    const { product_code, product_name, category_name, gender_name } = filters;
    const conditions = ['p.deleted_at is NULL'];
    const params: any[] = [];
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
    SELECT
    COUNT(*) AS total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN genders g ON p.gender_id = g.id
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
    const conditions = ['p.deleted_at is NULL'];
    const params: any[] = [];
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
    p.id AS product_id,
    p.product_code,
    p.category_id,
    c.category_name,
    p.gender_id,
    g.gender_name,
    p.product_name,
    p.description,
    p.base_price,
    p.image_path,
    p.best_seller,
    p.is_active,
    p.created_by,
    CONCAT(first_name, ' ', last_name) AS creator_name,
    p.created_at,
    COALESCE ( SUM ( pv.stock_quantity ), 0 ) AS sum_stock_quantity,
    COALESCE (
        json_agg (
            json_build_object (
                'id', pv.id,
                'sku_code', pv.sku_code,
                'size', pv.size,
                'stock_quantity', pv.stock_quantity
            ) ORDER BY pv.id
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'
    ) AS variants
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN genders g ON p.gender_id = g.id
    LEFT JOIN users u ON p.created_by = u.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += ` 
    GROUP BY
    p.id,
    p.product_code,
    p.category_id,
    c.category_name,
    p.gender_id,
    g.gender_name,
    p.product_name,
    p.description,
    p.base_price,
    p.image_path,
    p.best_seller,
    p.is_active,
    p.created_by,
    u.first_name,
    u.last_name,
    p.created_at
    ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
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
    const queryStr: string = `
    SELECT
    p.id AS product_id,
    p.product_code,
    p.category_id,
    c.category_name,
    p.gender_id,
    g.gender_name,
    p.product_name,
    p.description,
    p.base_price,
    p.image_path,
    p.best_seller,
    p.is_active,
    p.created_by,
    CONCAT(first_name, ' ', last_name) AS creator_name,
    p.created_at,
    COALESCE ( SUM ( pv.stock_quantity ), 0 ) AS sum_stock_quantity,
    COALESCE (
        json_agg (
            json_build_object (
                'id', pv.id,
                'sku_code', pv.sku_code,
                'size', pv.size,
                'stock_quantity', pv.stock_quantity
            ) ORDER BY pv.id
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'
    ) AS variants
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN genders g ON p.gender_id = g.id
    LEFT JOIN users u ON p.created_by = u.id
	WHERE p.id = $1 AND p.deleted_at IS NULL
	GROUP BY
    p.id,
    p.product_code,
    p.category_id,
    c.category_name,
    p.gender_id,
    g.gender_name,
    p.product_name,
    p.description,
    p.base_price,
    p.image_path,
    p.best_seller,
    p.is_active,
    p.created_by,
    u.first_name,
    u.last_name,
    p.created_at
    `;
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const findProductByCode = async (product_code: string): Promise<ProductById> => {
    const queryStr: string = 'SELECT id FROM products WHERE product_code = $1';
    const response = await query(queryStr, [product_code]);
    return response.rows[0];
}

export const insertProduct = async (client: PoolClient, values: InsertProductValues): Promise<{ id: number }> => {
    const queryStr: string = 'INSERT INTO products (product_code, category_id, gender_id, product_name, description, base_price, image_path, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';
    const response = await client.query(queryStr, [values.product_code, values.category_id, values.gender_id, values.product_name, values.description, values.base_price, values.image_path, values.created_by]);
    return response.rows[0];
}

export const updateProductById = async (client: PoolClient, values: UpdateProductValues, id: number) => {
    const queryStr: string = 'UPDATE products SET category_id = $1, gender_id = $2, product_name = $3, description = $4, base_price = $5, image_path = $6, best_seller = $7, is_active = $8, updated_by = $9, updated_at = NOW() WHERE id = $10;';
    await client.query(queryStr, [values.category_id, values.gender_id, values.product_name, values.description, values.base_price, values.image_path, values.best_seller, values.is_active, values.updated_by, id]);
    return;
}

export const updateProductStatusById = async (client: PoolClient, is_active: boolean, id: number, updated_by: number) => {
    const queryStr: string = 'UPDATE products SET is_active = $1, updated_by = $2, updated_at = NOW() WHERE id = $3;';
    await client.query(queryStr, [is_active, updated_by, id]);
    return;
}

export const deleteProductById = async (client: PoolClient, productId: number) => {
    const queryStr: string = 'DELETE FROM products WHERE id = $1;';
    await client.query(queryStr, [productId]);
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

export const checkProductOrdered = async (productId: number) => {
    const queryStr: string = `
    SELECT 1 FROM order_items os
    JOIN product_variants pv ON os.variant_id = pv.id
    WHERE pv.product_id = $1
    LIMIT 1
    `;
    const response = await query(queryStr, [productId]);
    return response.rows[0];
}

export const deleteProduct = async (client: PoolClient, productId: number) => {
    const queryStr: string = 'UPDATE products SET deleted_at = NOW() WHERE id = $1;';
    await client.query(queryStr, [productId]);
    return;
}

export const deleteVariants = async (client: PoolClient, productId: number) => {
    const queryStr: string = 'UPDATE product_variants SET deleted_at = NOW() WHERE product_id = $1;';
    await client.query(queryStr, [productId]);
    return;
}