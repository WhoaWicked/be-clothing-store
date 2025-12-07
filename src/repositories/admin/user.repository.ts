import { query } from '../../config/db-middleware';
import { InsertUserValues, UpdateUserValues, UserById, UserList } from '../../types/admin/user.type';

export const findUsers = async (): Promise<UserList[]> => {
    const queryStr: string = 'SELECT * FROM users;';
    const response = await query(queryStr);
    return response.rows;
}

export const findUserById = async (id: number): Promise<UserById> => {
    const queryStr: string = 'SELECT * FROM users WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const insertUser = async (values: InsertUserValues) => {
    const queryStr: string = 'INSERT INTO users (role_id, username, password, email, prefix_id, first_name, last_name, phone, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);';
    await query(queryStr, values);
    return;
}

export const updateUserById = async (values: UpdateUserValues, id: number) => {
    const queryStr: string = 'UPDATE users SET role_id = $1, username = $2, password = $3, email = $4, prefix_id = $5, first_name = $6, last_name = $7, phone = $8, updated_by = $9 WHERE id = $10;';
    await query(queryStr, [values.role_id, values.username, values.password, values.email, values.prefix_id, values.first_name, values.last_name, values.phone, values.updated_by, id]);
    return;
}

export const isEmailExists = async (email: string, id: number) => {
    const queryStr: string = 'SELECT id FROM users WHERE email = $1 AND id != $2;';
    const response = await query(queryStr, [email, id]);
    return response.rows.length > 0;
}

export const isUsernameExists = async (username: string, id: number) => {
    const queryStr: string = 'SELECT id FROM users WHERE username = $1 AND id != $2;';
    const response = await query(queryStr, [username, id]);
    return response.rows.length > 0;
}

export const isPhoneExists = async (phone: string, id: number) => {
    const queryStr: string = 'SELECT id FROM users WHERE phone = $1 AND id != $2;';
    const response = await query(queryStr, [phone, id]);
    return response.rows.length > 0;
}

export const deleteUserById = async (id: number) => {
    const queryStr: string = 'DELETE FROM users WHERE id = $1;';
    await query(queryStr, [id]);
    return;
}