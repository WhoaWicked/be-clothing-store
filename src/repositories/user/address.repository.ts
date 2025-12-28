import { query } from '../../config/db-middleware';

export const findAddresses = async (userId: number) => {
    const queryStr = `
    SELECT * FROM addresses
    WHERE user_id = $1
    `;
    const response = await query(queryStr, [userId]);
    return response.rows;
}

export const findAddressById = async (addressId: number, userId: number) => {
    const queryStr = `
    SELECT * FROM addresses
    WHERE id = $1 AND user_id = $2
    `;
    const response = await query(queryStr, [addressId, userId]);
    return response.rows[0];
}

export const insertAddress = async (userId: number, values: any) => {
    const { street, sub_district, district, province, zip_code } = values;
    const queryStr = `
    INSERT INTO addresses (
        user_id, street, sub_district, district, province, zip_code)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;
    const response = await query(queryStr, [
        userId,
        street,
        sub_district,
        district,
        province,
        zip_code,
    ]);
    return response.rows[0];
}

export const updateAddress = async (addressId: number, userId: number, values: any) => {
    const { street, sub_district, district, province, zip_code } = values;
    const queryStr = `
    UPDATE addresses
    SET street = $1,
        sub_district = $2,
        district = $3,
        province = $4,
        zip_code = $5
    WHERE id = $6 AND user_id = $7
    RETURNING *
    `;
    const response = await query(queryStr, [
        street,
        sub_district,
        district,
        province,
        zip_code,
        addressId,
        userId,
    ]);
    return response.rows[0];
}

export const deleteAddress = async (addressId: number, userId: number) => {
    const queryStr = `
    DELETE FROM addresses
    WHERE id = $1 AND user_id = $2;
    `;
    await query(queryStr, [addressId, userId]);
    return;
}