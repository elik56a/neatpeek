export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMetadata = Record<string, unknown>;

export interface LogContext {
  service?: string;
  component?: string;
  userId?: string;
} 