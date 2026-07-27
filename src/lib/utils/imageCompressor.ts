/**
 * Compresses and resizes an image file on the client side using HTML5 Canvas.
 * Ensures the image is under ImageKit's 25 Megapixel limit and reduces file size.
 *
 * Notes on behaviour:
 * - Honours EXIF orientation so portrait phone photos aren't rotated on upload
 *   (via createImageBitmap({ imageOrientation: "from-image" }) where supported).
 * - Only ever downscales — images already within bounds are not enlarged.
 * - Photographic formats (JPEG / non-transparent) are re-encoded as JPEG for a
 *   much smaller payload; PNGs are kept as PNG to preserve transparency.
 * - If the "compressed" result ends up larger than the original (common for
 *   small PNGs / already-optimised files), the original file is returned instead.
 * - Always resolves (never rejects); on any failure the original file is returned
 *   so callers can treat it as a best-effort optimisation.
 *
 * @param file The original image file.
 * @param maxWidth The maximum width of the output image (default: 2000px).
 * @param maxHeight The maximum height of the output image (default: 2000px).
 * @param quality The compression quality between 0 and 1 (default: 0.8).
 * @returns A promise that resolves to the compressed File object.
 */
export const compressImage = (
  file: File,
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    // If we're not running in a browser environment, return the file as-is
    if (typeof window === "undefined" || !file) {
      resolve(file);
      return;
    }

    // Skip non-image files or vector graphics
    if (!file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }

    // Keep PNGs as PNG to preserve transparency; everything else becomes JPEG,
    // which compresses photographic content far more effectively.
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const renderToFile = (source: CanvasImageSource, srcWidth: number, srcHeight: number) => {
      let width = srcWidth;
      let height = srcHeight;

      // Only downscale — never enlarge — keeping aspect ratio.
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(source, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          // Fall back to the original if encoding failed or produced a larger file.
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const newName =
            outputType === "image/jpeg"
              ? file.name.replace(/\.(png|webp|gif|bmp|tiff?)$/i, ".jpg")
              : file.name;
          resolve(
            new File([blob], newName, {
              type: outputType,
              lastModified: Date.now(),
            })
          );
        },
        outputType,
        quality
      );
    };

    // Preferred path: createImageBitmap applies EXIF orientation for us and
    // decodes off the main thread. Guard it and fall back on any failure.
    if (typeof window.createImageBitmap === "function") {
      window
        .createImageBitmap(file, { imageOrientation: "from-image" })
        .then((bitmap) => {
          renderToFile(bitmap, bitmap.width, bitmap.height);
          bitmap.close?.();
        })
        .catch(() => decodeWithImageElement(file, renderToFile, () => resolve(file)));
      return;
    }

    decodeWithImageElement(file, renderToFile, () => resolve(file));
  });
};

/**
 * Fallback decoder using an <img> element for browsers without a usable
 * createImageBitmap (note: this path does not correct EXIF orientation).
 */
function decodeWithImageElement(
  file: File,
  render: (source: CanvasImageSource, width: number, height: number) => void,
  onError: () => void
) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.onload = () => render(img, img.width, img.height);
    img.onerror = onError;
    img.src = event.target?.result as string;
  };
  reader.onerror = onError;
  reader.readAsDataURL(file);
}
