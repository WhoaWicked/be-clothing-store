// Middleware type for authenticated requests
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
// Product service functions
import * as productService from '../../services/staff/product.service';
import { Request, Response, NextFunction } from 'express';
// Product type definitions
import { CreateProductRequest, ProductFilterParams, UpdateProductRequest } from '../../types/staff/product.type';
// Custom HTTP error creator
import { createHttpError } from '../../exceptions/http.exception';

// ฟังก์ชันตรวจสอบข้อมูลสินค้าก่อนสร้าง/แก้ไข
const validateProductData = (data: CreateProductRequest) => {
    if (!data.category_id || !data.gender_id || !data.product_name || !data.base_price) {
        throw createHttpError(400, 'กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    if (data.base_price < 0) {
        throw createHttpError(400, 'ราคาสินค้าต้องมากกว่าศูนย์บาท');
    }

    if (data.product_name.length > 100) {
        throw createHttpError(400, 'ชื่อต้องไม่เกิน 100 ตัวอักษร');
    }
    if (!data.variants) {
        throw createHttpError(400, 'กรุณาเพิ่มตัวเลือกขนาดสินค้าอย่างน้อย 1 ขนาด');
    }
}

// ฟังก์ชันตรวจสอบ id สินค้า
const validateProductId = (id: number) => {
    if (!id || isNaN(id) || id <= 0) {
        throw createHttpError(400, 'รหัสสินค้าผิดพลาด');
    }
}

// ดึงรายการสินค้าทั้งหมดแบบแบ่งหน้า (pagination)
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters: ProductFilterParams = {
            page: Number(req.query.page) || 1,       // default = 1
            limit: Number(req.query.limit) || 10,    // default = 10
            product_code: req.query.product_code as string || undefined,
            product_name: req.query.product_name as string || undefined,
            category_name: req.query.category_name as string || undefined,
            gender_name: req.query.gender_name as string || undefined
        }
        // เรียก service เพื่อดึงข้อมูลสินค้า
        const response = await productService.getProducts(filters);
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

// ดึงข้อมูลสินค้ารายตัวด้วย id
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // แปลง id จาก params และตรวจสอบความถูกต้อง
        const id: number = Number(req.params.id);
        validateProductId(id);
        // ดึงข้อมูลสินค้าจาก service
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

// สร้างสินค้าใหม่ (เฉพาะ staff)
// export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//         // ดึง id ของ staff จาก token
//         const staffId = req.user!.id;
//         // รับข้อมูลสินค้าจาก body
//         const requestData: CreateProductRequest = req.body;
//         // ตรวจสอบความถูกต้องของข้อมูล
//         validateProductData(requestData);
//         // ถ้ามีไฟล์ภาพแนบมา ให้เพิ่ม path ลงในข้อมูล
//         if (req?.file?.path) { requestData.image_path = req.file.path; }
//         // เรียก service เพื่อสร้างสินค้า
//         await productService.createProduct(requestData, staffId);
//         res.status(201).json({
//             success: true,
//             message: 'สร้างสินค้าสำเร็จ'
//         });
//     } catch (error: unknown) {
//         next(error);
//     }
// }
export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const requestData: CreateProductRequest = req.body;
        validateProductData(requestData);
        if (typeof requestData.variants === 'string') {
            requestData.variants = JSON.parse(requestData.variants);
        } else {
            throw createHttpError(400, 'รูปแบบข้อมูล variants ไม่ถูกต้อง');
        }
        if (req?.file?.path) { requestData.image_path = req.file.path; }
        await productService.createProduct(requestData, staffId);
        res.status(201).json({
            success: true,
            message: 'สร้างสินค้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

// แก้ไขข้อมูลสินค้า (เฉพาะ staff)
export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // ดึง id ของ staff จาก token
        const staffId = req.user!.id;
        // รับ id สินค้าจาก params
        const id: number = parseInt(req.params.id);
        // รับข้อมูลใหม่จาก body
        const requestData: UpdateProductRequest = req.body;
        // ตรวจสอบ id และข้อมูล
        validateProductId(id);
        validateProductData(requestData);
        if (typeof requestData.variants === 'string') {
            requestData.variants = JSON.parse(requestData.variants);
        } else {
            throw createHttpError(400, 'รูปแบบข้อมูล variants ไม่ถูกต้อง');
        }
        // ถ้ามีไฟล์ภาพแนบมา ให้เพิ่ม path ลงในข้อมูล
        if (req?.file?.path) { requestData.image_path = req.file.path; }
        // เรียก service เพื่ออัปเดตสินค้า
        await productService.updateProduct(requestData, id, staffId);
        res.status(200).json({
            success: true,
            message: 'แก้ไขสินค้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

// ลบสินค้า (เฉพาะ staff)
export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // รับ id สินค้าจาก params และตรวจสอบ
        const id: number = Number(req.params.id);
        validateProductId(id);
        // เรียก service เพื่อลบสินค้า
        const response = await productService.deleteProduct(id);
        res.status(200).json({
            success: true,
            message: response
        });
    } catch (error: unknown) {
        next(error);
    }
}
