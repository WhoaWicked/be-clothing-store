import * as orderRepository from '../../repositories/user/order.repository';
import { query, pool } from '../../config/db-middleware';
import { createHttpError } from '../../exceptions/http.exception';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const placeOrder = async (userId: number, shippingAddress: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const cartItems = await orderRepository.checkCartItemsByUserId(client, userId);
        if (cartItems.length === 0) {
            throw createHttpError(400, 'ตะกร้าสินค้าว่างเปล่า');
        }
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.quantity > item.stock_quantity) {
                throw new Error(`${item.product_name} มีจำนวนในสต็อกไม่เพียงพอ`);
            }
            totalAmount += item.base_price * item.quantity;
        }
        const order_code = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const createOrder = await orderRepository.insertOrder(client, {
            userId,
            totalAmount,
            shippingAddress,
            order_code
        });
        const newOrderId = createOrder.id;
        for (const item of cartItems) {
            await orderRepository.insertOrderItems(
                client, {
                orderId: newOrderId,
                variantId: item.variant_id,
                quantity: item.quantity,
                unit_price: item.base_price
            });
            await orderRepository.updateProductVariantStock(
                client, {
                variantId: item.variant_id,
                newStockQuantity: item.quantity
            });
        }
        const lineItems = cartItems.map((item: any) => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.product_name
                    // images: [item.image_path],
                },
                unit_amount: Math.round(Number(item.base_price) * 100), // Stripe ใช้หน่วยสตางค์
            },
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/user/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/user/order/cancel`,
            metadata: {
                orderId: newOrderId,
                orderCode: order_code
            }
        });
        await orderRepository.updateOrderStripeSessionId(client, session.id, newOrderId);
        const checkUserCart = await orderRepository.findUserCartBeforeDelete(client, userId);
        if (!checkUserCart) {
            throw createHttpError(404, 'ไม่พบตะกร้าสินค้าของผู้ใช้');
        }
        await orderRepository.deleteUserCartItems(client, checkUserCart.id);
        await client.query('COMMIT');
        return { checkoutUrl: session.url };
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + (error as Error).message);
    } finally {
        client.release();
    }
}

export const repayOrder = async (orderId: number, userId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const existingOrder = await orderRepository.findOrderById(client, orderId, userId);
        if (!existingOrder) {
            throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการชำระเงินใหม่');
        }
        if (existingOrder.payment_status_id === 2) {
            throw createHttpError(400, 'คำสั่งซื้อนี้ชำระเงินแล้ว');
        }
        const order_code = existingOrder.order_code;
        const orderItems = await orderRepository.findOrderItemsByOrderId(client, orderId);
        const lineItems = orderItems.map((item: any) => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.product_name
                    // images: [item.image_path],
                },
                unit_amount: Math.round(Number(item.unit_price) * 100), // Stripe ใช้หน่วยสตางค์
            },
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/user/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/user/order/cancel`,
            metadata: {
                orderId: orderId,
                orderCode: order_code
            }
        });
        await orderRepository.updateOrderStripeSessionId(client, session.id, orderId);
        await client.query('COMMIT');
        return { checkoutUrl: session.url };
    } catch (error: unknown) {
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการชำระเงินคำสั่งซื้อ: ' + (error as Error).message);
    }
    finally {
        client.release();
    }
}

export const webhookProcess = async (rawBody: Buffer, signature: string, endpointSecret: string) => {
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            endpointSecret
        );
    } catch (error: unknown) {
        throw createHttpError(400, 'Webhook Error: ' + (error as Error).message);
    }
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCompleted(session);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        throw createHttpError(400, 'ไม่พบข้อมูลคำสั่งซื้อในเมตาดาต้า');
    }
    console.log(`กำลังอัปเดตสถานะคำสั่งซื้อ ID: ${orderId} เป็นชำระเงินแล้ว`);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await orderRepository.updateOrderStatusToPaid(client, Number(orderId));
        await client.query('COMMIT');
        console.log(`อัปเดตสถานะคำสั่งซื้อ ID: ${orderId} เป็นชำระเงินแล้ว`);
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการอัปเดตสถานะคำสั่งซื้อ');
    } finally {
        client.release();
    }
}

export const getOrderList = async (userId: number, orderStatusName: string | null) => {
    const orders = await orderRepository.findOrderListByUserId(userId, orderStatusName);
    return orders;
}

export const cancelUserOrder = async (orderId: number, userId: number, cancelledReason: string) => {
    const client = await pool.connect();
    const existingOrder = await orderRepository.findOrderById(client, orderId, userId);
    if (!existingOrder) {
        throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการยกเลิก');
    }
    if (existingOrder.order_status_id === 5) {
        throw createHttpError(400, 'คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว');
    }
    await orderRepository.cancelOrder(orderId, userId, cancelledReason);
    return;
}