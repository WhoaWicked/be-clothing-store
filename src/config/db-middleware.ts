import { Pool, PoolClient } from 'pg';

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

// Supabase connection (uncomment to use)
const pool = new Pool({
    // 1. ส่วนระบุที่อยู่ (ใช้ String บรรทัดเดียวจบ)
    connectionString: process.env.DATABASE_URL,
    
    // 2. ส่วนความปลอดภัย (บังคับสำหรับ Supabase)
    ssl: { rejectUnauthorized: false },

    // 3. ส่วนพฤติกรรม (ควรใส่กลับมา)
    max: 20,                        // สำคัญ: กันไม่ให้แอปเราเปิด Connection ถล่ม Database
    idleTimeoutMillis: 30000,       // ประหยัด: ถ้าไม่มีใครใช้ 30 วิ ให้ตัดทิ้ง จะได้ไม่เปลือง
    connectionTimeoutMillis: 2000,  // กันค้าง: ถ้าเน็ตหลุด หรือต่อไม่ได้เกิน 2 วิ ให้ Error เลย (ดีกว่าค้างยาว)
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