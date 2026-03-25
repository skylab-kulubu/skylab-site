export type RGB = { r: number; g: number; b: number };

const colorCache = new Map<string, RGB>();

export const extractDominantColor = (src: string): Promise<RGB> => {
  const cached = colorCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("No canvas context");

        const size = 50;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < data.length; i += 16) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const brightness = (red + green + blue) / 3;

          if (brightness > 30 && brightness < 220) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }

        if (count > 0) {
          const boost = 1.2;
          const result: RGB = {
            r: Math.min(255, Math.floor((r / count) * boost)),
            g: Math.min(255, Math.floor((g / count) * boost)),
            b: Math.min(255, Math.floor((b / count) * boost)),
          };
          colorCache.set(src, result);
          resolve(result);
        } else {
          reject(new Error("No valid pixels found"));
        }
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
  });
};
