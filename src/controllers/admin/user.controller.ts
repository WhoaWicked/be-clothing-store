import * as userService from '../../services/admin/user.service';
import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest, UpdateUserRequest } from '../../types/admin/user.type';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getUsers();
        return res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
            data: users
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ไอดีผู้ใช้งานไม่ถูกต้อง'
            });
        }
        const user = await userService.getUserById(id);
        return res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
            data: user
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const userData: CreateUserRequest = req.body;
        if (!userData.role_id || !userData.username || !userData.password || !userData.email || !userData.first_name || !userData.last_name) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลผู้ใช้งานไม่ครบถ้วน'
            });
        }
        await userService.createUser(userData, adminId);
        return res.status(201).json({
            success: true,
            message: 'สร้างผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const updateUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const id = Number(req.params.id);
        const userData: UpdateUserRequest = req.body;
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ไอดีผู้ใช้งานไม่ถูกต้อง'
            });
        }
        if (!userData.role_id || !userData.username || !userData.email || !userData.first_name || !userData.last_name) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลผู้ใช้งานไม่ครบถ้วน'
            });
        }
        await userService.updateUserById(userData, id, adminId);
        return res.status(200).json({
            success: true,
            message: 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ไอดีผู้ใช้งานไม่ถูกต้อง'
            });
        }
        await userService.deleteUserById(id);
        return res.status(200).json({
            success: true,
            message: 'ลบผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}