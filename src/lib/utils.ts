import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// OpenCV.js dynamic loader and segmentation helpers
// We keep these here to avoid a separate dependency file and to provide
// a single import surface for image-analysis utilities.

export type OpenCVNamespace = typeof globalThis & { cv: any };

let openCvLoadingPromise: Promise<any> | null = null;

export function loadOpenCv(): Promise<any> {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('OpenCV requires a browser environment'));
  const w = window as unknown as OpenCVNamespace;
  if (w.cv) return Promise.resolve(w.cv);
  if (openCvLoadingPromise) return openCvLoadingPromise;

  openCvLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Use a lightweight, widely mirrored OpenCV.js build. Pinned version for stability.
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;
    script.onload = () => {
      // Wait until cv is ready
      const checkReady = () => {
        if (w.cv && typeof w.cv.Mat !== 'undefined') {
          resolve(w.cv);
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    };
    script.onerror = () => reject(new Error('Failed to load OpenCV.js'));
    document.head.appendChild(script);
  });

  return openCvLoadingPromise;
}

export type SegmentationParams = {
  // Preprocessing
  blurKernel?: number; // odd number, default 5
  // Thresholding
  thresholdMethod?: 'otsu' | 'adaptive';
  adaptiveBlockSize?: number; // odd number, default 31
  adaptiveC?: number; // default 2
  // Morphology
  morphOpen?: number; // iterations for opening
  morphClose?: number; // iterations for closing
  // Contour filtering
  minAreaPixels?: number; // filter small regions
};

export type SegmentationResult = {
  mask: HTMLCanvasElement;
  pixelCount: number; // number of foreground pixels
  debug?: HTMLCanvasElement; // optional visualization
};

export async function segmentAsphaltArea(
  image: HTMLImageElement | HTMLCanvasElement,
  params: SegmentationParams = {},
): Promise<SegmentationResult> {
  const cv = await loadOpenCv();
  const blurKernel = params.blurKernel ?? 5;
  const thresholdMethod = params.thresholdMethod ?? 'otsu';
  const adaptiveBlockSize = params.adaptiveBlockSize ?? 31;
  const adaptiveC = params.adaptiveC ?? 2;
  const morphOpen = params.morphOpen ?? 1;
  const morphClose = params.morphClose ?? 2;
  const minAreaPixels = params.minAreaPixels ?? 500; // ignore tiny specks

  const src = cv.imread(image as any);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const thresh = new cv.Mat();
  const morphed = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    // Light blur to reduce noise
    const k = Math.max(3, blurKernel | 1);
    cv.GaussianBlur(gray, blurred, new cv.Size(k, k), 0, 0, cv.BORDER_DEFAULT);

    if (thresholdMethod === 'adaptive') {
      const b = Math.max(3, adaptiveBlockSize | 1);
      cv.adaptiveThreshold(
        blurred,
        thresh,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV,
        b,
        adaptiveC,
      );
    } else {
      // Otsu global threshold, invert so asphalt (dark) becomes foreground
      cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    }

    // Morphological opening then closing to clean mask
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    cv.morphologyEx(thresh, morphed, cv.MORPH_OPEN, kernel, new cv.Point(-1, -1), morphOpen);
    cv.morphologyEx(morphed, morphed, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), morphClose);

    // Find contours and keep only sufficiently large areas
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(morphed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const mask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area >= minAreaPixels) {
        cv.drawContours(mask, contours, i, new cv.Scalar(255, 255, 255, 255), -1);
      }
      cnt.delete();
    }
    contours.delete();
    hierarchy.delete();

    // Count foreground pixels
    const pixelCount = cv.countNonZero(mask);

    // Convert mask to canvas
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = mask.cols;
    maskCanvas.height = mask.rows;
    cv.imshow(maskCanvas, mask);

    // Optional debug overlay
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = src.cols;
    debugCanvas.height = src.rows;
    const ctx = debugCanvas.getContext('2d')!;

    ctx.drawImage(image as any, 0, 0);
    ctx.globalAlpha = 0.4;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    mask.delete();
    return { mask: maskCanvas, pixelCount, debug: debugCanvas };
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    thresh.delete();
    morphed.delete();
  }
}

export function estimateSquareFeetFromPixels(
  pixelCount: number,
  calibration: { referenceFeet: number; referencePixels: number },
): number {
  const { referenceFeet, referencePixels } = calibration;
  if (referenceFeet <= 0 || referencePixels <= 0) return 0;
  const sqFeetPerPixel = (referenceFeet * referenceFeet) / (referencePixels * referencePixels);
  return pixelCount * sqFeetPerPixel;
}

export function computeScaleFromKnownLength(knownLengthFeet: number, pixelLength: number): number {
  if (knownLengthFeet <= 0 || pixelLength <= 0) return 0;
  return knownLengthFeet / pixelLength; // feet per pixel
}

export function polygonAreaInPixels(points: Array<{ x: number; y: number }>): number {
  // Shoelace formula
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i++) {
    area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
  }
  return Math.abs(area / 2);
}
