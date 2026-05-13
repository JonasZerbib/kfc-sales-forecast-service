import path from 'path';
import fs from 'fs';

import express from 'express';

import { config } from './config/config';
import { createLogger } from './config/logger';

const logger = createLogger('index');
import { pool } from './db/pool';
import { initDb } from './db/init-db';
import { ForecastRepository } from './repository/forecast-repository';
import { StoreRepository } from './repository/store-repository';
import { ForecastService } from './services/forecast-service';
import { StoreService } from './services/store-service';
import { initScheduler } from './scheduler/forecast-scheduler';
import { StoreController } from './api/controllers/store-controller';
import { ForecastController } from './api/controllers/forecast-controller';
import { createApiRouter } from './api/routes';
import { errorHandler } from './api/middleware/error-handler';

async function main(): Promise<void> {
  const isFreshSeed = await initDb();

  // DI wiring
  const forecastRepository = new ForecastRepository(pool);
  const storeRepository    = new StoreRepository(pool);
  const forecastService    = new ForecastService(forecastRepository, storeRepository, config);
  const storeService       = new StoreService(storeRepository);

  // Scheduler
  initScheduler(forecastService, config);

  // On a fresh install, generate forecasts for the past (lookbackDays - 1) days + today
  // so the UI can display historical forecasts as required by the jira ticket.
  // Day -(lookbackDays-1) has 1 day of historical data; today has the full lookback window.
  if (isFreshSeed) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    logger.info({ days: config.lookbackDays - 1 }, 'Fresh seed — generating historical forecasts');
    for (let dayOffset = config.lookbackDays - 1; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      try {
        await forecastService.generateForDate(date);
      } catch (err) {
        logger.error({ err, date }, 'Historical forecast generation failed');
      }
    }
  }

  // Run forecast immediately on startup (demo / acceptance testing)
  if (config.runForecastOnStartup) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    logger.info({ forecastDate: tomorrow }, 'Running startup forecast generation');
    try {
      await forecastService.generateForDate(tomorrow);
    } catch (err) {
      logger.error({ err }, 'Startup forecast generation failed');
    }
  }

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes — must be before error handler
  app.use('/api', createApiRouter(
    new StoreController(storeService),
    new ForecastController(forecastService),
  ));

  // Serve compiled React frontend in production
  // In development, Vite dev server (port 5173) handles the frontend separately.
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // Fallback: let React Router handle unknown paths (SPA behaviour)
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Error handler — must be last
  app.use(errorHandler);

  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Server started');
  });
}

main().catch(err => {
  logger.error({ err }, 'Fatal error during startup');
  process.exit(1);
});
