import { Pool, PoolClient, QueryResult } from 'pg';

// 1. สร้าง Config object แยกออกมา (เผื่อแก้สะดวก)
// const dbConfig = {
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT),
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: String(process.env.DB_PASSWORD || ''),
//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000,
// };

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: { rejectUnauthorized: false }, // สำหรับ Supabase ที่ใช้ SSL
};

// 2. ✅ ต้อง export pool เพื่อให้ Service เรียกไปใช้งาน (pool.connect) ได้
export const pool = new Pool(dbConfig);

// Event Listeners (เหมือนเดิม)
pool.on('connect', (client: PoolClient) => {
    // client.query("SET TIME ZONE 'UTC';"); // ถ้าต้องการบังคับ timezone
    // console.log('New client connected'); // ปิดไว้ก็ได้ครับ จะได้ไม่รก Console
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// 3. Helper function สำหรับ Query ทั่วไป (ที่ไม่ต้องใช้ Transaction)
// อันนี้เอาไว้ใช้กับพวก SELECT ทั่วไปที่จบในคำสั่งเดียว
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
    // ใช้ pool.query โดยตรงสะดวกกว่า มันจัดการ connect/release ให้เอง
    return pool.query(text, params);
};