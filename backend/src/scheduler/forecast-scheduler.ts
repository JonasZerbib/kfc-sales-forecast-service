import cron from 'node-cron';

import { Config } from '../config/config';
import { createLogger } from '../config/logger';

const logger = createLogger('forecast-scheduler');
import { IForecastService } from '../services/i-forecast-service';

export function initScheduler(forecastService: IForecastService, config: Config): void {
  cron.schedule(config.forecastCronSchedule, async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    logger.info({ forecastDate: tomorrow }, 'Cron triggered: starting forecast generation');
    try {
      await forecastService.generateForDate(tomorrow);
    } catch (err) {
      logger.error({ err }, 'Forecast generation failed during scheduled run');
    }
  });

  logger.info({ schedule: config.forecastCronSchedule }, 'Forecast scheduler initialized');
}
