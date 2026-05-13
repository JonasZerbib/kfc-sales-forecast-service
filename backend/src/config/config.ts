import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().int().positive().default(3000),
  db: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().positive().default(5432),
    user: z.string().default('admin'),
    password: z.string().min(1, 'DB_PASSWORD is required'),
    name: z.string().default('kfc_forecast'),
  }),
  forecastCronSchedule: z.string().default('0 2 * * *'),
  lookbackDays: z.coerce.number().int().min(1).max(14).default(14),
  runForecastOnStartup: z.string().transform(v => v === 'true').default('true'),
});

const parsed = configSchema.safeParse({
  port: process.env.PORT,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  forecastCronSchedule: process.env.FORECAST_CRON_SCHEDULE,
  lookbackDays: process.env.LOOKBACK_DAYS,
  runForecastOnStartup: process.env.RUN_FORECAST_ON_STARTUP,
});

if (!parsed.success) {
  console.error('[ERROR] Invalid configuration:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
export type Config = typeof config;
