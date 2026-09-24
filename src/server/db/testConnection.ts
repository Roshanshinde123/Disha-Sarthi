// Disha Sarathi - Safe PostgreSQL Connection Validator (PS 26097)
// Strictly sanitized: NEVER logs secrets, passwords, or raw connection strings
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Safe .env loader without exposing values
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key && !(key in process.env)) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

async function checkDatabaseConnection() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
  console.log('--- Disha Sarathi PostgreSQL Connectivity Check ---');
  console.log(`DATABASE_URL configured: ${hasDbUrl ? 'YES (Present)' : 'NO (Missing)'}`);

  if (!hasDbUrl) {
    console.error('ERROR: DATABASE_URL is not set in environment or .env file.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const startTime = Date.now();

  try {
    // 1. Raw query check
    const result: any = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db_name, version() as pg_version;`;
    const latencyMs = Date.now() - startTime;

    console.log('Database Status: CONNECTED');
    console.log(`Latency: ${latencyMs} ms`);
    if (Array.isArray(result) && result[0]) {
      console.log(`Database Name: ${result[0].db_name}`);
      const rawVer = String(result[0].pg_version || '');
      const shortVer = rawVer.split(' ')[0] + ' ' + (rawVer.split(' ')[1] || '');
      console.log(`Engine Version: ${shortVer}`);
    }

    // 2. Models verification
    const [userCount, profileCount, evidenceCount, auditCount] = await Promise.all([
      prisma.userAccount.count().catch(() => -1),
      prisma.beneficiaryProfile.count().catch(() => -1),
      prisma.placementEvidence.count().catch(() => -1),
      prisma.auditLogEntry.count().catch(() => -1)
    ]);

    console.log(`Tables Accessible: UserAccount (${userCount >= 0 ? userCount : 'pending migration'}), BeneficiaryProfile (${profileCount >= 0 ? profileCount : 'pending migration'}), PlacementEvidence (${evidenceCount >= 0 ? evidenceCount : 'pending migration'}), AuditLogEntry (${auditCount >= 0 ? auditCount : 'pending migration'})`);

    await prisma.$disconnect();
    console.log('Connection Check: SUCCESS');
  } catch (error: any) {
    console.error('Connection Check: FAILED');
    console.error('Error Code:', error?.code || 'UNKNOWN');
    console.error('Error Message:', error?.message?.split('\n')[0] || 'Unknown error');
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabaseConnection();
