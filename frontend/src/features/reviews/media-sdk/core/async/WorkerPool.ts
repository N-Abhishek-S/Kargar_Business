/**
 * Generic Worker Pool for parallel media processing.
 */

export interface WorkerJob<T = unknown, R = unknown> {
  id: string;
  payload: T;
  resolve: (value: R) => void;
  reject: (reason?: unknown) => void;
}

export class WorkerPool<T, R> {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private queue: WorkerJob<T, R>[] = [];
  private jobMap = new Map<Worker, WorkerJob<T, R>>();

  constructor(
    private readonly workerFactory: () => Worker,
    private readonly poolSize: number = navigator.hardwareConcurrency || 4
  ) {
    this.initializePool();
  }

  private initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = this.workerFactory();
      this.setupWorker(worker);
      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  private setupWorker(worker: Worker) {
    worker.onmessage = (event) => {
      const job = this.jobMap.get(worker);
      if (job) {
        this.jobMap.delete(worker);
        
        const data = event.data as { error?: string; result?: R };
        if (data.error) {
          job.reject(new Error(data.error));
        } else {
          job.resolve(data.result as R);
        }
      }
      this.idleWorkers.push(worker);
      this.processNextJob();
    };

    worker.onerror = (error) => {
      const job = this.jobMap.get(worker);
      if (job) {
        this.jobMap.delete(worker);
        job.reject(error);
      }
      this.idleWorkers.push(worker);
      this.processNextJob();
    };
  }

  public execute(payload: T, cancelSignal?: AbortSignal): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const job: WorkerJob<T, R> = {
        id: crypto.randomUUID(),
        payload,
        resolve,
        reject
      };

      if (cancelSignal) {
        cancelSignal.addEventListener('abort', () => {
          // Remove from queue if not started
          const queueIndex = this.queue.findIndex(q => q.id === job.id);
          if (queueIndex > -1) {
            this.queue.splice(queueIndex, 1);
            reject(new Error('Job cancelled before starting.'));
          }
          // Note: Cancelling a running worker is complex. Usually requires terminating it and replacing it.
        });
      }

      this.queue.push(job);
      this.processNextJob();
    });
  }

  private processNextJob() {
    if (this.queue.length === 0 || this.idleWorkers.length === 0) return;

    const worker = this.idleWorkers.pop();
    const job = this.queue.shift();
    
    if (!worker || !job) return;

    this.jobMap.set(worker, job);
    worker.postMessage(job.payload);
  }

  public terminate() {
    this.workers.forEach(w => { w.terminate(); });
    this.workers = [];
    this.idleWorkers = [];
    this.queue = [];
    this.jobMap.clear();
  }
}
