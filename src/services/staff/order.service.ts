import * as orderRepository from '../../repositories/staff/order.repository';
import { pool } from '../../config/db-middleware';
import { createHttpError } from '../../exceptions/http.exception';
import { generateTrackingNumber } from '../../utils/order.utill';
import { logActivity } from '../../utils/logger.util';

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

export const cancelledOrder = async (orderId: number, cancelledReason: string, staffId: number, userContext: any) => {
    try {
        const existingOrder = await orderRepository.findOrderById(orderId);
        if (!existingOrder) {
            throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการยกเลิก');
        }
        const newStatusId = await orderRepository.updateCancelledStatus(orderId, cancelledReason, staffId);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_CANCEL_ORDER',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'ยกเลิกคำสั่งซื้อสำเร็จ',
                diff: {
                    order_status_id: {
                        from: existingOrder.order_status_id,
                        to: newStatusId
                    },
                    order_status_name: {
                        from: 'pending_payment',
                        to: 'cancelled'
                    },
                    cancelledReason
                }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_CANCEL_ORDER_FAILED',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                cancelledReason
            }
        });
        throw error;
    }
}

export const shippedOrder = async (orderId: number, trackingNumber: string, updatedBy: number, userContext: any) => {
    try {
        const existingOrder = await orderRepository.findOrderById(orderId);
        if (!existingOrder) {
            throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการจัดส่ง');
        }
        const existingTracking = await orderRepository.findOrderByTrackingNumber(trackingNumber);
        if (existingTracking) {
            throw createHttpError(400, 'หมายเลขพัสดุนี้ถูกใช้งานแล้ว กรุณาใช้หมายเลขพัสดุอื่น');
        }
        const newStatusId = await orderRepository.updateShippedStatus(orderId, trackingNumber, updatedBy);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_SHIPPED_ORDER',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'อัพเดทเป็นสถานะจัดส่งสำเร็จ',
                diff: {
                    order_status_id: {
                        from: existingOrder.order_status_id,
                        to: newStatusId
                    },
                    order_status_name: {
                        from: 'processing',
                        to: 'shipped'
                    },
                    trackingNumber
                }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_SHIPPED_ORDER_FAILED',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                trackingNumber
            }
        });
        throw error;
    }
}

export const deliveredOrder = async (orderId: number, updatedBy: number, userContext: any) => {
    try {
        const existingOrder = await orderRepository.findOrderById(orderId);
        if (!existingOrder) {
            throw createHttpError(404, 'ไม่พบคำสั่งซื้อที่ต้องการเปลี่ยนสถานะเป็นจัดส่งแล้ว');
        }
        const newStatusId = await orderRepository.updateDeliveredStatus(orderId, updatedBy);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_DELIVERED_ORDER',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'อัพเดทเป็นสถานะจัดส่งแล้วสำเร็จ',
                diff: {
                    order_status_id: {
                        from: existingOrder.order_status_id,
                        to: newStatusId
                    },
                    order_status_name: {
                        from: 'shipped',
                        to: 'delivered'
                    }
                }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_DELIVERED_ORDER_FAILED',
            resourceType: 'orders',
            resourceId: orderId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500
            }
        });
        throw error;
    }
}