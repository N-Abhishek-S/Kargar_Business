/**
 * Telemetry Context for structured logging and tracking.
 */

export interface TelemetryContextData {
  sessionId: string;
  jobId?: string;
  photoId?: string;
  userActionId?: string;
  pipelineVersion: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    memoryLimit?: number;
  };
}

export class TelemetryContext {
  private data: TelemetryContextData;

  constructor(initialData: Partial<TelemetryContextData> = {}) {
    this.data = {
      sessionId: initialData.sessionId ?? crypto.randomUUID(),
      pipelineVersion: initialData.pipelineVersion ?? 'v1.0.0',
      ...initialData
    };
  }

  public update(newData: Partial<TelemetryContextData>): void {
    this.data = { ...this.data, ...newData };
  }

  public get(): TelemetryContextData {
    return { ...this.data };
  }

  public createChild(childData: Partial<TelemetryContextData>): TelemetryContext {
    return new TelemetryContext({
      ...this.data,
      ...childData
    });
  }
}
