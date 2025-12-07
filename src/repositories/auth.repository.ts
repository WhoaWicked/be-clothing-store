import { query } from '../config/db-middleware';
import { CreateUserValues } from '../types/auth.type';

// 1. Login
export const findUserByEmail = async (email: string) => {
    const queryStr: string = 'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.email = $1 AND u.role_id = r.id;';
    const response = await query(queryStr, [email]);
    return response.rows[0];
}

export const updateLastLogin = async (id: number) => {
    const queryStr: string = 'UPDATE users SET last_login = NOW() WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return;
}

// 2. Register
export const isEmailExists = async (email: string) => {
    const queryStr: string = 'SELECT id FROM users WHERE email = $1;';
    const response = await query(queryStr, [email]);
    return response.rows.length > 0;
}

export const isUsernameExists = async (username: string) => {
    const queryStr: string = 'SELECT id FROM users WHERE username = $1;';
    const response = await query(queryStr, [username]);
    return response.rows.length > 0;
}

export const isPhoneExists = async (phone: string) => {
    const queryStr: string = 'SELECT id FROM users WHERE phone = $1;';
    const response = await query(queryStr, [phone]);
    return response.rows.length > 0;
}

export const insertNewUser = async (values: CreateUserValues) => {
    const queryStr: string = `INSERT INTO users 
    (role_id, username, password, email, prefix_id, first_name, last_name, phone) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
    await query(queryStr, values);
    return;
}
