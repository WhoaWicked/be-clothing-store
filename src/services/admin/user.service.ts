import * as userRepository from '../../repositories/admin/user.repository';
import * as authRepository from '../../repositories/auth.repository';
import { createHttpError } from '../../exceptions/http.exception';
import bcrypt from 'bcrypt';
import { CreateUserRequest, InsertUserValues, UpdateUserRequest, UpdateUserValues, UserById } from '../../types/admin/user.type';

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

export const createUser = async (userData: CreateUserRequest, createdBy: number) => {
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
    await userRepository.insertUser(values);
    return;
}

export const updateUserById = async (userData: UpdateUserRequest, id: number, updatedBy: number) => {
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
    return;
}

export const updateUserStatusById = async (isActive: boolean, id: number, updatedBy: number) => {
    const user: UserById = await getUserById(id);
    if (!user) {
        throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
    }
    await userRepository.updateStatusById(isActive, id, updatedBy);
    return;
}

export const deleteUserById = async (id: number) => {
    const user: UserById = await getUserById(id);
    if (!user) {
        throw createHttpError(404, 'ไม่พบผู้ใช้งานในระบบ');
    }
    await userRepository.deleteUserById(id);
    return;
}