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

  // Save clean, transparent emblem (NO white background, NO harsh boxes)
  await sharp(rawEmblem).png().toFile(path.join(publicDir, 'emblem.png'));

  // Save clean full logo png
  await sharp(input).png().toFile(path.join(publicDir, 'logo.png'));

  // Generate favicons from clean transparent emblem
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const s of sizes) {
    await sharp(rawEmblem)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, `favicon-${s}x${s}.png`));
  }

  // Favicon ico
  await sharp(rawEmblem)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Clean transparent emblem & favicons generated successfully!');
}

main().catch(console.error);
