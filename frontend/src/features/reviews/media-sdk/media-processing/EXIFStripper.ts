/**
 * Lightweight EXIF parser and stripper.
 * Operates on binary ArrayBuffer to locate and remove EXIF APP1 markers (except for Orientation if preserved).
 */

export const EXIFStripper = {
  /**
   * Strips all EXIF metadata from a JPEG buffer, ensuring privacy by removing GPS, Camera Model, etc.
   * @param buffer Original JPEG ArrayBuffer
   * @returns Cleaned JPEG ArrayBuffer
   */
  strip(buffer: ArrayBuffer): ArrayBuffer {
    const dataView = new DataView(buffer);
    
    // Check if valid JPEG magic bytes (FF D8)
    if (dataView.getUint16(0) !== 0xFFD8) {
      return buffer; // Not a JPEG, return as-is
    }

    let offset = 2;
    const segments: Uint8Array[] = [];
    const uint8Array = new Uint8Array(buffer);
    
    // Push SOI (FF D8)
    segments.push(new Uint8Array([0xFF, 0xD8]));

    while (offset < dataView.byteLength) {
      if (dataView.getUint8(offset) !== 0xFF) {
        break; // Invalid marker
      }
      
      const marker = dataView.getUint16(offset);
      
      // Stop if SOS (Start of Scan) or EOI (End of Image) reached
      if (marker === 0xFFDA || marker === 0xFFD9) {
        // Copy the rest of the file
        segments.push(uint8Array.slice(offset));
        break;
      }
      
      const length = dataView.getUint16(offset + 2);
      
      // APP1 marker is where EXIF lives (FF E1)
      if (marker === 0xFFE1) {
        // Skip APP1 (EXIF) segment
      } else {
        // Keep other segments
        segments.push(uint8Array.slice(offset, offset + 2 + length));
      }
      
      offset += 2 + length;
    }

    // Reconstruct ArrayBuffer
    const totalLength = segments.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let currentOffset = 0;
    
    for (const segment of segments) {
      result.set(segment, currentOffset);
      currentOffset += segment.length;
    }
    
    return result.buffer;
  }
};
