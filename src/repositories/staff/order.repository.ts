import { query } from '../../config/db-middleware';
import { PoolClient } from "pg";

export const countOrdersByStatus = async (filters: any) => {
    const { status_name, search_global, start_date, end_date } = filters;
    const conditions = [];
    const params: any[] = [];
    let paramCount = 0;
    if (status_name) {
        conditions.push(`os.status_name = $${++paramCount}`);
        params.push(status_name);
    }
    if (search_global) {
        paramCount++;
        conditions.push(`(
            o.order_code      ILIKE $${paramCount} OR
            u.first_name      ILIKE $${paramCount} OR
            u.last_name       ILIKE $${paramCount} OR
            o.shipping_address->>'phone' ILIKE $${paramCount} OR
            o.tracking_number ILIKE $${paramCount}
            )`);
        params.push(`%${search_global}%`);
    }
    if (start_date && end_date) {
        conditions.push(`o.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
        params.push(start_date, end_date);
    }
    let queryStr = `
    SELECT
    COUNT(*) AS total
    FROM orders o
    LEFT JOIN payment_statuses ps ON o.payment_status_id = ps.id
    LEFT JOIN order_statuses os ON o.order_status_id = os.id
    LEFT JOIN users u ON o.user_id = u.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    const { rows } = await query(queryStr, params);
    return Number(rows[0].total);
}

export const findOrderListByStatus = async (filters: any) => {
    const { page, limit, status_name, search_global, start_date, end_date, sort_type } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params: any[] = [];
    let paramCount = 0;
    if (status_name) {
        conditions.push(`os.status_name = $${++paramCount}`);
        params.push(status_name);
    }
    if (search_global) {
        paramCount++;
        conditions.push(`(
            o.order_code      ILIKE $${paramCount} OR
            u.first_name      ILIKE $${paramCount} OR
            u.last_name       ILIKE $${paramCount} OR
            o.shipping_address->>'phone' ILIKE $${paramCount} OR
            o.tracking_number ILIKE $${paramCount}
            )`);
        params.push(`%${search_global}%`);
    }
    if (start_date && end_date) {
        conditions.push(`o.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
        params.push(start_date, end_date);
    }
    let sortClause = 'o.created_at DESC';
    switch (sort_type) {
        case 'oldest':
            sortClause = 'o.created_at ASC';
            break;
        case 'price_high':
            sortClause = 'o.total_amount DESC';
            break;
        case 'price_low':
            sortClause = 'o.total_amount ASC';
            break;
        case 'newest':
        default:
            sortClause = 'o.created_at DESC';
    }
    let queryStr = `
    SELECT
    o.id AS order_id,
    o.order_code,
    o.total_amount,
    os.status_name AS order_status,
    ps.status_name AS payment_status,
    o.shipping_address,
    o.tracking_number,
    CONCAT (u.first_name, ' ', u.last_name) AS customer_name,
    u.phone AS customer_phone,
    o.cancelled_reason,
    CONCAT (cu.first_name, ' ', cu.last_name) AS cancelled_by_name,
    o.cancelled_at,
    o.cancelled_by,
    o.created_by,
    o.created_at,
    COALESCE(
    json_agg(
        json_build_object(
            'variant_id', pv.id,
            'name', p.product_name,
            'product_code', p.product_code,
            'sku_code', pv.sku_code,
            'image_path', p.image_path,
            'size', pv.size,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', (oi.quantity * oi.unit_price)
        )
    ) FILTER(WHERE oi.id IS NOT NULL),'[]') AS items
    FROM orders o
    LEFT JOIN payment_statuses ps ON o.payment_status_id = ps.id
    LEFT JOIN order_statuses os ON o.order_status_id = os.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN users cu ON o.cancelled_by = cu.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += `
    GROUP BY o.id, os.status_name, ps.status_name, u.id, cu.id
    ORDER BY ${sortClause} LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    const { rows } = await query(queryStr, params);
    return rows;
}

export const findOrderById = async (orderId: number) => {
    const queryStr = `
    SELECT
    o.id AS order_id,
    o.order_code,
    o.total_amount,
    os.status_name AS order_status,
    ps.status_name AS payment_status,
    o.shipping_address,
    o.tracking_number,
    CONCAT (u.first_name, ' ', u.last_name) AS customer_name,
    o.cancelled_reason,
    CONCAT (cu.first_name, ' ', cu.last_name) AS cancelled_by_name,
    o.cancelled_at,
    o.cancelled_by,
    o.created_by,
    o.created_at,
    COALESCE(
    json_agg(
        json_build_object(
            'variant_id', pv.id,
            'name', p.product_name,
            'image_path', p.image_path,
            'size', pv.size,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', (oi.quantity * oi.unit_price)
        )
    ) FILTER(WHERE oi.id IS NOT NULL),'[]') AS items
    FROM orders o
    LEFT JOIN payment_statuses ps ON o.payment_status_id = ps.id
    LEFT JOIN order_statuses os ON o.order_status_id = os.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN users cu ON o.cancelled_by = cu.id
	WHERE o.id = $1
	GROUP BY o.id, os.status_name, ps.status_name, u.id, cu.id;
    `;
    const { rows } = await query(queryStr, [orderId]);
    return rows[0];
}


export const updateCancelledStatus = async (orderId: number, cancelledReason: string, cancelledBy: number) => {
    const queryStr = `
    UPDATE orders
    SET
        order_status_id = 5,
        cancelled_reason = $1,
        cancelled_at = NOW(),
        cancelled_by = $2
        WHERE id = $3;
    `;
    await query(queryStr, [cancelledReason, cancelledBy, orderId]);
    return;
}

export const updateShippedStatus = async (orderId: number, trackingNumber: string, updatedBy: number) => {
    const queryStr = `
    UPDATE  orders
    SET
        order_status_id = 3,
        tracking_number = $1,
        updated_by = $2,
        updated_at = NOW()
        WHERE id = $3;
    `;
    await query(queryStr, [trackingNumber, updatedBy, orderId]);
    return;
}

export const updateDeliveredStatus = async (orderId: number, updatedBy: number) => {
    const queryStr = `
    UPDATE orders
    SET
        order_status_id = 4,
        updated_by = $2,
        updated_at = NOW()
        WHERE id = $1;
    `;
    await query(queryStr, [orderId, updatedBy]);
    return;
}

export const findOrderByTrackingNumber = async (trackingNumber: string) => {
    const queryStr = 'SELECT 1 FROM orders WHERE tracking_number = $1;';
    const { rows } = await query(queryStr, [trackingNumber]);
    return rows[0];
}
