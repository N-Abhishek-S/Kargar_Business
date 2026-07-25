/**
 * Video Recorder — Plugin Service (AI-Ready Extension Points)
 *
 * Manages a registry of plugins that can hook into the recording lifecycle.
 * Future AI features (transcript, background blur, noise reduction, face detection)
 * register through this system without modifying core recorder code.
 */

import { PluginLogger } from './logger.service';
import type { RecorderPlugin, UploadResult, VideoMetadata } from '../types/video-recorder.types';

class RecorderPluginManager {
  private plugins: Map<string, RecorderPlugin> = new Map();

  /** Register a plugin */
  register(plugin: RecorderPlugin): void {
    if (this.plugins.has(plugin.name)) {
      PluginLogger.warn(`Plugin "${plugin.name}" already registered — replacing`);
    }
    this.plugins.set(plugin.name, plugin);
    PluginLogger.info(`Plugin registered: ${plugin.name}`);
  }

  /** Unregister a plugin by name */
  unregister(name: string): void {
    const removed = this.plugins.delete(name);
    if (removed) {
      PluginLogger.info(`Plugin unregistered: ${name}`);
    }
  }

  /** Get all registered plugin names */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /** Run all beforeRecording hooks — passes stream through each plugin in order */
  async runBeforeRecording(stream: MediaStream): Promise<MediaStream> {
    let currentStream = stream;
    for (const [name, plugin] of this.plugins) {
      if (plugin.beforeRecording) {
        try {
          currentStream = await plugin.beforeRecording(currentStream);
          PluginLogger.debug(`beforeRecording completed: ${name}`);
        } catch (err) {
          PluginLogger.error(`beforeRecording failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    return currentStream;
  }

  /** Run all afterRecording hooks — passes blob through each plugin in order */
  async runAfterRecording(blob: Blob, metadata: VideoMetadata): Promise<Blob> {
    let currentBlob = blob;
    for (const [name, plugin] of this.plugins) {
      if (plugin.afterRecording) {
        try {
          currentBlob = await plugin.afterRecording(currentBlob, metadata);
          PluginLogger.debug(`afterRecording completed: ${name}`);
        } catch (err) {
          PluginLogger.error(`afterRecording failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    return currentBlob;
  }

  /** Run all beforeUpload hooks — passes file through each plugin in order */
  async runBeforeUpload(file: File): Promise<File> {
    let currentFile = file;
    for (const [name, plugin] of this.plugins) {
      if (plugin.beforeUpload) {
        try {
          currentFile = await plugin.beforeUpload(currentFile);
          PluginLogger.debug(`beforeUpload completed: ${name}`);
        } catch (err) {
          PluginLogger.error(`beforeUpload failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    return currentFile;
  }

  /** Run all afterUpload hooks */
  async runAfterUpload(result: UploadResult): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      if (plugin.afterUpload) {
        try {
          await plugin.afterUpload(result);
          PluginLogger.debug(`afterUpload completed: ${name}`);
        } catch (err) {
          PluginLogger.error(`afterUpload failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  }

  /** Notify all plugins of a ready transcript */
  notifyTranscript(transcript: string): void {
    for (const [name, plugin] of this.plugins) {
      if (plugin.onTranscriptReady) {
        try {
          plugin.onTranscriptReady(transcript);
        } catch (err) {
          PluginLogger.error(`onTranscriptReady failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  }

  /** Notify all plugins of a ready analysis */
  notifyAnalysis(analysis: unknown): void {
    for (const [name, plugin] of this.plugins) {
      if (plugin.onAnalysisReady) {
        try {
          plugin.onAnalysisReady(analysis);
        } catch (err) {
          PluginLogger.error(`onAnalysisReady failed: ${name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  }

  /** Clear all plugins */
  clear(): void {
    this.plugins.clear();
    PluginLogger.info('All plugins cleared');
  }
}

/** Singleton plugin manager */
export const pluginManager = new RecorderPluginManager();
