/// <reference lib="webworker" />

import { EXIFStripper } from './EXIFStripper';

export interface ImageProcessingJobPayload {
  bitmap: ImageBitmap;
  operations: { type: 'rotate' | 'crop' | 'brightness', args: unknown }[];
  targetWidth?: number;
  targetHeight?: number;
  quality: number;
}

export interface ImageProcessingJobResult {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  size: number;
}

// Self-executing worker code
self.onmessage = async (e: MessageEvent<ImageProcessingJobPayload>) => {
  try {
    const { bitmap, operations, targetWidth, targetHeight, quality } = e.data;
    
    // We use OffscreenCanvas in the worker for non-blocking UI rendering
    const width = targetWidth ?? bitmap.width;
    const height = targetHeight ?? bitmap.height;
    
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context in worker');

    // Default: draw full image
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Apply operations (Undo/Redo pipeline)
    for (const op of operations) {
      if (op.type === 'rotate') {
        // Implement rotation logic with new dimensions...
      } else if (op.type === 'crop') {
        // Implement crop logic...
      } else {
        // Implement brightness logic...
      }
    }

    // Convert to Blob
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    const buffer = await blob.arrayBuffer();

    // Strip EXIF metadata
    const cleanedBuffer = EXIFStripper.strip(buffer);

    // Free memory eagerly
    bitmap.close();

    self.postMessage({
      result: {
        buffer: cleanedBuffer,
        width,
        height,
        size: cleanedBuffer.byteLength
      }
    }, [cleanedBuffer]); // Transfer ownership of ArrayBuffer for zero-copy performance

  } catch (error) {
    self.postMessage({ error: (error as Error).message });
  }
};
