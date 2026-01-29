import * as userRepository from '../../repositories/admin/user.repository';
import * as authRepository from '../../repositories/auth.repository';
import { createHttpError } from '../../exceptions/http.exception';
import bcrypt from 'bcrypt';
import { CreateUserRequest, InsertUserValues, UpdateUserRequest, UpdateUserValues, UserById } from '../../types/admin/user.type';
import { logActivity } from '../../utils/logger.util';

export const getUsers = async (filters: any) => {
    const { page, limit } = filters;
    const [users, totalItems] = await Promise.all([
        userRepository.findUsers(filters),
        userRepository.countUsers(filters)
    ]);
    if (users.length === 0) {
        return {
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            },
            users: []
        }
    }
    return {
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        },
        users
    }
}

export const getUserById = async (id: number) => {
    const user = await userRepository.findUserById(id);
    if (!user) {
        throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
    }
    return user;
}

export const createUser = async (userData: CreateUserRequest, createdBy: number, userContext: any) => {
    try {
        const [emailExists, usernameExists, phoneExists] = await Promise.all([
            authRepository.isEmailExists(userData.email.trim()),
            authRepository.isUsernameExists(userData.username.trim()),
            authRepository.isPhoneExists(userData.phone.trim())
        ]);
        if (emailExists) { throw createHttpError(409, 'อีเมลนี้มีในระบบแล้ว'); }
        if (usernameExists) { throw createHttpError(409, 'ชื่อผู้ใช้นี้มีในระบบแล้ว'); }
        if (phoneExists) { throw createHttpError(409, 'เบอร์โทรศัพท์นี้มีในระบบแล้ว'); }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const values: InsertUserValues = [
            userData.role_id,
            userData.username.trim(),
            hashedPassword,
            userData.email.trim(),
            userData.prefix_id,
            userData.first_name.trim(),
            userData.last_name.trim(),
            userData.phone.trim(),
            createdBy // created_by (system admin)
        ];
        const userId = await userRepository.insertUser(values);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'CREATE_USER',
            resourceType: 'users',
            resourceId: userId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'สร้างผู้ใช้งานสำเร็จ',
                data: { ...userData, password: 'HIDDEN' }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'CREATE_USER_FAILED',
            resourceType: 'users',
            resourceId: userData.username.trim(),
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...userData, password: 'HIDDEN' }
            }
        });
        throw error;
    }
}

export const updateUserById = async (userData: UpdateUserRequest, id: number, updatedBy: number, userContext: any) => {
    try {
        const oldUser = await getUserById(id);
        if (!oldUser) {
            throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
        }
        const [emailExists, usernameExists, phoneExists] = await Promise.all([
            userRepository.isEmailExists(userData.email.trim(), id),
            userRepository.isUsernameExists(userData.username.trim(), id),
            userRepository.isPhoneExists(userData.phone.trim(), id)
        ]);
        if (emailExists) { throw createHttpError(409, 'อีเมลนี้มีในระบบแล้ว'); }
        if (usernameExists) { throw createHttpError(409, 'ชื่อผู้ใช้นี้มีในระบบแล้ว'); }
        if (phoneExists) { throw createHttpError(409, 'เบอร์โทรศัพท์นี้มีในระบบแล้ว'); }
        // const hashedPassword = await bcrypt.hash(userData.password, 10);
        const values: UpdateUserValues = {
            role_id: userData.role_id,
            username: userData.username.trim(),
            // password: hashedPassword,
            email: userData.email.trim(),
            prefix_id: userData.prefix_id,
            first_name: userData.first_name.trim(),
            last_name: userData.last_name.trim(),
            phone: userData.phone.trim(),
            is_active: userData.is_active,
            updated_by: updatedBy
        }
        await userRepository.updateUserById(values, id);
        const changes: Record<string, any> = {};
        const fieldToCheck = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'role_id',
            'username',
            'is_active',
            'prefix_id'
        ];
        fieldToCheck.forEach((field: any) => {
            const oldValue = (oldUser as any)[field];
            const newValue = (userData as any)[field];
            if (oldValue !== newValue) [
                changes[field] = { old: oldValue, new: newValue }
            ]
        });
        if (Object.keys(changes).length > 0) {
            logActivity({
                actorId: userContext.actorId,
                actorName: userContext.actorName,
                role: userContext.role,
                action: 'UPDATE_USER',
                resourceType: 'users',
                resourceId: id,
                ip: userContext.ip,
                userAgent: userContext.userAgent,
                isSuccess: true,
                details: {
                    message: 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ',
                    diff: changes
                }
            });
        }
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'UPDATE_USER_FAILED',
            resourceType: 'users',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...userData }
            }
        });
        throw error;
    }
}

export const updateUserStatusById = async (isActive: boolean, id: number, updatedBy: number, userContext: any) => {
    try {
        const oldUser: UserById = await getUserById(id);
        if (!oldUser) {
            throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
        }
        await userRepository.updateStatusById(isActive, id, updatedBy);
        const changes: Record<string, any> = {};
        if (oldUser.is_active !== isActive) {
            changes.is_active = { from: oldUser.is_active, to: isActive };
        }
        if (Object.keys(changes).length > 0) {
            logActivity({
                actorId: userContext.actorId,
                actorName: userContext.actorName,
                role: userContext.role,
                action: 'UPDATE_USER_STATUS',
                resourceType: 'users',
                resourceId: id,
                ip: userContext.ip,
                userAgent: userContext.userAgent,
                isSuccess: true,
                details: {
                    message: 'แก้ไขสถานะผู้ใช้งานสำเร็จ',
                    diff: changes
                }
            });
        }
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'UPDATE_USER_STATUS_FAILED',
            resourceType: 'users',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
            }
        });
        throw error;
    }
}

export const deleteUserById = async (id: number, userContext: any) => {
    try {
        const user: UserById = await getUserById(id);
        if (!user) {
            throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
        }
        await userRepository.deleteUserById(id);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'DELETE_USER',
            resourceType: 'users',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'ลบผู้ใช้งานสำเร็จ',
                data: {
                    username: user.username,
                    email: user.email
                }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'DELETE_USER',
            resourceType: 'users',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
            }
        });
        throw error;
    }
}