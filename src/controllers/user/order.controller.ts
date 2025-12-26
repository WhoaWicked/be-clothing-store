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