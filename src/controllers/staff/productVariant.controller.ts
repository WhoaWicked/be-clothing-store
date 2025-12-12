import { Request, Response, NextFunction } from 'express';
import * as productVariantService from '../../services/staff/productVariant.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getProductVariantById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id: number = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'รหัสสินค้าตัวเลือกไม่ถูกต้อง' });
        }
        const productVariant = await productVariantService.getProductVariantById(id);
        return res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลสินค้าตัวเลือกสำเร็จ',
            data: productVariant
        });
    } catch (error) {
        next(error);
    }
}

export const getProductVariantsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId: number = parseInt(req.params.productId);
        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({ success: false, message: 'รหัสสินค้าไม่ถูกต้อง' });
        }
        const productVariants = await productVariantService.getProductVariantsByProductId(productId);
        return res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลสินค้าตัวเลือกสำเร็จ',
            data: productVariants
        });
    } catch (error) {
        next(error);
    }
}

export const createProductVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId: number = req.user!.id;
        const requestData: any = req.body;
        if (!requestData.product_id || !requestData.size || !requestData.stock_quantity) {
            return res.status(400).json({ success: false, message: 'ข้อมูลที่ส่งมาไม่ครบถ้วน' });
        }
        await productVariantService.createProductVariant(requestData, staffId);
        return res.status(201).json({
            success: true,
            message: 'สร้างสินค้าตัวเลือกสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}

export const updateProductVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId: number = req.user!.id;
        const id: number = parseInt(req.params.id);
        const requestData: any = req.body;
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'รหัสสินค้าตัวเลือกไม่ถูกต้อง' });
        }
        if (!requestData.stock_quantity) {
            return res.status(400).json({ success: false, message: 'ข้อมูลที่ส่งมาไม่ครบถ้วน' });
        }
        await productVariantService.updateProductVariant(id, requestData, staffId);
        return res.status(200).json({
            success: true,
            message: 'แก้ไขสินค้าตัวเลือกสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}

export const deleteProductVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id: number = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'รหัสสินค้าตัวเลือกไม่ถูกต้อง' });
        }
        await productVariantService.deleteProductVariant(id);
        return res.status(200).json({
            success: true,
            message: 'ลบสินค้าตัวเลือกสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}