import fs from 'node:fs';
import path from 'node:path';

import { pool } from './pool';
import { seedDb } from './seed';
import { createLogger } from '../config/logger';

const logger = createLogger('init-db');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

/** Returns true if the database was freshly seeded, false if data was already present. */
export async function initDb(): Promise<boolean> {
  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await pool.query(sql);
      logger.info('Database schema initialized');
      break;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        logger.error({ err }, 'Database initialization failed after max retries');
        throw err;
      }
      const delayMs = BASE_DELAY_MS * attempt;
      logger.warn({ err, attempt, delayMs }, 'Database not ready, retrying...');
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return seedDb(pool);
}
