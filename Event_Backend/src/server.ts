import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { startCleanupJob } from './utils/cron';
const PORT = parseInt(env.PORT);

const startServer = async () => {
  try {
     await connectDB();
    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🚀 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();