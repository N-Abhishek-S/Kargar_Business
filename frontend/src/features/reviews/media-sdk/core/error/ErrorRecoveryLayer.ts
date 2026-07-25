/**
 * Standalone Error Recovery Layer
 */

export enum ErrorSeverity {
  RETRYABLE,
  FATAL,
  FALLBACK_AVAILABLE
}

export class MediaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: ErrorSeverity,
    public readonly context?: unknown
  ) {
    super(message);
    this.name = 'MediaError';
  }
}

export class ErrorRecoveryLayer {
  public async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (err: unknown) {
        attempt++;
        const severity = err instanceof MediaError ? err.severity : ErrorSeverity.FATAL;

        if (severity === ErrorSeverity.FATAL) {
          throw err;
        }

        if (severity === ErrorSeverity.FALLBACK_AVAILABLE && fallback) {
          console.warn(`Operation failed on attempt ${attempt}. Using fallback.`);
          return await fallback();
        }

        if (attempt >= maxRetries) {
          const errMsg = err instanceof Error ? err.message : String(err);
          throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${errMsg}`, { cause: err });
        }
        
        console.warn(`Operation failed. Retrying... (${attempt}/${maxRetries})`);
        // Exponential backoff
        await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Unreachable');
  }
}

export const mediaErrorRecovery = new ErrorRecoveryLayer();
