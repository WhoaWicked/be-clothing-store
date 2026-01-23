import { Request, Response, NextFunction } from 'express';
import * as orderService from '../../services/user/order.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { shippingAddress } = req.body;
        if (
            !shippingAddress ||
            Object.values(shippingAddress).some((v) => !v || v.toString().trim() === '')
        ) {
            return res.status(400).json({ message: 'กรุณาระบุที่อยู่สำหรับจัดส่งให้ครบถ้วน' });
        }
        const result = await orderService.placeOrder(userId, JSON.stringify(shippingAddress));
        res.status(200).json({
            success: true,
            message: 'สร้างคำสั่งซื้อสำเร็จ',
            data: result
        });

    } catch (error: unknown) {
        next(error);
    }
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig || !endpointSecret) {
        res.status(400).send('Missing Stripe Signature or Secret');
        return;
    }
    try {
        await orderService.webhookProcess(req.body, sig, endpointSecret);
        res.status(200).json({ success: true, received: true });
    } catch (error: unknown) {
        next(error);
    }
}

export const repayOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const orderId = Number(req.params.orderId);
        if (!orderId || isNaN(orderId) || orderId <= 0) {
            return res.status(400).json({ message: 'รหัสคำสั่งซื้อไม่ถูกต้อง' });
        }
        const response = await orderService.repayOrder(orderId, userId);
        res.status(200).json({
            success: true,
            message: 'สร้างลิงก์ชำระเงินใหม่สำเร็จ',
            data: response
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getOrderList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        if (!userId) {
            return res.status(400).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }
        const order_status_name = String(req.query.order_status_name) || null;
        const response = await orderService.getOrderList(userId, order_status_name);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
            data:
            {
                totalOrders: response.length,
                orders: response,
            }
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const orderId = Number(req.params.orderId);
        if (!orderId || isNaN(orderId) || orderId <= 0) {
            return res.status(400).json({ message: 'รหัสคำสั่งซื้อไม่ถูกต้อง' });
        }
        const { cancelledReason } = req.body;
        if (!cancelledReason) {
            return res.status(400).json({ message: 'กรุณาระบุเหตุผลในการยกเลิกคำสั่งซื้อ' });
        }
        await orderService.cancelUserOrder(orderId, userId, cancelledReason);
        res.status(200).json({
            success: true,
            message: 'ยกเลิกคำสั่งซื้อสำเร็จ',
        });
    } catch (error: unknown) {
        next(error);
    }
}