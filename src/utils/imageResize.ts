/**
 * Image utilities for resizing and compressing uploaded images
 */

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: ImageResizeOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.85,
  outputFormat: 'image/jpeg',
};

/**
 * Resize and compress an image file to base64
 * @param file - Image file to process
 * @param options - Resize options
 * @returns Promise<string> - Base64 data URL
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxW = opts.maxWidth || width;
        const maxH = opts.maxHeight || height;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const dataUrl = canvas.toDataURL(opts.outputFormat, opts.quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Preset configurations for different image types
 */
export const IMAGE_PRESETS = {
  logo: { maxWidth: 400, maxHeight: 200, quality: 0.9 },
  signature: { maxWidth: 300, maxHeight: 150, quality: 0.85 },
  stamp: { maxWidth: 200, maxHeight: 200, quality: 0.85 },
};
