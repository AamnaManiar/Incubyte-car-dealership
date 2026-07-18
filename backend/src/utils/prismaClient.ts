import { PrismaClient } from '@prisma/client';

// 📚 INTERVIEW EXPLANATION: Singleton Pattern
// We create ONE PrismaClient and reuse it everywhere.
// Why? Creating a new PrismaClient for every request would:
//   - Create a new database connection each time (expensive!)
//   - Eventually run out of connections under load
//
// The singleton pattern ensures we always use the SAME instance.

// Declare a global variable to hold our single PrismaClient instance
// 'global' persists across module imports in Node.js
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient only if one doesn't already exist
const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, save to global so hot-reloading doesn't create new clients
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
