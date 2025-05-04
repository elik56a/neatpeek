import { LogLevel, LogMetadata, LogContext } from './types';

// Define process.env type for NODE_ENV
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'local';
    }
  }
}

export class Logger {
  private context: LogContext;
  private correlationId?: string;

  constructor(context: LogContext) {
    this.context = context;
  }

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const context = this.context.service ? `[${this.context.service}]` : '';
    const correlation = this.correlationId ? `[${this.correlationId}]` : '';
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `${timestamp} ${level} ${context}${correlation} ${message}${metadataStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return level !== 'debug';
    }
    return true;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, metadata);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log('error', message, metadata);
  }

  // Specialized logging methods
  logError(error: Error, context?: string): void {
    this.error(error.message, {
      name: error.name,
      stack: error.stack,
      context,
    });
  }

  logApiError(error: Error, route: string, method: string): void {
    this.error(`API Error in ${method} ${route}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  logRequest(method: string, path: string, metadata?: LogMetadata): void {
    this.info(`${method} ${path}`, metadata);
  }

  logResponse(method: string, path: string, status: number, metadata?: LogMetadata): void {
    this.info(`${method} ${path} ${status}`, metadata);
  }
} 