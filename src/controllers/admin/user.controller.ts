import * as userService from '../../services/admin/user.service';
import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest, UpdateUserRequest } from '../../types/admin/user.type';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            search_global: req.query.search_global ? String(req.query.search_global) : undefined,
            sort_type: req.query.sort_type ? String(req.query.sort_type) : 'newest'
        }
        const users = await userService.getUsers(filters);
        return res.status(200).json({
            success: true,
            message: users.users.length === 0 ? 'ไม่พบผู้ใช้งานในระบบ' : 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
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
        if (!userData.role_id || !userData.username || !userData.password || !userData.email || !userData.first_name || !userData.last_name || !userData.phone || !userData.prefix_id) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลผู้ใช้งานไม่ครบถ้วน'
            });
        }
        const userContext = {
            actorId: adminId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await userService.createUser(userData, adminId, userContext);
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
        if (!userData.role_id || !userData.username || !userData.email || !userData.first_name || !userData.last_name || !userData.phone || !userData.prefix_id) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลผู้ใช้งานไม่ครบถ้วน'
            });
        }
        const userContext = {
            actorId: adminId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await userService.updateUserById(userData, id, adminId, userContext);
        return res.status(200).json({
            success: true,
            message: 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const updateUserStatusById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const id = Number(req.params.id);
        const { is_active } = req.body;
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ไอดีผู้ใช้งานไม่ถูกต้อง'
            });
        }
        const userContext = {
            actorId: adminId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await userService.updateUserStatusById(is_active, id, adminId, userContext);
        return res.status(200).json({
            success: true,
            message: 'แก้ไขสถานะผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}


export const deleteUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminId = req.user!.id;
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ไอดีผู้ใช้งานไม่ถูกต้อง'
            });
        }
        const userContext = {
            actorId: adminId,
            actorName: req.user!.username,
            role: req.user!.role,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown'
        }
        await userService.deleteUserById(id, userContext);
        return res.status(200).json({
            success: true,
            message: 'ลบผู้ใช้งานสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}