import { mkdirSync } from "node:fs";
import sharp from "sharp";

const source = "assets/logo.png";
const background = { r: 255, g: 255, b: 255, alpha: 1 };

mkdirSync("public", { recursive: true });

const targets = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
  ["public/favicon.png", 48],
];

for (const [file, size] of targets) {
  const inner = Math.round(size * 0.8);
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { ...background, alpha: 0 } })
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(file);

  console.log("gerado", file);
}
