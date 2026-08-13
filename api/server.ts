import 'dotenv/config';
import app from './app';
import { connectDB, pool } from './config/db';

const PORT = process.env.PORT || 3000;

const main = async () => {
  await connectDB();

  app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to the CareerMap API' });
  });

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'healthy', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'unhealthy', database: 'error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
};

main();