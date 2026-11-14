// Types the canvas can't re-encode without losing something (animation, vectors).
const PASSTHROUGH_TYPES = new Set(["image/gif", "image/svg+xml"]);

// Types PocketBase accepts as-is, so the original can be kept when re-encoding doesn't help.
const UPLOADABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CompressImageOptions = {
  /** Longest edge of the output, in pixels. */
  maxDimension: number;
  /** JPEG quality between 0 and 1. */
  quality?: number;
};

/**
 * Downscales and re-encodes an image as JPEG in the browser before upload.
 *
 * Returns the original file when it can't be decoded, is animated or vector,
 * or when re-encoding wouldn't make it smaller.
 */
export async function compressImage(
  file: File,
  { maxDimension, quality = 0.85 }: CompressImageOptions,
): Promise<File> {
  if (PASSTHROUGH_TYPES.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no alpha channel; paint transparent areas white instead of black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    if (blob.size >= file.size && UPLOADABLE_TYPES.has(file.type)) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}
