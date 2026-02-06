import * as loggerRepository from '../repositories/admin/logger.repository';

export interface LogData {
    actorId?: number | null;
    actorName: string;
    role: string;
    action: string;
    resourceType: string;
    resourceId: string | number | null;
    details: object;
    ip: string;
    userAgent: string;
    isSuccess: boolean;
}

export const logActivity = async (params: LogData) => {
    try {
        const {
            actorId = null,
            actorName,
            role,
            action,
            resourceType,
            resourceId,
            details = {},
            ip = '0.0.0.0',
            userAgent = '',
            isSuccess = true,
        } = params;

        const logData = {
            actorId,
            actorName,
            role,
            action,
            resourceType,
            resourceId: String(resourceId), // แปลงเป็น String ที่นี่
            details: JSON.stringify(details), // แปลงเป็น JSON String ที่นี่
            ip,
            userAgent,
            isSuccess
        };

        loggerRepository.createLog(logData).catch((error: unknown) => {
            console.error('Logger repository error:', (error as Error).message);
        });
    } catch (error: unknown) {
        console.error('Logger activity error:', (error as Error).message);
    }
}