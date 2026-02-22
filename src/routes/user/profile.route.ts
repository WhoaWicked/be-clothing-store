import { Router, Request, Response, NextFunction } from "express";
import { query } from '../../config/db-middleware';
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
        LEFT JOIN prefixes p ON u.prefix_id = p.id
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

router.put(BASE_URL, protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { prefix_id, username, first_name, last_name, phone } = req.body;
        if (!prefix_id || !username || !first_name || !last_name || !phone) {
            throw createHttpError(400, "กรุณาใส่ข้อมูลให้ครบถ้วน");
        }

        const checkUsernameQuery = `
        SELECT id FROM users WHERE username = $1 AND id != $2;
        `;
        const usernameCheckResult = await query(checkUsernameQuery, [username, userId]);
        if (usernameCheckResult.rows.length > 0) {
            throw createHttpError(409, "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว");
        }
        const checkPhoneQuery = `
        SELECT id FROM users WHERE phone = $1 AND id != $2;
        `;
        const phoneCheckResult = await query(checkPhoneQuery, [phone, userId]);
        if (phoneCheckResult.rows.length > 0) {
            throw createHttpError(409, "หมายเลขโทรศัพท์นี้ถูกใช้ไปแล้ว");
        }

        const queryStr = `
        UPDATE users
        SET prefix_id = $1,
            username = $2,
            first_name = $3,
            last_name = $4,
            phone = $5
        WHERE id = $6;
        `;
        await query(queryStr, [prefix_id, username, first_name, last_name, phone, userId]);
        res.status(200).json({
            success: true,
            message: "อัปเดตข้อมูลผู้ใช้สำเร็จ"
        });
    } catch (error: unknown) {
        next(error);
    }
});

export default router;