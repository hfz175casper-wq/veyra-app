#!/usr/bin/env node
/**
 * VEYRA ? Android ikon & splash ?reticisi
 * ===========================================================================
 * SIFIR BA?IMLILIK: yaln?zca Node ?ekirdek mod?lleri (zlib/fs/path) kullan?r.
 * sharp/imagemagick/inkscape kurman?za gerek yok.
 *
 * Ne yapar?
 *   `artifacts/reeldrama/public/favicon.svg` i?indeki VEYRA markas?n?
 *   (yuvarlat?lm?? kare zemin + koyu "V" + alt ?izgi) matematiksel olarak
 *   yeniden ?izer ve Capacitor'?n ?retti?i Android ?ablonundaki varsay?lan
 *   Capacitor ikonlar?n? VEYRA markas?yla DE???T?R?R (ayn? dosya adlar?,
 *   ayn? piksel boyutlar? ? hi?bir dosya silinmez, ?zerine yaz?l?r).
 *
 * ?retilenler (android/app/src/main/res):
 *   mipmap-<density>/ic_launcher.png            ? yuvarlat?lm?? korel rozet (legacy, API < 26)
 *   mipmap-<density>/ic_launcher_round.png      ? dairesel korel rozet
 *   mipmap-<density>/ic_launcher_foreground.png ? adaptive icon ?n plan? (?effaf, g?venli alan i?inde)
 *   drawable[-port|-land]-<density>/splash.png  ? #111118 zemin + ortalanm?? korel VEYRA markas?
 *
 * Kullan?m:
 *   node scripts/android/generate-icons.mjs
 *   VEYRA_RES_DIR=/ozel/yol node scripts/android/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Hedef dizin
// ---------------------------------------------------------------------------
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resDir = process.env.VEYRA_RES_DIR
  ? path.resolve(process.env.VEYRA_RES_DIR)
  : path.join(repoRoot, 'android', 'app', 'src', 'main', 'res');

// ---------------------------------------------------------------------------
// VEYRA marka paleti (src/index.css + public/favicon.svg ile birebir)
// ---------------------------------------------------------------------------
const CORAL = [0xf4, 0x7e, 0x68]; // #F47E68 ? ana vurgu
const INK = [0x17, 0x17, 0x20]; //   #171720 ? koyu m?rekkep
const NIGHT = [0x11, 0x11, 0x18]; // #111118 ? uygulama zemini

// ---------------------------------------------------------------------------
// Marka geometrisi ? favicon.svg'in 180x180 viewbox'?ndan birebir al?nm??t?r:
//   <rect width="180" height="180" rx="42" fill="#F47E68"/>
//   <path d="M49 49L89 124L131 49" stroke="#171720" stroke-width="18" round/>
//   <path d="M74 103H106"          stroke="#171720" stroke-width="12" round/>
// ---------------------------------------------------------------------------
const VIEWPORT = 180;
const CORNER_RADIUS_RATIO = 42 / VIEWPORT;

const STROKES = [
  {
    points: [
      [49, 49],
      [89, 124],
      [131, 49],
    ],
    width: 18,
  },
  {
    points: [
      [74, 103],
      [106, 103],
    ],
    width: 12,
  },
];

// Stroke d?? s?n?rlar? (yar?m kal?nl?k dahil) ? markan?n ger?ek kaplad??? alan.
const MARK_BOUNDS = (() => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of STROKES) {
    const half = stroke.width / 2;
    for (const [x, y] of stroke.points) {
      minX = Math.min(minX, x - half);
      minY = Math.min(minY, y - half);
      maxX = Math.max(maxX, x + half);
      maxY = Math.max(maxY, y + half);
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
})();

const MARK_CENTER = {
  u: (MARK_BOUNDS.minX + MARK_BOUNDS.maxX) / 2,
  v: (MARK_BOUNDS.minY + MARK_BOUNDS.maxY) / 2,
};

// ---------------------------------------------------------------------------
// K???k yard?mc?: piksel kapsama (coverage) hesaplar? ? 4x4 s?per ?rnekleme
// ---------------------------------------------------------------------------
const SAMPLES = 4;
const SAMPLE_STEP = 1 / SAMPLES;

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  let t = lengthSquared > 0 ? ((px - ax) * dx + (py - ay) * dy) / lengthSquared : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Viewbox koordinat?nda (0..180) bir nokta VEYRA markas?n?n i?inde mi? */
function isInsideMark(u, v) {
  for (const stroke of STROKES) {
    const half = stroke.width / 2;
    for (let i = 0; i < stroke.points.length - 1; i += 1) {
      const [ax, ay] = stroke.points[i];
      const [bx, by] = stroke.points[i + 1];
      if (distanceToSegment(u, v, ax, ay, bx, by) <= half) return true;
    }
  }
  return false;
}

