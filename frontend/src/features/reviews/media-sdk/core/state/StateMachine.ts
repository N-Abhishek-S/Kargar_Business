/**
 * Formal State Machine for media capture and processing pipelines.
 */

export enum MediaState {
  IDLE = 'IDLE',
  PERMISSION = 'PERMISSION',
  CAMERA_READY = 'CAMERA_READY',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  EDITING = 'EDITING',
  VALIDATING = 'VALIDATING',
  UPLOADING = 'UPLOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

type TransitionMap = {
  [key in MediaState]?: MediaState[];
};

const ValidTransitions: TransitionMap = {
  [MediaState.IDLE]: [MediaState.PERMISSION, MediaState.ERROR],
  [MediaState.PERMISSION]: [MediaState.CAMERA_READY, MediaState.ERROR, MediaState.IDLE],
  [MediaState.CAMERA_READY]: [MediaState.CAPTURING, MediaState.IDLE, MediaState.ERROR],
  [MediaState.CAPTURING]: [MediaState.PROCESSING, MediaState.CAMERA_READY, MediaState.ERROR],
  [MediaState.PROCESSING]: [MediaState.EDITING, MediaState.VALIDATING, MediaState.CAMERA_READY, MediaState.ERROR],
  [MediaState.EDITING]: [MediaState.PROCESSING, MediaState.VALIDATING, MediaState.CAMERA_READY, MediaState.ERROR],
  [MediaState.VALIDATING]: [MediaState.UPLOADING, MediaState.CAMERA_READY, MediaState.ERROR],
  [MediaState.UPLOADING]: [MediaState.COMPLETE, MediaState.VALIDATING, MediaState.ERROR],
  [MediaState.COMPLETE]: [MediaState.IDLE, MediaState.CAMERA_READY],
  [MediaState.ERROR]: [MediaState.IDLE, MediaState.CAMERA_READY, MediaState.PERMISSION]
};

export class MediaStateMachine {
  private _state: MediaState = MediaState.IDLE;
  private _listeners: Array<(state: MediaState, previousState: MediaState) => void> = [];

  public get state(): MediaState {
    return this._state;
  }

  public transitionTo(newState: MediaState): boolean {
    const allowed = ValidTransitions[this._state];
    if (allowed && allowed.includes(newState)) {
      const oldState = this._state;
      this._state = newState;
      this._notify(newState, oldState);
      return true;
    }
    console.warn(`Invalid state transition attempted: ${this._state} -> ${newState}`);
    return false;
  }

  public onStateChange(listener: (state: MediaState, previousState: MediaState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private _notify(newState: MediaState, oldState: MediaState): void {
    this._listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (err) {
        console.error('Error in state change listener:', err);
      }
    });
  }
}
