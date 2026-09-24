// Disha Sarathi - Server-Side Prisma Client Singleton (PS 26097)
// PM-AJAY GIA Component Database Layer
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __disha_prisma__: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });
}

export const prisma: PrismaClient = global.__disha_prisma__ || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__disha_prisma__ = prisma;
}

export default prisma;
