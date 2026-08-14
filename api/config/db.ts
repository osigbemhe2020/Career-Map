import { Pool } from 'pg';
import 'dotenv/config';

// A Pool manages multiple reusable connections instead of opening
// a new one per query — much cheaper under real traffic.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Call this once at startup to fail fast if the DB is unreachable,
// rather than finding out on the first incoming request.
export const connectDB = async (): Promise<void> => {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
};;
