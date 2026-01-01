import { Router, Request, Response, NextFunction } from "express";
import { query } from "../../config/db-middleware";
import { protect, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { createHttpError } from "../../exceptions/http.exception";
const router = Router();
const BASE_URL = '/profile';

router.get(BASE_URL, protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw createHttpError(401, "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
        }
        const queryStr = `
        SELECT
        u.id,
        u.username,
        u.email,
        u.prefix_id AS prefix_id,
        p.prefix_name,
        u.first_name,
        u.last_name,
        u.phone,
        u.created_at
        FROM users u
        JOIN prefixes p ON u.prefix_id = p.id
        WHERE u.id = $1;
        `;
        const response = await query(queryStr, [userId]);
        const result = response.rows[0];
        if (!result) {
            throw createHttpError(404, "ไม่พบข้อมูลผู้ใช้");
        }
        res.status(200).json({
            success: true,
            message: "ดึงข้อมูลผู้ใช้สำเร็จ",
            data: result
        });
    } catch (error: unknown) {
        next(error);
    }
});

export default router;