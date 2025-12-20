import { Router, Request, Response } from "express";
import { query } from "../config/db-middleware";

const router = Router();
const BASE_URL = '/health-check';

router.get(BASE_URL, async (req: Request, res: Response) => {
    try {
        const result = await query("SELECT CURRENT_TIMESTAMP AS current_time");
        const rows = result?.rows ?? [];
        if (rows.length > 0) {
            res.status(200).json({
                status: "Success",
                timestamp: rows[0].current_time,
            });
        } else {
            res.status(500).json({ status: "Failed" });
        }
    } catch (error: any) {
        console.error("Database connection error:", error);
        res.status(500).json({ status: "Failed", error: error.message });
    }
});

export default router;