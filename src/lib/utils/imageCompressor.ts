/**
 * Compresses and resizes an image file on the client side using HTML5 Canvas.
 * Ensures the image is under ImageKit's 25 Megapixel limit and reduces file size.
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

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize logic keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
};
