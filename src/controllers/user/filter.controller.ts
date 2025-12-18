import { Request, Response, NextFunction } from 'express';
import * as genderService from '../../services/user/filter.service';

export const getGenders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const genders = await genderService.getGenders();
        res.status(200).json({
            success: true,
            message: genders.length > 0 ? 'ดึงข้อมูลเพศผู้ใช้สำเร็จ' : 'ไม่พบข้อมูลเพศผู้ใช้',
            data: genders
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await genderService.getCategories();
        res.status(200).json({
            success: true,
            message: categories.length > 0 ? 'ดึงข้อมูลหมวดหมู่สำเร็จ' : 'ไม่พบข้อมูลหมวดหมู่',
            data: categories
        });
    } catch (error: unknown) {
        next(error);
    }
}