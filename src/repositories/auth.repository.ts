import { query } from '../config/db-middleware';

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