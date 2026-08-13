import {pool} from '../config/db';

export interface UserParams{
    id: string;
    full_name:string;
    password_hash:string;
    email:string;
}

export interface UserRecord {
    id: string;
    full_name: string | null;
    email: string;
    created_at: Date;
}

export interface UserAuthRecord extends UserRecord {
    password_hash: string;
}

class User{
  static async create(user: UserParams): Promise<UserRecord> {
    const { id, full_name, password_hash, email } = user;
    const query = `
        INSERT INTO users (id, full_name, password_hash, email)
        VALUES ($1, $2, $3, $4)
        RETURNING id, full_name, email, created_at
    `;
    try {
    const result = await pool.query(query, [id, full_name, password_hash, email]);
    return result.rows[0];
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('Email already in use');
    }
    throw err;
  }
 }
 static async findById(id: string): Promise<UserRecord | undefined> {
    const query = `
        SELECT id, full_name, email, created_at
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
 static async findByEmail(email: string): Promise<UserRecord | undefined> {
    const query = `
        SELECT id, full_name, email, created_at
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findAuthByEmail(email: string): Promise<UserAuthRecord | undefined> {
    const query = `
        SELECT id, full_name, email, password_hash, created_at
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findAuthById(id: string): Promise<UserAuthRecord | undefined> {
    const query = `
        SELECT id, full_name, email, password_hash, created_at
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit: number, offset: number) {
  const query = `
    SELECT id, full_name, email, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}

  static async update(id: string, full_name: string, email: string): Promise<UserRecord | undefined> {
    const query = `
        UPDATE users
        SET full_name = $1, email = $2
        WHERE id = $3
        RETURNING id, full_name, email, created_at
    `;
    const result = await pool.query(query, [full_name, email, id]);
    return result.rows[0];
  }
  static async updatePassword(id: string, password_hash: string): Promise<UserRecord | undefined> {
    const query = `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, full_name, email, created_at
    `;
    const result = await pool.query(query, [password_hash, id]);
    return result.rows[0];
  }
  static async delete(id: string): Promise<UserRecord | undefined> {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, full_name, email, created_at
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default User;
