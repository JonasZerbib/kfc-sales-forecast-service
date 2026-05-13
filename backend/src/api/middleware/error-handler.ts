import { NextFunction, Request, Response } from 'express';

import { createLogger } from '../../config/logger';

const logger = createLogger('error-handler');

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
