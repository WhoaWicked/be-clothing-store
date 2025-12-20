import { Pool, PoolClient } from 'pg';
import { Request, Response, NextFunction } from 'express';

// Create PostgreSQL connection pool
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT),
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: String(process.env.DB_PASSWORD || ''),
//     max: 20, // Maximum number of clients in pool
//     idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
//     connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
// });

// Supabase PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST_SUPABASE,
    port: Number(process.env.DB_PORT_SUPABASE),
    database: process.env.DB_NAME_SUPABASE,
    user: process.env.DB_USER_SUPABASE,
    password: String(process.env.DB_PASSWORD_SUPABASE || ''),
    max: 20, // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});



// Test database connection
pool.on('connect', (client: PoolClient) => {
    client.query("SET TIME ZONE 'UTC';");
    console.log('New client connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    } finally {
        client.release();
    }
};