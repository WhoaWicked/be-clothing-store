import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as productService from '../../services/staff/product.service';
import { Request, Response, NextFunction } from 'express';
import { CreateProductRequest, UpdateProductRequest } from '../../types/staff/product.type';
import { deleteImageFromCloudinary } from '../../utils/upload.middleware';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const response = await productService.getProducts(page, limit);
        res.status(200).json({
            success: true,
            message: response.products.length === 0
                ? 'ไม่มีสินค้าภายในระบบ'
                : 'ดึงข้อมูลสินค้าสำเร็จ',
            data: response
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id: number = Number(req.params.id);
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสสินค้าผิดพลาด'
            });
        }
        const product = await productService.getProductById(id);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลสินค้าสำเร็จ',
            data: product
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const requestData: CreateProductRequest = req.body;
        if (!requestData.category_id || !requestData.name || !requestData.description ||
            !requestData.base_price) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        if (req?.file?.path) {
            requestData.image_path = req.file.path;
        }
        await productService.createProduct(requestData, staffId);
        res.status(201).json({
            success: true,
            message: 'สร้างสินค้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const id: number = parseInt(req.params.id);
        const requestData: UpdateProductRequest = req.body;
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสสินค้าผิดพลาด'
            });
        }
        if (!requestData.category_id || !requestData.name || !requestData.description ||
            !requestData.base_price) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        if (req?.file?.path) {
            requestData.image_path = req.file.path;
        }
        await productService.updateProduct(requestData, id, staffId);
        res.status(200).json({
            success: true,
            message: 'แก้ไขสินค้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id: number = Number(req.params.id);
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสสินค้าผิดพลาด'
            });
        }
        await productService.deleteProduct(id);
        res.status(200).json({
            success: true,
            message: 'ลบสินค้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}