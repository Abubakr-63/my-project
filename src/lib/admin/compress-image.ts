const maxOriginalBytes = 25 * 1024 * 1024;
const maxCompressedBytes = 300 * 1024;

type CompressionResult =
  | { blob: Blob; belowRecommended: boolean }
  | { error: "imageInvalid" | "imageOriginalTooLarge" | "imageTooSmall" | "imageTooLarge" };

async function decode(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Some browsers can decode formats with Image that createImageBitmap rejects.
    }
  }

  const image = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not decode image"));
      image.src = url;
    });
    return {
      source: image, width: image.naturalWidth, height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressColorImage(file: File): Promise<CompressionResult> {
  if (!file.size) return { error: "imageInvalid" };
  if (file.size > maxOriginalBytes) return { error: "imageOriginalTooLarge" };

  try {
    const image = await decode(file);
    try {
      const longestSide = Math.max(image.width, image.height);
      if (longestSide < 300) return { error: "imageTooSmall" };

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return { error: "imageInvalid" };

      let scale = Math.min(1, 1600 / longestSide);
      let type = "image/webp";
      for (let round = 0; round < 4; round++) {
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        context.drawImage(image.source, 0, 0, canvas.width, canvas.height);

        function paintBackground() {
          if (!context) return;
          context.globalCompositeOperation = "destination-over";
          context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--image-matte").trim();
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (type === "image/jpeg") paintBackground();

        let best = await encode(canvas, type, 0.9);
        if (type === "image/webp" && best?.type !== type) {
          type = "image/jpeg";
          paintBackground();
          best = await encode(canvas, type, 0.9);
        }
        if (!best || best.type !== type || !best.size) return { error: "imageInvalid" };

        if (best.size > maxCompressedBytes) {
          best = await encode(canvas, type, 0.5);
          if (!best || best.type !== type || !best.size) return { error: "imageInvalid" };
          if (best.size > maxCompressedBytes) {
            scale *= 0.85;
            continue;
          }

          let low = 0.5;
          let high = 0.9;
          for (let step = 0; step < 6; step++) {
            const quality = (low + high) / 2;
            const candidate = await encode(canvas, type, quality);
            if (!candidate || candidate.type !== type || !candidate.size) return { error: "imageInvalid" };
            if (candidate.size <= maxCompressedBytes) {
              low = quality;
              best = candidate;
            } else {
              high = quality;
            }
          }
        }
        return { blob: best, belowRecommended: canvas.width < 600 || canvas.height < 315 };
      }
      return { error: "imageTooLarge" };
    } finally {
      image.release();
    }
  } catch {
    return { error: "imageInvalid" };
  }
}
