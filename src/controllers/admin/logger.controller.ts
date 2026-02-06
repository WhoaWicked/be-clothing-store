import * as loggerRepository from '../../services/admin/logger.service';
import { Request, Response, NextFunction } from 'express';

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            search_global: req.query.search_global ? String(req.query.search_global) : undefined,
            sort_type: req.query.sort_type ? String(req.query.sort_type) : 'newest',
            action: req.query.action ? String(req.query.action) : undefined,
            start_date: req.query.start_date ? String(req.query.start_date) : undefined,
            end_date: req.query.end_date ? String(req.query.end_date) : undefined,
            role_name: req.query.role_name ? String(req.query.role_name) : undefined,
            is_success: req.query.is_success ? String(req.query.is_success) : undefined,
        };
        const logs = await loggerRepository.getLogs(filters);
        return res.status(200).json({
            success: true,
            message: logs.logs.length === 0 ? 'ไม่พบบันทึกกิจกรรมในระบบ' : 'ดึงข้อมูลบันทึกกิจกรรมสำเร็จ',
            data: logs
        });
    } catch (error: unknown) {
        next(error);
    }
}