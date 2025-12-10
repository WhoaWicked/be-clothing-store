import { Request, Response, NextFunction } from "express";
import { HttpError } from "../exceptions/http.exception";

export const errorMiddleware = (
    error: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'เกิดข้อผิดพลาดภายในเซิฟเวอร์';
    console.error(error);
    res.status(status).json({
        success: false,
        message
    });
};