/**
 * Video Recorder — Structured Logger Service
 *
 * Creates namespaced loggers with environment-aware verbosity:
 * - Development: verbose, colored console output
 * - Production: errors only
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  readonly namespace: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly timestamp: number;
}

const IS_DEV = import.meta.env.DEV;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = IS_DEV ? 'debug' : 'error';

const COLORS: Record<string, string> = {
  Recorder: '#e74c3c',
  Upload: '#3498db',
  Permission: '#f39c12',
  Performance: '#2ecc71',
  Analytics: '#9b59b6',
  Media: '#1abc9c',
  Validation: '#e67e22',
  Storage: '#34495e',
  Plugin: '#16a085',
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

export function createLogger(namespace: string): Logger {
  const color = COLORS[namespace] ?? '#888';

  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      namespace,
      level,
      message,
      data,
      timestamp: Date.now(),
    };

    if (IS_DEV) {
      const prefix = `%c[${namespace}]`;
      const style = `color: ${color}; font-weight: bold;`;
      const consoleFn = level === 'error' ? console.error
        : level === 'warn' ? console.warn
        : level === 'debug' ? console.debug
        : console.info;

      if (data && Object.keys(data).length > 0) {
        consoleFn(prefix, style, message, data);
      } else {
        consoleFn(prefix, style, message);
      }
    } else {
      // Production: structured JSON on error only
      if (level === 'error') {
        console.error(JSON.stringify(entry));
      }
    }
  }

  return {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
  };
}

/* ---- Pre-built loggers ---- */
export const RecorderLogger = createLogger('Recorder');
export const UploadLogger = createLogger('Upload');
export const PermissionLogger = createLogger('Permission');
export const PerformanceLogger = createLogger('Performance');
export const AnalyticsLogger = createLogger('Analytics');
export const MediaLogger = createLogger('Media');
export const ValidationLogger = createLogger('Validation');
export const StorageLogger = createLogger('Storage');
export const PluginLogger = createLogger('Plugin');
