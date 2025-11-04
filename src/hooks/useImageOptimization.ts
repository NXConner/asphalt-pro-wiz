import { useState, useCallback } from 'react';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Hook to optimize images before upload
 */
export function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false);

  const optimizeImage = useCallback(
    async (file: File, options: ImageOptimizationOptions = {}): Promise<Blob> => {
      const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.85,
        format = 'webp',
      } = options;

      setIsProcessing(true);

      try {
        return await new Promise((resolve, reject) => {
          const img = new Image();
          const reader = new FileReader();

          reader.onload = (e) => {
            img.src = e.target?.result as string;
          };

          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Calculate new dimensions
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob'));
                }
                setIsProcessing(false);
              },
              `image/${format}`,
              quality
            );
          };

          img.onerror = () => {
            setIsProcessing(false);
            reject(new Error('Failed to load image'));
          };

          reader.readAsDataURL(file);
        });
      } catch (error) {
        setIsProcessing(false);
        throw error;
      }
    },
    []
  );

  return {
    optimizeImage,
    isProcessing,
  };
}
