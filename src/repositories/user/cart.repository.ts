import { query } from '../../config/db-middleware';

export const findCartById = async (cartId: number) => {
    const queryStr = 'SELECT * FROM carts WHERE id = $1';
    const response = await query(queryStr, [cartId]);
    return response.rows[0];
}

export const findCartByUserId = async (userId: number) => {
    const queryStr = 'SELECT * FROM carts WHERE user_id = $1';
    const response = await query(queryStr, [userId]);
    return response.rows[0];
}

export const insertCart = async (userId: number) => {
    const queryStr = 'INSERT INTO carts (user_id) VALUES ($1) RETURNING *';
    const response = await query(queryStr, [userId]);
    return response.rows[0];
}

export const deleteCartById = async (cartId: number) => {
    const queryStr = 'DELETE FROM carts WHERE id = $1';
    await query(queryStr, [cartId]);
    return;
}

export const checkProductStock = async (cartId: number, variantId: number) => {
    const queryStr = `
    SELECT
    pv.stock_quantity,
    p.is_active,
    COALESCE(ci.quantity, 0) AS current_cart_quantity
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    LEFT JOIN cart_items ci ON ci.variant_id = pv.id AND ci.cart_id = $1
    WHERE pv.id = $2
    `;
    const response = await query(queryStr, [cartId, variantId]);
    return response.rows[0];
}

export const upsertCartItemQuantity = async (cartId: number, variantId: number, quantity: number) => {
    const queryStr = `
    INSERT INTO cart_items (cart_id, variant_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (cart_id, variant_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    RETURNING *;
    `;
    const response = await query(queryStr, [cartId, variantId, quantity]);
    return response.rows[0]
}

export const findMyCartItemsByUserId = async (userId: number) => {
    const queryStr = `
    SELECT
    ci.id AS item_id,
    ci.quantity,
    p.product_name,
    p.image_path,
    p.base_price,
    pv.size,
    pv.stock_quantity AS max_stock,
    (p.base_price * ci.quantity) AS total_item_price
    FROM cart_items ci
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p ON p.id = pv.product_id
    JOIN carts c ON c.id = ci.cart_id
    WHERE c.user_id = $1
    ORDER BY ci.created_at ASC;
    `;
    const response = await query(queryStr, [userId]);
    return response.rows;
}

export const findCartItemForUpdate = async (userId: number, cartItemId: number) => {
    const queryStr = `
    SELECT
    ci.id,
    pv.stock_quantity,
    p.product_name
    FROM cart_items ci
    JOIN carts c ON c.id = ci.cart_id
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE ci.id = $1 AND c.user_id = $2
    `;
    const response = await query(queryStr, [cartItemId, userId]);
    return response.rows[0];
}

export const updateCartItemQuantity = async (cartItemId: number, newQuantity: number) => {
    const queryStr = `
    UPDATE cart_items
    SET quantity = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, quantity;
    `;
    const response = await query(queryStr, [newQuantity, cartItemId]);
    return response.rows[0]
}

export const deleteCartItem = async (userId: number, cartItemId: number) => {
    const queryStr = `
    DELETE FROM cart_items
    USING carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = $1
    AND cart_items.id = $2
    RETURNING cart_items.id;`;
    const response = await query(queryStr, [userId, cartItemId]);
    return response.rows[0];
}