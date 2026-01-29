import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';
import { RegisterData } from "../types/auth.type";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: { email: string; password: string } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
            });
        }
        const userContext = {
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown',
        }
        const accessToken: string = await authService.authenticateUser(email, password, userContext);
        return res.status(200).json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            data: {
                access_token: accessToken,
            },
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: RegisterData = req.body;
        if (!userData.role_id || !userData.username || !userData.password || !userData.email || !userData.prefix_id || !userData.first_name || !userData.last_name || !userData.phone) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกข้อมูลให้ครบถ้วน",
            });
        }
        const response = await authService.createUser(userData);
        return res.status(200).json({
            success: true,
            message: 'ลงทะเบียนสำเร็จ',
        })
    } catch (error: unknown) {
        next(error);
    }
}