import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

async function main() {
  const input = path.join(publicDir, 'AI-CIOS.png');
  const meta = await sharp(input).metadata();
  console.log('Source size:', meta.width, meta.height);

  // Extract emblem (brain/circuit)
  const emblemWidth = Math.floor(meta.width * 0.48);
  const rawEmblem = await sharp(input)
    .extract({ left: 0, top: 0, width: emblemWidth, height: meta.height })
    .toBuffer();

  // Create a 512x512 white background with cyan border SVG
  const svgRect = `<svg width="512" height="512">
    <rect x="8" y="8" width="496" height="496" rx="100" ry="100" fill="#FFFFFF" stroke="#06B6D4" stroke-width="14"/>
  </svg>`;

  const resizedSymbol = await sharp(rawEmblem)
    .resize(400, 400, { fit: 'contain' })
    .toBuffer();

  const badgeBuffer = await sharp(Buffer.from(svgRect))
    .composite([{ input: resizedSymbol, gravity: 'center' }])
    .png()
    .toBuffer();

  // Save emblem badge
  await sharp(badgeBuffer).toFile(path.join(publicDir, 'emblem_badge.png'));

  // Generate favicons (16, 32, 48, 64, 128, 256)
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const s of sizes) {
    await sharp(badgeBuffer)
      .resize(s, s, { fit: 'contain' })
      .png()
      .toFile(path.join(publicDir, `favicon-${s}x${s}.png`));
  }

  // Favicon ico
  await sharp(badgeBuffer)
    .resize(64, 64, { fit: 'contain' })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('White badge favicons created successfully!');
}

main().catch(console.error);
