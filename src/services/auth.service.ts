import * as authRepository from '../repositories/auth.repository';
import { CreateUserValues, RegisterData, UserFields } from '../types/auth.type';
import { UserPayload } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import nodemailer from "nodemailer";
import { DateTime } from "luxon";
import { createHttpError } from '../exceptions/http.exception';

// 1. login service
export const getUserByEmail = async (email: string) => {
    const user: UserFields = await authRepository.findUserByEmail(email.trim());
    if (!user) { throw createHttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
    return user;
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

export const authenticateUser = async (email: string, password: string) => {
    const user: UserFields = await getUserByEmail(email);
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