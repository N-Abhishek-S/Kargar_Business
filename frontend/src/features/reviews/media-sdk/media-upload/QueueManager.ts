/**
 * Media Queue Manager for reliable uploads.
 */

import { mediaEventBus } from '../core/events/EventBus';

export enum QueueJobStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  RETRY = 'RETRY',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED'
}

export interface UploadJob {
  id: string;
  file: File;
  status: QueueJobStatus;
  progress: number;
  retryCount: number;
  maxRetries: number;
}

export class QueueManager {
  private queue = new Map<string, UploadJob>();
  private activeUploads = 0;
  private maxConcurrentUploads = 2;

  public enqueue(file: File, maxRetries = 3): string {
    const id = crypto.randomUUID();
    const job: UploadJob = {
      id,
      file,
      status: QueueJobStatus.WAITING,
      progress: 0,
      retryCount: 0,
      maxRetries
    };
    
    this.queue.set(id, job);
    this.notifyUpdate(job);
    this.processNext();
    
    return id;
  }

  public getJob(id: string): UploadJob | undefined {
    return this.queue.get(id);
  }

  private processNext() {
    if (this.activeUploads >= this.maxConcurrentUploads) return;

    for (const job of this.queue.values()) {
      if (job.status === QueueJobStatus.WAITING || job.status === QueueJobStatus.RETRY) {
        void this.startJob(job);
        break;
      }
    }
  }

  private async startJob(job: UploadJob) {
    this.activeUploads++;
    job.status = QueueJobStatus.RUNNING;
    this.notifyUpdate(job);

    try {
      // Simulate upload for now (would integrate with true upload service later)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(res => setTimeout(res, 200));
        job.progress = i;
        this.notifyUpdate(job);
      }
      
      job.status = QueueJobStatus.COMPLETED;
    } catch {
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        job.status = QueueJobStatus.RETRY;
      } else {
        job.status = QueueJobStatus.FAILED;
      }
    } finally {
      this.activeUploads--;
      this.notifyUpdate(job);
      this.processNext();
    }
  }

  private notifyUpdate(job: UploadJob) {
    mediaEventBus.publish('queue:updated', job);
  }
}
