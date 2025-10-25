import { Server } from 'http';
import mongoose from 'mongoose';

export async function gracefulShutdown(server: Server, signal: string) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        console.log('HTTP server closed.');
        resolve();
      });
    });

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');

    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}
