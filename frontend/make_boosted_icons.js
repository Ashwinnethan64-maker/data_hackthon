import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

async function main() {
  const input = path.join(publicDir, 'AI-CIOS.png');
  const meta = await sharp(input).metadata();
  console.log('Source:', meta.width, meta.height);

  // Extract emblem (brain/circuit)
  const emblemWidth = Math.floor(meta.width * 0.48);
  const rawEmblem = await sharp(input)
    .extract({ left: 0, top: 0, width: emblemWidth, height: meta.height })
    .toBuffer();

  // Create a boosted brightness/contrast version of emblem so it pops bright blue/cyan
  const boostedEmblem = await sharp(rawEmblem)
    .modulate({ brightness: 1.25, saturation: 1.3 })
    .png()
    .toBuffer();

  await sharp(boostedEmblem).toFile(path.join(publicDir, 'emblem.png'));
  await sharp(input).toFile(path.join(publicDir, 'logo.png'));

  // Generate favicons using emblem cropped right to edge without excess margin padding
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const s of sizes) {
    await sharp(boostedEmblem)
      .trim()
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, `favicon-${s}x${s}.png`));
  }

  // Favicon ico
  await sharp(boostedEmblem)
    .trim()
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('High-visibility trimmed favicons & boosted emblem generated!');
}

main().catch(console.error);
