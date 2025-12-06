import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload extends jwt.JwtPayload {
    id?: number;
    role?: string;
    username?: string;
}

interface AuthenticatedRequest extends Request {
    user?: UserPayload
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, String(process.env.JWT_SECRET));
            req.user = decoded as UserPayload;
            return next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({
                success: false,
                message: 'ไม่ได้รับอนุญาต, token ไม่ถูกต้องหรือหมดอายุ'
            });
        }
    }
    // กรณีไม่มี token หรือ header ไม่ถูกต้อง
    return res.status(401).json({
        success: false,
        message: 'ไม่ได้รับอนุญาต, กรุณาล็อกอินก่อนใช้งาน'
    });
}

export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req?.user?.role === "admin") {
        return next();
    } else {
        res.status(403).json({
            success: false,
            message: 'ไม่ได้รับอนุญาตให้เข้าถึง'
        });
    }
}

export const staff = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req?.user?.role === "admin" || req?.user?.role === "staff") {
        return next();
    } else {
        res.status(403).json({
            success: false,
            message: 'ไม่ได้รับอนุญาตให้เข้าถึง'
        });
    }
}