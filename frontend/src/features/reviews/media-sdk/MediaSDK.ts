/**
 * MediaSDK Public API
 * Exposes a stable interface for capturing, editing, processing, and uploading media.
 */

import { MediaStateMachine, MediaState } from './core/state/StateMachine';
import { mediaEventBus } from './core/events/EventBus';
import { TelemetryContext } from './core/telemetry/TelemetryContext';
import { mediaConfig, type MediaConfiguration } from './config/ConfigurationProfile';
import { mediaPluginManager, type MediaPlugin } from './plugins/PluginManager';

export class MediaSDK {
  private stateMachine = new MediaStateMachine();
  private context = new TelemetryContext();

  constructor() {
    this.stateMachine.onStateChange((newState, oldState) => {
      mediaEventBus.publish('state:changed', { newState, oldState });
    });
  }

  /**
   * Initializes the SDK with a specific configuration profile.
   */
  public initialize(profile?: MediaConfiguration): void {
    if (profile) {
      mediaConfig.setProfile(profile);
    }
    mediaEventBus.publish('sdk:initialized', { context: this.context.get() });
  }

  /**
   * Registers a plugin into the pipeline.
   */
  public registerPlugin(plugin: MediaPlugin): void {
    mediaPluginManager.register(plugin);
  }

  // --- Photo API ---

  public async openCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
    this.stateMachine.transitionTo(MediaState.PERMISSION);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, ...mediaConfig.config.resolution },
        audio: false
      });
      this.stateMachine.transitionTo(MediaState.CAMERA_READY);
      mediaEventBus.publish('camera:opened', { facingMode });
      return stream;
    } catch (err) {
      this.stateMachine.transitionTo(MediaState.ERROR);
      mediaEventBus.publish('camera:error', { error: err });
      throw err;
    }
  }

  public async capturePhoto(videoElement: HTMLVideoElement): Promise<HTMLCanvasElement> {
    if (!this.stateMachine.transitionTo(MediaState.CAPTURING)) {
      throw new Error('Cannot capture photo in current state.');
    }
    
    // Core canvas-first strategy
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Run afterCapture plugins
    const processedCanvas = (await mediaPluginManager.runHook('afterCapture', canvas)) as HTMLCanvasElement;

    this.stateMachine.transitionTo(MediaState.PROCESSING); // Move to processing immediately
    mediaEventBus.publish('photo:captured', { width: canvas.width, height: canvas.height });

    return processedCanvas;
  }

  public editPhoto(): void {
    this.stateMachine.transitionTo(MediaState.EDITING);
  }

  public processPhoto(): void {
    this.stateMachine.transitionTo(MediaState.PROCESSING);
    // Worker pool orchestration goes here
  }

  public uploadPhoto(): void {
    this.stateMachine.transitionTo(MediaState.UPLOADING);
    // Queue manager integration goes here
  }

  public destroy(): void {
    mediaEventBus.clear();
    this.stateMachine.transitionTo(MediaState.IDLE);
  }
}

// Singleton instance for the application
export const mediaSDK = new MediaSDK();
