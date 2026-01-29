import { Request, Response, NextFunction } from "express";
import { HttpError } from "../exceptions/http.exception";
import { logActivity } from "../utils/logger.util";

export const errorMiddleware = (
    error: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'เกิดข้อผิดพลาดภายในเซิฟเวอร์';
    if (status === 500) {
        console.error(`Server Error ${status}: ${message}`);
        const user = (req as any).user;
        logActivity({
            actorId: user ? user.id : null,
            actorName: user ? user.username : 'Server/Guest',
            role: user ? user.role : 'unknown',
            action: 'SERVER_ERROR',
            resourceType: 'Server',
            resourceId: req.originalUrl,
            ip: req.ip || req.socket.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown',
            isSuccess: false,
            details: {
                errorMessage: message,
                stack: error.stack,
                method: req.method,
                body: req.body,
            }
        });
    } else {
        console.warn(`Client Error ${status}: ${message}`);
    }
    res.status(status).json({
        success: false,
        message
    });
};