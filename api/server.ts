import 'dotenv/config';
import app from './app';               // ✅ current directory
import { connectDB } from './config/db';  // ✅ assuming config/db.ts exists

let connected = false;

export default async function handler(req: any, res: any) {
  if (!connected) {
    await connectDB();
    connected = true;
  }

  return app(req, res);
}

