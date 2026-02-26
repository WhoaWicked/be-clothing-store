import { query } from '../../config/db-middleware';
import { InsertUserValues, UpdateUserValues, UserById, UserList } from '../../types/admin/user.type';

export const countUsers = async (filters: any) => {
    const { search_global } = filters;
    const conditions = [];
    const params: any[] = [];
    let paramCount = 0;
    if (search_global) {
        paramCount++;
        conditions.push(`(
            u.username       ILIKE $${paramCount} OR
            u.email          ILIKE $${paramCount} OR
            u.first_name     ILIKE $${paramCount} OR
            u.last_name      ILIKE $${paramCount} OR
            u.phone          ILIKE $${paramCount}
            )`);
        params.push(`%${search_global}%`);
    }
    let queryStr = `
    SELECT 
 	COUNT (*) AS total
    FROM users u
    LEFT JOIN prefixes p ON u.prefix_id = p.id
    LEFT JOIN roles r ON u.role_id = r.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    const { rows } = await query(queryStr, params);
    return Number(rows[0].total);
}

export const findUsers = async (filters: any): Promise<UserList[]> => {
    const { page, limit, search_global, sort_type } = filters;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params: any[] = [];
    let paramCount = 0;
    if (search_global) {
        paramCount++;
        conditions.push(`(
            u.username       ILIKE $${paramCount} OR
            u.email          ILIKE $${paramCount} OR
            u.first_name     ILIKE $${paramCount} OR
            u.last_name      ILIKE $${paramCount} OR
            u.phone          ILIKE $${paramCount}
            )`);
        params.push(`%${search_global}%`);
    }
    let sortClause = 'u.created_at DESC';
    switch (sort_type) {
        case 'oldest':
            sortClause = 'u.created_at ASC';
            break;
        case 'newest':
        default:
            sortClause = 'u.created_at DESC';
            break;
    }
    let queryStr: string = `
    SELECT 
    u.id,
    u.role_id,
    r.role_name,
    u.username,
    u.password,
    u.email,
    u.prefix_id,
    p.prefix_name,
    u.first_name,
    u.last_name,
    u.provider,
    CONCAT (u.first_name, ' ', u.last_name) AS full_name,
    u.phone,
    u.is_active,
    u.last_login,
    u.created_at,
    u.updated_at
    FROM users u
    LEFT JOIN prefixes p ON u.prefix_id = p.id
    LEFT JOIN roles r ON u.role_id = r.id
    `;
    if (conditions.length > 0) {
        queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }
    queryStr += `ORDER BY ${sortClause} LIMIT $${++paramCount} OFFSET $${++paramCount};`;
    params.push(limit, offset);
    const { rows } = await query(queryStr, params);
    return rows;
}

export const findUserById = async (id: number): Promise<UserById> => {
    const queryStr: string = 'SELECT * FROM users WHERE id = $1;';
    const response = await query(queryStr, [id]);
    return response.rows[0];
}

export const insertUser = async (values: InsertUserValues) => {
    const queryStr: string = 'INSERT INTO users (role_id, username, password, email, prefix_id, first_name, last_name, phone, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;';
    const response = await query(queryStr, values);
    return response.rows[0].id;
}

export const updateUserById = async (values: UpdateUserValues, id: number) => {
    const queryStr: string = 'UPDATE users SET role_id = $1, username = $2, email = $3, prefix_id = $4, first_name = $5, last_name = $6, phone = $7, updated_by = $8, is_active = $9, updated_at = NOW() WHERE id = $10;';
    await query(queryStr, [values.role_id, values.username, values.email, values.prefix_id, values.first_name, values.last_name, values.phone, values.updated_by, values.is_active, id]);
    return;
}

export const updateStatusById = async (isActive: boolean, id: number, updatedBy: number) => {
    const queryStr: string = 'UPDATE users SET is_active = $1, updated_by = $2 WHERE id = $3;';
    await query(queryStr, [isActive, updatedBy, id]);
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