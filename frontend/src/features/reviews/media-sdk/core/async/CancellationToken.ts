/**
 * CancellationToken enables cooperative cancellation of long-running operations
 * in the media processing and upload pipelines.
 */
export class CancellationToken {
  private _isCancelled = false;
  private _reason?: string;
  private _listeners: ((reason?: string) => void)[] = [];

  public get isCancelled(): boolean {
    return this._isCancelled;
  }

  public get reason(): string | undefined {
    return this._reason;
  }

  public cancel(reason?: string): void {
    if (this._isCancelled) return;
    this._isCancelled = true;
    this._reason = reason;
    this._listeners.forEach(listener => { listener(reason); });
    this._listeners = [];
  }

  public throwIfCancelled(): void {
    if (this._isCancelled) {
      throw new Error(`Operation cancelled: ${this._reason ?? 'No reason provided'}`);
    }
  }

  public onCancelled(listener: (reason?: string) => void): () => void {
    if (this._isCancelled) {
      listener(this._reason);
      return () => { /* no-op */ };
    }
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
}

export class CancellationTokenSource {
  public readonly token = new CancellationToken();

  public cancel(reason?: string): void {
    this.token.cancel(reason);
  }
}