function isInsideRoundedRect(x, y, left, top, width, height, radius) {
  if (x < left || x > left + width || y < top || y > top + height) return false;
  const cx = Math.max(left + radius, Math.min(x, left + width - radius));
  const cy = Math.max(top + radius, Math.min(y, top + height - radius));
  return Math.hypot(x - cx, y - cy) <= radius;
}

function isInsideCircle(x, y, cx, cy, radius) {
  return Math.hypot(x - cx, y - cy) <= radius;
}

// ---------------------------------------------------------------------------
// Tuval (RGBA)
// ---------------------------------------------------------------------------
class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4); // hepsi ?effaf (0,0,0,0)
  }

  fill(color) {
    for (let i = 0; i < this.width * this.height; i += 1) {
      this.data[i * 4] = color[0];
      this.data[i * 4 + 1] = color[1];
      this.data[i * 4 + 2] = color[2];
      this.data[i * 4 + 3] = 255;
    }
  }

  /**
   * Bir kapsama (coverage) fonksiyonunu yaln?zca verilen kutu i?inde
   * de?erlendirir ve rengi "source-over" ile kar??t?r?r.
   * B?y?k splash tuvallerinde t?m pikselleri taramamak i?in bbox ?art.
   */
  paint(box, coverageAt, color) {
    const x0 = Math.max(0, Math.floor(box.x0));
    const y0 = Math.max(0, Math.floor(box.y0));
    const x1 = Math.min(this.width - 1, Math.ceil(box.x1));
    const y1 = Math.min(this.height - 1, Math.ceil(box.y1));

    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        let hits = 0;
        for (let sy = 0; sy < SAMPLES; sy += 1) {
          const py = y + (sy + 0.5) * SAMPLE_STEP;
          for (let sx = 0; sx < SAMPLES; sx += 1) {
            const px = x + (sx + 0.5) * SAMPLE_STEP;
            if (coverageAt(px, py)) hits += 1;
          }
        }
        if (hits === 0) continue;

        const alpha = hits / (SAMPLES * SAMPLES);
        const index = (y * this.width + x) * 4;
        const destAlpha = this.data[index + 3] / 255;
        const outAlpha = alpha + destAlpha * (1 - alpha);

        if (outAlpha > 0) {
          this.data[index] = Math.round((color[0] * alpha + this.data[index] * destAlpha * (1 - alpha)) / outAlpha);
          this.data[index + 1] = Math.round((color[1] * alpha + this.data[index + 1] * destAlpha * (1 - alpha)) / outAlpha);
          this.data[index + 2] = Math.round((color[2] * alpha + this.data[index + 2] * destAlpha * (1 - alpha)) / outAlpha);
          this.data[index + 3] = Math.round(outAlpha * 255);
        }
      }
    }
  }
}

/**
 * VEYRA markas?n? ?izer.
 * @param {Canvas} canvas
 * @param {{cx:number, cy:number, width:number, color:number[]}} options
 *   cx/cy  ? markan?n merkezlenece?i nokta (piksel)
 *   width  ? markan?n toplam geni?li?i (piksel)
 */
function drawMark(canvas, { cx, cy, width, color }) {
  const scale = width / MARK_BOUNDS.width;
  const halfWidth = width / 2;
  const halfHeight = (MARK_BOUNDS.height * scale) / 2;
  const pad = 2;

  canvas.paint(
    { x0: cx - halfWidth - pad, y0: cy - halfHeight - pad, x1: cx + halfWidth + pad, y1: cy + halfHeight + pad },
    (px, py) => {
      const u = MARK_CENTER.u + (px - cx) / scale;
      const v = MARK_CENTER.v + (py - cy) / scale;
      return isInsideMark(u, v);
    },
    color,
  );
}

function drawRoundedRect(canvas, { x, y, width, height, radius, color }) {
  canvas.paint({ x0: x, y0: y, x1: x + width, y1: y + height }, (px, py) =>
    isInsideRoundedRect(px, py, x, y, width, height, radius), color);
}

function drawCircle(canvas, { cx, cy, radius, color }) {
  canvas.paint(
    { x0: cx - radius, y0: cy - radius, x1: cx + radius, y1: cy + radius },
    (px, py) => isInsideCircle(px, py, cx, cy, radius),
    color,
  );
}

