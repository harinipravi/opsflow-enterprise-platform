import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const DB_QUERY_TIMEOUT_MS = Number(process.env.DB_QUERY_TIMEOUT_MS || 10000);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'opsflow',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  enableKeepAlive: true,
});

export const executeQuery = async (label, sql, values = []) => {
  const startedAt = Date.now();
  console.log(`[db] ${label} started`);

  try {
    const [rows] = await pool.query(
      {
        sql,
        timeout: DB_QUERY_TIMEOUT_MS,
      },
      values,
    );

    console.log(`[db] ${label} completed in ${Date.now() - startedAt}ms`);
    return rows;
  } catch (error) {
    console.error(`[db] ${label} failed after ${Date.now() - startedAt}ms`, error);
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  await executeQuery('healthcheck', 'SELECT 1 AS ok');
};

export default pool;
