import { query } from '../../config/db-middleware';
import { PoolClient } from 'pg';

export const checkCartItemsByUserId = async (client: PoolClient, userId: number) => {
    const queryStr = `
    SELECT 
    ci.variant_id, 
    ci.quantity, 
    pv.stock_quantity, 
    pv.sku_code,
    p.product_name, 
    p.base_price,
    p.image_path
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE c.user_id = $1;
    `;
    const response = await client.query(queryStr, [userId]);
    return response.rows;
}

export const insertOrder = async (client: PoolClient, values: any) => {
    const { userId, totalAmount, shippingAddress, order_code } = values;
    const queryStr = `
    INSERT INTO orders (
    user_id, 
    order_status_id, 
    payment_status_id, 
    total_amount, 
    shipping_address, 
    order_code
    ) VALUES ($1, 1, 1, $2, $3, $4)
    RETURNING id
    `;
    const response = await client.query(queryStr, [userId, totalAmount, shippingAddress, order_code]);
    return response.rows[0];
}

export const insertOrderItems = async (client: PoolClient, values: any) => {
    const { orderId, variantId, quantity, unit_price } = values;
    const queryStr = `
    INSERT INTO order_items (
    order_id, variant_id, quantity, unit_price)
    VALUES ($1, $2, $3, $4)
    `;
    const response = await client.query(queryStr, [orderId, variantId, quantity, unit_price]);
    return;
}

export const updateProductVariantStock = async (client: PoolClient, values: any) => {
    const { variantId, newStockQuantity } = values;
    const queryStr = `
    UPDATE product_variants
    SET stock_quantity = stock_quantity - $2
    WHERE id = $1
    `;
    const response = await client.query(queryStr, [variantId, newStockQuantity]);
    return;
}

export const updateOrderStripeSessionId = async (client: PoolClient, sessionId: string, orderId: number) => {
    const queryStr = `
    UPDATE orders
    SET payment_intent_id = $1
    WHERE id = $2;
    `;
    const response = await client.query(queryStr, [sessionId, orderId]);
    return;
}

export const findUserCartBeforeDelete = async (client: PoolClient, userId: number) => {
    const queryStr = 'SELECT id FROM carts WHERE user_id = $1';
    const response = await client.query(queryStr, [userId]);
    return response.rows[0];
}

export const deleteUserCartItems = async (client: PoolClient, cartId: number) => {
    const queryStr = 'DELETE FROM cart_items WHERE cart_id = $1';
    const response = await client.query(queryStr, [cartId]);
    return;
}

export const updateOrderStatusToPaid = async (client: PoolClient, orderId: number) => {
    const queryStr = `
    UPDATE orders
    SET order_status_id = 2, payment_status_id = 2
    WHERE id = $1
    `;
    await client.query(queryStr, [orderId]);
    return;
}