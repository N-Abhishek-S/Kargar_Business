import { createEmitter } from "../utils/EventEmitter";

export type ImageSource = 'camera' | 'gallery' | 'filepicker';

export interface ImageAcquisitionOptions {
  source: ImageSource;
  maxSizeMB?: number;
  accept?: string;
  compress?: boolean;
  maxWidth?: number;
}

export interface ImageAcquisitionResult {
  file: File;
  previewUrl: string;
}

/**
 * ImageAcquisitionService acts as the single unified entry point for all image acquisition.
 * It enforces the pipeline: File -> Validation -> Compression -> EXIF -> Preview URL.
 * UI components must use this service instead of direct <input> or getUserMedia calls.
 */
class ImageAcquisitionServiceImpl {
  private emitter = createEmitter<{
    'requestCamera': { options: ImageAcquisitionOptions; resolve: (file: File | null) => void };
  }>();

  onCameraRequest(handler: (params: { options: ImageAcquisitionOptions; resolve: (file: File | null) => void }) => void) {
    this.emitter.on('requestCamera', handler);
  }

  offCameraRequest(handler: (params: { options: ImageAcquisitionOptions; resolve: (file: File | null) => void }) => void) {
    this.emitter.off('requestCamera', handler);
  }

  
  /**
   * Main entry point to acquire an image.
   */
  async acquire(options: ImageAcquisitionOptions): Promise<ImageAcquisitionResult | null> {
    let rawFile: File | null;

    if (options.source === 'camera') {
      // Check platform strategy: Desktop uses React Camera, Mobile preserves Native Camera
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        rawFile = await this.acquireFromFilePicker(options); // Uses capture="environment" for native camera intent
      } else {
        rawFile = await this.acquireFromReactCamera(options);
      }
    } else {
      rawFile = await this.acquireFromFilePicker(options);
    }

    if (!rawFile) return null;

    // 1. Validation
    this.validate(rawFile, options.maxSizeMB);

    // 2. EXIF Correction & Compression
    const processedFile = await this.processImage(rawFile, options);

    // 3. Preview Generation
    const previewUrl = URL.createObjectURL(processedFile);

    return { file: processedFile, previewUrl };
  }

  /**
   * Process an existing file (e.g., from drag and drop) through the pipeline.
   */
  async processFile(rawFile: File, options: ImageAcquisitionOptions): Promise<ImageAcquisitionResult | null> {
    // 1. Validation
    this.validate(rawFile, options.maxSizeMB);

    // 2. EXIF Correction & Compression
    const processedFile = await this.processImage(rawFile, options);

    // 3. Preview Generation
    const previewUrl = URL.createObjectURL(processedFile);

    return { file: processedFile, previewUrl };
  }

  /**
   * Invokes the React Camera UI by emitting an event.
   * The React App must listen to 'requestCamera' and show the SharedCameraModal.
   */
  private acquireFromReactCamera(options: ImageAcquisitionOptions): Promise<File | null> {
    return new Promise((resolve) => {
      this.emitter.emit('requestCamera', { options, resolve });
    });
  }

  /**
   * Invokes the native file picker or OS native camera intent dynamically.
   */
  private acquireFromFilePicker(options: ImageAcquisitionOptions): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.accept ?? 'image/jpeg, image/png, image/webp';
      
      if (options.source === 'camera') {
        input.setAttribute('capture', 'environment');
      }

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        resolve(file ?? null);
        input.remove();
      };

      input.oncancel = () => {
        resolve(null);
        input.remove();
      };

      input.click();
    });
  }

  /**
   * Validates the file size and type.
   */
  private validate(file: File, maxSizeMB = 5): void {
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type: ${file.type}. Expected an image.`);
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      throw new Error(`Image size (${sizeMB.toFixed(2)} MB) exceeds the maximum allowed size of ${maxSizeMB} MB.`);
    }
  }

  /**
   * Corrects EXIF orientation and compresses the image via Canvas.
   */
  private async processImage(file: File, options: ImageAcquisitionOptions): Promise<File> {
    if (!options.compress && typeof createImageBitmap === 'undefined') {
      return file; 
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }

        let { width, height } = img;
        const maxWidth = options.maxWidth ?? 1920;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        if (!options.compress) {
           canvas.toBlob((blob) => {
             if (blob) {
               resolve(new File([blob], file.name, { type: file.type }));
             } else {
               resolve(file);
             }
           }, file.type);
        } else {
           const type = 'image/webp';
           canvas.toBlob((blob) => {
             if (blob) {
               const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
               resolve(new File([blob], newName, { type }));
             } else {
               resolve(file);
             }
           }, type, 0.85);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Cleanup preview URLs to prevent memory leaks.
   */
  public cleanup(previewUrl: string | null) {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  }
}

export const ImageAcquisitionService = new ImageAcquisitionServiceImpl();