// ---------------------------------------------------------------------------
// PNG kodlay?c? (RGBA / 8-bit / interlacesiz) ? zlib ile
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(canvas) {
  const { width, height, data } = canvas;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit derinli?i
  ihdr[9] = 6; // renk tipi: RGBA
  ihdr[10] = 0; // s?k??t?rma
  ihdr[11] = 0; // filtre
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filtre tipi: None
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function write(relativePath, canvas) {
  const target = path.join(resDir, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, encodePng(canvas));
  return relativePath;
}

// ---------------------------------------------------------------------------
// Rozet ?reticileri
// ---------------------------------------------------------------------------

/** Legacy launcher ikonu: korel yuvarlat?lm?? kare + koyu marka (favicon'in birebir h?li). */
function legacyIcon(size) {
  const canvas = new Canvas(size, size);
  drawRoundedRect(canvas, {
    x: 0,
    y: 0,
    width: size,
    height: size,
    radius: size * CORNER_RADIUS_RATIO,
    color: CORAL,
  });
  // Marka, favicon'da viewbox'un %55.6's?n? kaplar ? ayn? oran korunur.
  drawMark(canvas, {
    cx: size / 2,
    cy: size / 2 + size * ((MARK_CENTER.v - VIEWPORT / 2) / VIEWPORT),
    width: size * (MARK_BOUNDS.width / VIEWPORT),
    color: INK,
  });
  return canvas;
}

/** Yuvarlak launcher ikonu: korel daire + koyu marka (hafif k???lt?lm??). */
function roundIcon(size) {
  const canvas = new Canvas(size, size);
  drawCircle(canvas, { cx: size / 2, cy: size / 2, radius: size / 2, color: CORAL });
  drawMark(canvas, { cx: size / 2, cy: size / 2, width: size * (MARK_BOUNDS.width / VIEWPORT) * 0.92, color: INK });
  return canvas;
}

/**
 * Adaptive icon ?n plan?: ?effaf zemin + koyu marka.
 * Android 8+ maskesi tuvalin yaln?zca i? ~%61'ini g?sterdi?i i?in marka
 * g?venli alan?n i?inde kalacak ?ekilde %60 geni?li?e ?l?eklenir.
 */
function adaptiveForeground(size) {
  const canvas = new Canvas(size, size);
  drawMark(canvas, { cx: size / 2, cy: size / 2, width: size * 0.6, color: INK });
  return canvas;
}

/** Splash: VEYRA'n?n koyu sinematik zemini + ortalanm?? korel marka. */
function splash(width, height) {
  const canvas = new Canvas(width, height);
  canvas.fill(NIGHT);
  drawMark(canvas, { cx: width / 2, cy: height / 2, width: Math.min(width, height) * 0.22, color: CORAL });
  return canvas;
}

// ---------------------------------------------------------------------------
// ??kt? tablolar? ? Capacitor ?ablonunun mevcut boyutlar?yla birebir ayn?
// ---------------------------------------------------------------------------
const DENSITIES = [
  { folder: 'mipmap-mdpi', icon: 48, foreground: 108 },
  { folder: 'mipmap-hdpi', icon: 72, foreground: 162 },
  { folder: 'mipmap-xhdpi', icon: 96, foreground: 216 },
  { folder: 'mipmap-xxhdpi', icon: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', icon: 192, foreground: 432 },
];

const SPLASHES = [
  ['drawable/splash.png', 480, 320],
  ['drawable-land-mdpi/splash.png', 480, 320],
  ['drawable-land-hdpi/splash.png', 800, 480],
  ['drawable-land-xhdpi/splash.png', 1280, 720],
  ['drawable-land-xxhdpi/splash.png', 1600, 960],
  ['drawable-land-xxxhdpi/splash.png', 1920, 1280],
  ['drawable-port-mdpi/splash.png', 320, 480],
  ['drawable-port-hdpi/splash.png', 480, 800],
  ['drawable-port-xhdpi/splash.png', 720, 1280],
  ['drawable-port-xxhdpi/splash.png', 960, 1600],
  ['drawable-port-xxxhdpi/splash.png', 1280, 1920],
];

if (!existsSync(resDir)) {
  console.error(`[veyra-icons] res dizini bulunamad?: ${resDir}`);
  console.error('[veyra-icons] ?nce `pnpm exec cap add android` ?al??t?r?lm?? olmal?.');
  process.exit(1);
}

const written = [];
const startedAt = Date.now();

for (const density of DENSITIES) {
  written.push(write(`${density.folder}/ic_launcher.png`, legacyIcon(density.icon)));
  written.push(write(`${density.folder}/ic_launcher_round.png`, roundIcon(density.icon)));
  written.push(write(`${density.folder}/ic_launcher_foreground.png`, adaptiveForeground(density.foreground)));
}

for (const [file, width, height] of SPLASHES) {
  written.push(write(file, splash(width, height)));
}

console.log(`[veyra-icons] ${written.length} dosya ?retildi ? ${path.relative(repoRoot, resDir)}`);
console.log(`[veyra-icons] s?re: ${Date.now() - startedAt} ms`);
for (const file of written) console.log(`  ? ${file}`);
