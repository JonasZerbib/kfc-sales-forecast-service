type LogPayload = Record<string, unknown> | unknown;

function format(context: string, level: string, obj: LogPayload, msg?: string): string {
  const prefix = `[${level}] [${context}]`;
  if (msg !== undefined) {
    // logger.info({ storeId: 1 }, 'message') → [INFO] [ctx] message { storeId: 1 }
    return `${prefix} ${msg} ${JSON.stringify(obj)}`;
  }
  // logger.info('message') → [INFO] [ctx] message
  return `${prefix} ${typeof obj === 'string' ? obj : JSON.stringify(obj)}`;
}

export function createLogger(context: string) {
  return {
    info:  (obj: LogPayload, msg?: string) => console.log(  format(context, 'INFO ', obj, msg)),
    warn:  (obj: LogPayload, msg?: string) => console.warn( format(context, 'WARN ', obj, msg)),
    error: (obj: LogPayload, msg?: string) => console.error(format(context, 'ERROR', obj, msg)),
    debug: (obj: LogPayload, msg?: string) => console.log(  format(context, 'DEBUG', obj, msg)),
  };
}

export type Logger = ReturnType<typeof createLogger>;
