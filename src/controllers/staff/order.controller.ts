import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as orderService from '../../services/staff/order.service';
import { Request, Response, NextFunction } from 'express';

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
            status_name: req.query.status_name as string || undefined,
            search_global: req.query.search_global as string || undefined,
            start_date: req.query.start_date as string || undefined,
            end_date: req.query.end_date as string || undefined,
            sort_type: req.query.sort_type as string || ''
        }

        const response = await orderService.getOrderList(filters);
        res.status(200).json({
            success: true,
            message: response.orders.length === 0
                ? 'ไม่มีคำสั่งซื้อภายในระบบ'
                : 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
            data: response
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const cancelledOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const orderId = Number(req.params.orderId);
        const { cancelledReason } = req.body;
        if (!cancelledReason) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุเหตุผลในการยกเลิกคำสั่งซื้อ'
            });
        }
        await orderService.cancelledOrder(orderId, cancelledReason, staffId);
        res.status(200).json({
            success: true,
            message: 'ยกเลิกคำสั่งซื้อสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const shippedOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const orderId = Number(req.params.orderId);
        const { tracking_number } = req.body;
        if (!tracking_number) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุหมายเลขพัสดุสำหรับการจัดส่ง'
            });
        }
        await orderService.shippedOrder(orderId, tracking_number, staffId);
        res.status(200).json({
            success: true,
            message: 'อัพเดทเป็นสถานะจัดส่งสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const deliveredOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const orderId = Number(req.params.orderId);
        await orderService.deliveredOrder(orderId, staffId);
        res.status(200).json({
            success: true,
            message: 'อัพเดทเป็นสถานะจัดส่งแล้วสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}