import * as orderRepository from '../../repositories/staff/order.repository';
import { pool } from '../../config/db-middleware';
import { createHttpError } from '../../exceptions/http.exception';
import { generateTrackingNumber } from '../../utils/order.utill';

export const getOrderList = async (filters: any) => {
    const { page, limit } = filters;
    const [orders, totalItems] = await Promise.all([
        orderRepository.findOrderListByStatus(filters),
        orderRepository.countOrdersByStatus(filters)
    ]);

    if (orders.length === 0) {
        return {
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            },
            orders: []
        }
    }
    return {
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        },
        orders
    }
}

export const cancelledOrder = async (orderId: number, cancelledReason: string, staffId: number) => {
    const existingOrder = await orderRepository.findOrderById(orderId);
    if (!existingOrder) {
        throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการยกเลิก');
    }
    await orderRepository.updateCancelledStatus(orderId, cancelledReason, staffId);
    return;
}

export const shippedOrder = async (orderId: number, updatedBy: number) => {
    const existingOrder = await orderRepository.findOrderById(orderId);
    if (!existingOrder) {
        throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการจัดส่ง');
    }
    const trackingNumber = await generateTrackingNumber();
    await orderRepository.updateShippedStatus(orderId, trackingNumber, updatedBy);
    return;
}

export const deliveredOrder = async (orderId: number, updatedBy: number) => {
    const existingOrder = await orderRepository.findOrderById(orderId);
    if (!existingOrder) {
        throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการเปลี่ยนสถานะเป็นจัดส่งแล้ว');
    }
    await orderRepository.updateDeliveredStatus(orderId, updatedBy);
    return;
}