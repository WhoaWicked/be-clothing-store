import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: { email: string; password: string } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
            });
        }
        const accessToken: string = await authService.authenticateUser(email, password);
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