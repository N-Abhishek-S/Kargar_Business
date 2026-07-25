/**
 * Performance Service — Lightweight performance metrics
 *
 * Collects camera startup latency, permission time, FPS, etc.
 * Reports to console in dev mode. Extend for production monitoring.
 */

import { PerformanceLogger } from './logger.service';
import type { PerformanceMetrics } from '../types/video-recorder.types';

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private marks: Map<string, number> = new Map();

  /** Start a performance mark */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /** End a performance mark and record the duration */
  measure(name: string, metricKey: keyof PerformanceMetrics): number {
    const start = this.marks.get(name);
    if (start === undefined) return 0;

    const duration = Math.round(performance.now() - start);
    this.metrics[metricKey] = duration;
    this.marks.delete(name);

    PerformanceLogger.debug(`${name}: ${duration}ms`);
    return duration;
  }

  /** Set a metric directly */
  set(key: keyof PerformanceMetrics, value: number): void {
    this.metrics[key] = value;
  }

  /** Get current metrics */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /** Log all metrics */
  report(): void {
    PerformanceLogger.info('Performance report', this.metrics as Record<string, unknown>);
  }

  /** Reset all metrics */
  reset(): void {
    this.metrics = {};
    this.marks.clear();
  }
}

/** Singleton performance monitor */
export const performanceMonitor = new PerformanceMonitor();
