import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  return rows[0] || null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );

  return rows[0] || null;
};

export const createUser = async ({ name, email, passwordHash }) => {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};
