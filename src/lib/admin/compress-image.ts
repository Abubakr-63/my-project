const types = ["image/jpeg", "image/png", "image/webp"];
const maxOriginalBytes = 15 * 1024 * 1024;
const maxCompressedBytes = 300 * 1024;
const qualities = [0.85, 0.75, 0.65, 0.55, 0.5];

type CompressionResult =
  | { blob: Blob }
  | { error: "imageInvalid" | "imageOriginalTooLarge" | "imageTooSmall" | "imageTooLarge" };

async function decode(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  }

  const image = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not decode image"));
      image.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressColorImage(file: File): Promise<CompressionResult> {
  if (!types.includes(file.type) || !file.size) return { error: "imageInvalid" };
  if (file.size > maxOriginalBytes) return { error: "imageOriginalTooLarge" };

  try {
    const image = await decode(file);
    try {
      if (image.width < 600 || image.height < 315) return { error: "imageTooSmall" };
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return { error: "imageInvalid" };

      let scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      let type = "image/webp";
      for (let attempt = 0; attempt < 6; attempt++) {
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        context.drawImage(image.source, 0, 0, canvas.width, canvas.height);

        const paintBackground = () => {
          context.globalCompositeOperation = "destination-over";
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        };
        if (type === "image/jpeg") paintBackground();

        for (const quality of qualities) {
          let blob = await encode(canvas, type, quality);
          if (type === "image/webp" && blob?.type !== type) {
            type = "image/jpeg";
            paintBackground();
            blob = await encode(canvas, type, quality);
          }
          if (!blob || blob.type !== type || !blob.size) return { error: "imageInvalid" };
          if (blob.size <= maxCompressedBytes) return { blob };
        }
        scale *= 0.8;
      }
      return { error: "imageTooLarge" };
    } finally {
      image.release();
    }
  } catch {
    return { error: "imageInvalid" };
  }
}
