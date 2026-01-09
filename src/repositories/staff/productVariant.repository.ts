import { query } from '../../config/db-middleware';
import { InsertVariantValues, UpdateVariantValues } from '../../types/staff/productVariant.type';
import { PoolClient } from 'pg';

export const findProductVariantById = async (id: number) => {
    const queryStr: string = 'SELECT * FROM product_variants WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const findProductVariantsByProductId = async (productId: number) => {
    const queryStr: string = 'SELECT * FROM product_variants WHERE product_id = $1;';
    const response = await query(queryStr, [productId]);
    return response.rows;
}

export const findProductVariantsByProductIdAndId = async (productId: number, id: number) => {
    const queryStr: string = 'SELECT * FROM product_variants WHERE product_id = $1 AND id = $2;';
    const response = await query(queryStr, [productId, id]);
    return response.rows[0];
}

export const findProductVariantByProductIdAndSize = async (productId: number, size: string) => {
    const queryStr: string = 'SELECT * FROM product_variants WHERE product_id = $1 AND size = $2;';
    const response = await query(queryStr, [productId, size]);
    return response.rows[0];
}

export const insertProductVariant = async (client: PoolClient, values: InsertVariantValues) => {
    const queryStr: string = 'INSERT INTO product_variants (product_id, sku_code, size, stock_quantity, created_by) VALUES ($1, $2, $3, $4, $5);';
    await client.query(queryStr, [values.product_id, values.sku_code, values.size, values.stock_quantity, values.created_by]);
    return;
}

export const updateProductVariantById = async (client: PoolClient, values: UpdateVariantValues, id: number) => {
    const queryStr: string = 'UPDATE product_variants SET stock_quantity = $1, updated_by = $2, updated_at = NOW() WHERE id = $3;';
    await client.query(queryStr, [values.stock_quantity, values.updatedBy, id]);
    return;
}

export const deleteProductVariantById = async (id: number) => {
    const queryStr: string = 'DELETE FROM product_variants WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}