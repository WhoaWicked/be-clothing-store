import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as categoryService from '../../services/staff/category.service';
import { Request, Response, NextFunction } from 'express';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../types/staff/category.type';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const response = await categoryService.getCategories(page, limit);
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
        if (!categoryData.name || !categoryData.slug) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        await categoryService.createCategory(categoryData, staffId);
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
        if (!categoryData.name || !categoryData.slug) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }
        await categoryService.updateCategory(id, categoryData, staffId);
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
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสหมวดหมู่สินค้าผิดพลาด'
            });
        }
        await categoryService.deleteCategory(id);
        res.status(200).json({
            success: true,
            message: 'ลบหมวดหมู่สินค้าสำเร็จ'
        });
    } catch (error) {
        next(error);
    }
}