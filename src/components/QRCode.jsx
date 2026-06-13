/**
 * QRCode.jsx — Pure client-side QR code generator
 * No external API calls. Uses canvas to render QR codes instantly.
 * Based on a minimal Reed-Solomon QR encoder (Mode: byte, ECC: M).
 */
import React, { useEffect, useRef } from 'react';

// ─── Tiny QR encoder (byte mode, ECC level M) ────────────────────────────────
// Adapted from public-domain QR JS implementations

const GF256 = (() => {
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  return { exp, log };
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF256.exp[(GF256.log[a] + GF256.log[b]) % 255];
}

function rsPoly(degree) {
  let p = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(p.length + 1).fill(0);
    for (let j = 0; j < p.length; j++) {
      next[j] ^= gfMul(p[j], GF256.exp[i]);
      next[j + 1] ^= p[j];
    }
    p = next;
  }
  return p;
}

function rsEncode(data, degree) {
  const gen = rsPoly(degree);
  const out = new Uint8Array(data.length + degree).fill(0);
  for (let i = 0; i < data.length; i++) out[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = out[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        out[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return out.slice(data.length);
}

// Version/ECC tables (version 1–4, ECC level M)
const QR_ECC_M = {
  1:  { total: 26,  data: 16, ec: 10, blocks: 1 },
  2:  { total: 44,  data: 28, ec: 16, blocks: 1 },
  3:  { total: 70,  data: 44, ec: 26, blocks: 2 },
  4:  { total: 100, data: 64, ec: 36, blocks: 2 },
};

function getVersion(byteLen) {
  for (const [v, info] of Object.entries(QR_ECC_M)) {
    if (info.data >= byteLen + 2) return { version: parseInt(v), ...info };
  }
  return { version: 4, ...QR_ECC_M[4] };
}

const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

class BitStream {
  constructor() { this.data = []; this.bits = 0; this.count = 0; }
  push(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      if (this.count % 8 === 0) this.data.push(0);
      if ((val >> i) & 1) this.data[this.data.length - 1] |= 1 << (7 - (this.count % 8));
      this.count++;
    }
  }
  pad(total) {
    const pads = [0xEC, 0x11];
    while (this.data.length < total) this.data.push(pads[this.data.length % 2 === 0 ? 0 : 1] ?? 0xEC);
    return this.data.slice(0, total);
  }
}

function encodeData(text, info) {
  const bytes = new TextEncoder().encode(text);
  const bs = new BitStream();
  bs.push(0b0100, 4);         // byte mode
  bs.push(bytes.length, 8);  // character count
  for (const b of bytes) bs.push(b, 8);
  bs.push(0, 4);             // terminator
  const padded = bs.pad(info.data);
  const ecBytes = info.ec / info.blocks;
  const result = [];
  const blockSize = Math.floor(info.data / info.blocks);
  for (let b = 0; b < info.blocks; b++) {
    const slice = padded.slice(b * blockSize, (b + 1) * blockSize);
    result.push(...slice, ...rsEncode(new Uint8Array(slice), ecBytes));
  }
  return result;
}

// Alignment pattern positions by version
const ALIGN_POS = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26] };

function makeMatrix(version) {
  const size = 17 + version * 4;
  const m = Array.from({ length: size }, () => new Array(size).fill(null));

  const setFinderPattern = (r, c) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const inBox = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        m[nr][nc] = inBox ? (isBorder || isInner ? 1 : 0) : 0;
      }
    }
  };
  setFinderPattern(0, 0);
  setFinderPattern(0, size - 7);
  setFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = m[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Dark module
  m[4 * version + 9][8] = 1;

  // Alignment patterns
  const ap = ALIGN_POS[version] || [];
  for (const r of ap) {
    for (const c of ap) {
      if (m[r][c] !== null) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          m[r + dr][c + dc] = isBorder || isCenter ? 1 : 0;
        }
      }
    }
  }

  return m;
}

function placeFormatInfo(m, mask, size) {
  // Format string: ECC level M (10) + mask pattern
  const fmtData = (0b10 << 3) | mask;
  const gen = 0b10100110111;
  let fmt = fmtData << 10;
  for (let i = 14; i >= 10; i--) {
    if (fmt & (1 << i)) fmt ^= gen << (i - 10);
  }
  fmt = ((fmtData << 10) | fmt) ^ 0b101010000010010;

  const positions = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
    [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  ];
  const positions2 = [
    [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1],
  ];

  for (let i = 0; i < 15; i++) {
    const bit = (fmt >> (14 - i)) & 1;
    m[positions[i][0]][positions[i][1]] = bit;
    m[positions2[i][0]][positions2[i][1]] = bit;
  }
}

function maskFn(pattern, r, c) {
  switch (pattern) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return (r * c) % 2 + (r * c) % 3 === 0;
    case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
    case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
  }
}

function buildQR(text) {
  const bytes = new TextEncoder().encode(text);
  const info = getVersion(bytes.length);
  const { version } = info;
  const size = 17 + version * 4;

  const dataBits = encodeData(text, info);
  const base = makeMatrix(version);

  // Place data bits using zigzag
  let bitIdx = 0;
  let up = true;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--;
    for (let r = up ? size - 1 : 0; up ? r >= 0 : r < size; up ? r-- : r++) {
      for (let cc = 0; cc < 2; cc++) {
        const col = c - cc;
        if (base[r][col] !== null) continue;
        const byteIdx = Math.floor(bitIdx / 8);
        const bitPos = 7 - (bitIdx % 8);
        base[r][col] = byteIdx < dataBits.length ? (dataBits[byteIdx] >> bitPos) & 1 : 0;
        bitIdx++;
      }
    }
    up = !up;
  }

  // Try mask 0 (checkerboard) — good default
  const mask = 0;
  const m = base.map((row, r) => row.map((cell, c) => {
    if (cell === null) return 0;
    return cell ^ (base[r][c] === null ? 0 : maskFn(mask, r, c) ? 1 : 0);
  }));

  // Re-apply fixed patterns (they should not be masked)
  const fixed = makeMatrix(version);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (fixed[r][c] !== null) m[r][c] = fixed[r][c];
    }
  }
  placeFormatInfo(m, mask, size);

  return { matrix: m, size };
}

// ─── React component ─────────────────────────────────────────────────────────

export default function QRCode({
  value,
  size = 200,
  fgColor = '#000000',
  bgColor = '#ffffff',
  quietZone = 4,
  style,
  className,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    let qr;
    try {
      qr = buildQR(String(value));
    } catch (e) {
      console.error('QR generation failed:', e);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { matrix, size: moduleCount } = qr;
    const moduleSize = Math.floor(size / (moduleCount + quietZone * 2));
    const totalSize = (moduleCount + quietZone * 2) * moduleSize;

    canvas.width = totalSize;
    canvas.height = totalSize;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalSize, totalSize);

    // Modules
    ctx.fillStyle = fgColor;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            (quietZone + c) * moduleSize,
            (quietZone + r) * moduleSize,
            moduleSize,
            moduleSize,
          );
        }
      }
    }
  }, [value, size, fgColor, bgColor, quietZone]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', ...style }}
      className={className}
      aria-label={`QR code for ${value}`}
    />
  );
}
