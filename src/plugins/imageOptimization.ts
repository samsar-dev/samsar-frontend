import { Plugin } from 'vite';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  formats?: string[];
}

export function imageOptimizationPlugin(options: ImageOptimizationOptions = {}): Plugin {
  const {
    quality = 80,
    maxWidth = 1920,
    maxHeight = 1080,
    formats = ['jpeg', 'png', 'webp', 'avif']
  } = options;

  return {
    name: 'vite-plugin-sharp-optimization',

    async transform(code, id) {
      const ext = path.extname(id).toLowerCase();
      
      if (!formats.some(format => id.toLowerCase().includes(format))) {
        return null;
      }

      try {
        const buffer = Buffer.from(code);
        const metadata = await sharp(buffer).metadata();
        
        if (!metadata.width || !metadata.height) {
          return null;
        }

        // Calculate dimensions maintaining aspect ratio
        const { width, height } = calculateDimensions(
          metadata.width,
          metadata.height,
          maxWidth,
          maxHeight
        );

        // Determine output format based on input
        const outputFormat = getOutputFormat(ext);
        
        let optimizedBuffer;

        switch (outputFormat) {
          case 'jpeg':
            optimizedBuffer = await sharp(buffer)
              .resize(width, height, { fit: 'inside', withoutEnlargement: true })
              .jpeg({
                quality,
                progressive: true,
                mozjpeg: true
              })
              .toBuffer();
            break;

          case 'png':
            optimizedBuffer = await sharp(buffer)
              .resize(width, height, { fit: 'inside', withoutEnlargement: true })
              .png({
                quality,
                compressionLevel: 9,
                palette: true
              })
              .toBuffer();
            break;

          case 'webp':
            optimizedBuffer = await sharp(buffer)
              .resize(width, height, { fit: 'inside', withoutEnlargement: true })
              .webp({
                quality,
                effort: 6
              })
              .toBuffer();
            break;

          case 'avif':
            optimizedBuffer = await sharp(buffer)
              .resize(width, height, { fit: 'inside', withoutEnlargement: true })
              .avif({
                quality,
                effort: 6
              })
              .toBuffer();
            break;

          default:
            return null;
        }

        return {
          code: optimizedBuffer.toString('base64'),
          map: null
        };
      } catch (error) {
        console.error(`Error optimizing image ${id}:`, error);
        return null;
      }
    },

    async generateBundle() {
      // Clean up temporary files
      try {
        await fs.rm(path.join(process.cwd(), 'dist', 'temp'), { 
          recursive: true, 
          force: true 
        });
      } catch (error) {
        console.error('Error cleaning up temporary files:', error);
      }
    }
  };
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

function getOutputFormat(ext: string): string {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'jpeg';
    case '.png':
      return 'png';
    case '.webp':
      return 'webp';
    case '.avif':
      return 'avif';
    default:
      return 'jpeg';
  }
}
