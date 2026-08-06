/**
 * Generates minimal placeholder PNG assets for Expo scaffold.
 * Run: node scripts/generate-assets.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createSolidPng(width, height, r, g, b) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const i = rowStart + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = 255;
    }
  }

  const compressed = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c;
}

const green = [22, 101, 52]; // #166534
const assetsDir = path.join(__dirname, "../packages/mobile/assets");
const pwaIconsDir = path.join(__dirname, "../packages/pwa/public/icons");

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(pwaIconsDir, { recursive: true });

const png1024 = createSolidPng(1024, 1024, ...green);
const png512 = createSolidPng(512, 512, ...green);
const png192 = createSolidPng(192, 192, ...green);
const png48 = createSolidPng(48, 48, ...green);

fs.writeFileSync(path.join(assetsDir, "icon.png"), png1024);
fs.writeFileSync(path.join(assetsDir, "splash-icon.png"), png512);
fs.writeFileSync(path.join(assetsDir, "adaptive-icon.png"), png512);
fs.writeFileSync(path.join(assetsDir, "favicon.png"), png48);
fs.writeFileSync(path.join(pwaIconsDir, "icon-192.png"), png192);
fs.writeFileSync(path.join(pwaIconsDir, "icon-512.png"), png512);

console.log("Generated placeholder PNG assets for mobile and PWA.");
