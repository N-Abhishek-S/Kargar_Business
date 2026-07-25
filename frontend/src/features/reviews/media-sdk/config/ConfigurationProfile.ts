/**
 * Media Configuration Profiles to tune behavior across devices.
 */

export interface MediaConfiguration {
  resolution: {
    width: { ideal: number; max?: number };
    height: { ideal: number; max?: number };
  };
  frameRate: { ideal: number; max?: number };
  compression: {
    maxSizeMB: number;
    targetQuality: number;
    multiPass: boolean;
  };
  burstMode: {
    enabled: boolean;
    maxPhotos: number;
  };
  processing: {
    useWebWorkers: boolean;
    cacheThumbnails: boolean;
  };
}

export const LowEndProfile: MediaConfiguration = {
  resolution: { width: { ideal: 1280 }, height: { ideal: 720 } },
  frameRate: { ideal: 24, max: 30 },
  compression: { maxSizeMB: 2, targetQuality: 0.7, multiPass: false },
  burstMode: { enabled: false, maxPhotos: 1 },
  processing: { useWebWorkers: true, cacheThumbnails: false }
};

export const BalancedProfile: MediaConfiguration = {
  resolution: { width: { ideal: 1920 }, height: { ideal: 1080 } },
  frameRate: { ideal: 30, max: 60 },
  compression: { maxSizeMB: 5, targetQuality: 0.85, multiPass: true },
  burstMode: { enabled: true, maxPhotos: 5 },
  processing: { useWebWorkers: true, cacheThumbnails: true }
};

export const HighQualityProfile: MediaConfiguration = {
  resolution: { width: { ideal: 3840 }, height: { ideal: 2160 } },
  frameRate: { ideal: 60 },
  compression: { maxSizeMB: 15, targetQuality: 0.95, multiPass: true },
  burstMode: { enabled: true, maxPhotos: 10 },
  processing: { useWebWorkers: true, cacheThumbnails: true }
};

export const EnterpriseProfile: MediaConfiguration = {
  ...BalancedProfile,
  compression: { maxSizeMB: 10, targetQuality: 0.9, multiPass: true }
};

export class ConfigManager {
  private currentProfile: MediaConfiguration = BalancedProfile;

  public setProfile(profile: MediaConfiguration): void {
    this.currentProfile = profile;
  }

  public get config(): MediaConfiguration {
    return this.currentProfile;
  }
}

export const mediaConfig = new ConfigManager();
