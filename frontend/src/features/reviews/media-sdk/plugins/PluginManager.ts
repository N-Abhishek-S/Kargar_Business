/**
 * Versioned Plugin Manager for Media SDK Extension Points.
 */

export interface PluginCapabilities {
  supportsVideo?: boolean;
  supportsPhoto?: boolean;
  supportsWorker?: boolean;
  async?: boolean;
}

export interface MediaPlugin {
  name: string;
  version: string;
  priority: number; // Lower number = higher priority
  capabilities: PluginCapabilities;
  dependencies?: string[]; // Array of plugin names this plugin depends on

  initialize?(): Promise<void>;
  
  // Photo Lifecycle hooks
  beforeCapture?(): Promise<void> | void;
  afterCapture?(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> | HTMLCanvasElement;
  beforeCompression?(blob: Blob): Promise<Blob> | Blob;
  afterCompression?(file: File): Promise<File> | File;
  beforeUpload?(file: File): Promise<File> | File;
  afterUpload?(): Promise<void> | void;
}

export class PluginManager {
  private plugins: MediaPlugin[] = [];

  public register(plugin: MediaPlugin): void {
    if (this.plugins.some(p => p.name === plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered.`);
      return;
    }
    this.plugins.push(plugin);
    // Sort by priority (ascending)
    this.plugins.sort((a, b) => a.priority - b.priority);
  }

  public getPlugins(): MediaPlugin[] {
    return this.plugins;
  }

  public async runHook(
    hookName: keyof Omit<MediaPlugin, 'name' | 'version' | 'priority' | 'capabilities' | 'dependencies'>,
    initialValue?: unknown
  ): Promise<unknown> {
    let currentValue = initialValue;

    for (const plugin of this.plugins) {
      if (plugin[hookName]) {
        try {
          const fn = plugin[hookName] as ((arg?: unknown) => unknown) | undefined;
          if (typeof fn === 'function') {
            // If a value is passed, thread it through the plugins (waterfall)
            if (currentValue !== undefined) {
              currentValue = await fn.call(plugin, currentValue);
            } else {
              await fn.call(plugin);
            }
          }
        } catch (error) {
          console.error(`Error in plugin ${plugin.name} during ${hookName}:`, error);
          // Decide whether to halt or continue. For now, continue but log.
        }
      }
    }

    return currentValue;
  }
}

export const mediaPluginManager = new PluginManager();
