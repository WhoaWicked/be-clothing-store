import * as loggerRepository from '../../repositories/admin/logger.repository';
import { createHttpError } from '../../exceptions/http.exception';

export const getLogs = async (filters: any) => {
    const { page, limit } = filters;
    const [logs, totalItems] = await Promise.all([
        loggerRepository.findLogs(filters),
        loggerRepository.countLogs(filters)
    ]);
    if (logs.length === 0) {
        return {
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            },
            logs: []
        }
    }
    return {
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        },
        logs
    }
}