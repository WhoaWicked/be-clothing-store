import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as categoryService from '../../services/staff/category.service';
import { Request, Response, NextFunction } from 'express';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../types/staff/category.type';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = {
            page: Number(req.query.page) || 1,       // default = 1
            limit: Number(req.query.limit) || 10,    // default = 10
            category_name: req.query.category_name as string || undefined,
            category_code: req.query.category_code as string || undefined,
        }
        const response = await categoryService.getCategories(filters);
        res.status(200).json({
            success: true,
            message: response.categories.length === 0
                ? 'ไม่มีหมวดหมู่สินค้าภายในระบบ'
                : 'ดึงข้อมูลหมวดหมู่สินค้าสำเร็จ',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id: number = Number(req.params.id);
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสหมวดหมู่สินค้าผิดพลาด'
            });
        }
        const category = await categoryService.getCategoryById(id);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลหมวดหมู่สินค้าสำเร็จ',
            data: category
        });
    } catch (error) {
        next(error);
    }
}

export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req.user!.id;
        const categoryData: CreateCategoryRequest = req.body;
        if (!categoryData.category_name) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        const userContext = {
            actorId: staffId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await categoryService.createCategory(categoryData, staffId, userContext);
        res.status(201).json({
            success: true,
            message: 'สร้างหมวดหมู่สินค้าสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id: number = Number(req.params.id);
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสหมวดหมู่สินค้าผิดพลาด'
            });
        }
        const staffId = req.user!.id;
        const categoryData: UpdateCategoryRequest = req.body;
        if (!categoryData.category_name) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        const userContext = {
            actorId: staffId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await categoryService.updateCategory(id, categoryData, staffId, userContext);
        res.status(200).json({
            success: true,
            message: 'แก้ไขหมวดหมู่สินค้าสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}

export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id: number = Number(req.params.id);
        const staffId = req.user!.id;
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสหมวดหมู่สินค้าผิดพลาด'
            });
        }
        const userContext = {
            actorId: staffId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await categoryService.deleteCategory(id, userContext);
        res.status(200).json({
            success: true,
            message: 'ลบหมวดหมู่สินค้าสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}