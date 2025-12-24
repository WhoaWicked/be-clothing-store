import { query } from '../../config/db-middleware';
import { ProductOverviewFilters } from '../../types/user/product.type';

export const countProducts = async (filters: ProductOverviewFilters) => {
    const { product_name, gender_name, category_name } = filters;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    conditions.push(`p.is_active = $${++paramCount}`);
    params.push(true);
    if (product_name) {
        conditions.push(`p.product_name ILIKE $${++paramCount}`);
        params.push(`%${product_name}%`);
    }
    if (category_name && Array.isArray(category_name) && category_name.length > 0) {
        conditions.push(`c.category_name IN (${category_name.map(() => `$${++paramCount}`).join(', ')})`);
        params.push(...category_name.map(name => name.toLowerCase()));
    }

    if (gender_name && Array.isArray(gender_name) && gender_name.length > 0) {
        conditions.push(`g.gender_name IN (${gender_name.map(() => `$${++paramCount}`).join(', ')})`);
        params.push(...gender_name.map(name => name.toLowerCase()));
    }
    let queryStr = `
    SELECT COUNT(*) AS total FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN genders g ON p.gender_id = g.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    const response = await query(queryStr, params);
    return parseInt(response.rows[0].total, 10);
}

export const findProducts = async (filters: ProductOverviewFilters) => {
    const { page, limit, product_name, gender_name, category_name } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 0;
    conditions.push(`p.is_active = $${++paramCount}`);
    params.push(true);
    if (product_name) {
        conditions.push(`p.product_name ILIKE $${++paramCount}`);
        params.push(`%${product_name}%`);
    }
    if (category_name && Array.isArray(category_name) && category_name.length > 0) {
        conditions.push(`c.category_name IN (${category_name.map(() => `$${++paramCount}`).join(', ')})`);
        params.push(...category_name.map(name => name.toLowerCase()));
    }

    if (gender_name && Array.isArray(gender_name) && gender_name.length > 0) {
        conditions.push(`g.gender_name IN (${gender_name.map(() => `$${++paramCount}`).join(', ')})`);
        params.push(...gender_name.map(name => name.toLowerCase()));
    }
    let queryStr = `
    SELECT
    p.id,
    p.product_name,
    p.product_code,
    c.category_name,
    g.gender_name,
    p.base_price,
    p.description,
    p.image_path,
    COALESCE(SUM(v.stock_quantity), 0) as total_stock,
    p.created_at
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
    JOIN categories c ON p.category_id = c.id
    JOIN genders g ON p.gender_id = g.id`;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += `
    GROUP BY
    p.id,
    p.product_name,
    p.product_code,
    c.category_name,
    g.gender_name,
    p.base_price,
    p.image_path
    ORDER BY p.created_at DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);
    const response = await query(queryStr, params);
    return response.rows;
}

export const findProductById = async (productId: number) => {
    const queryStr = 'SELECT * FROM products WHERE id = $1 AND is_active = $2';
    const params = [productId, true];
    const response = await query(queryStr, params);
    return response.rows[0];
}

export const findProductByCode = async (productCode: string) => {
    const queryStr = 'SELECT * FROM products WHERE product_code = $1 AND is_active = $2';
    const params = [productCode, true];
    const response = await query(queryStr, params);
    return response.rows[0];
}

export const findProductVariantByProductId = async (productId: number) => {
    const queryStr = 'SELECT id, product_id, size, sku_code, stock_quantity, created_at FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC;';
    const response = await query(queryStr, [productId]);
    return response.rows;
}