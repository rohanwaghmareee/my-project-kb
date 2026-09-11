"use client";

import * as THREE from "three";

/** Deterministic pseudo random generator (mulberry32) so the world is stable between renders. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Gentle rolling hill height used for the outer terrain. */
export const LAKE = { x: 0, z: -26, rx: 33, rz: 18 };

/** 0 inside the lake, 1 far away from it. */
export function lakeMask(x: number, z: number) {
  const ed = Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz);
  return smoothstep(1.0, 1.35, ed);
}

export function hillHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  const ring = smoothstep(26, 60, d) * lakeMask(x, z);
  const n =
    Math.sin(x * 0.11) * Math.cos(z * 0.09) * 2.4 +
    Math.sin(x * 0.05 + z * 0.07) * 3.2 +
    Math.cos(x * 0.19 - z * 0.13) * 0.9;
  return Math.max(0, n + 2.2) * ring;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

export type TextTextureOptions = {
  font?: string;
  color?: string;
  background?: string;
  width?: number;
  height?: number;
  stroke?: string;
  shadow?: string;
  padding?: number;
};

/** Renders text into a canvas texture — works fully offline with the app's own fonts. */
export function makeTextTexture(text: string, opts: TextTextureOptions = {}) {
  const key = JSON.stringify([text, opts]);
  const cached = textureCache.get(key);
  if (cached) return cached;

  const width = opts.width ?? 1024;
  const height = opts.height ?? 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d")!;
  if (opts.background) {
    c.fillStyle = opts.background;
    roundRect(c, 0, 0, width, height, height * 0.3);
    c.fill();
  }
  const font = opts.font ?? `600 ${Math.floor(height * 0.5)}px "Great Vibes", "Quicksand", cursive`;
  c.font = font;
  c.textAlign = "center";
  c.textBaseline = "middle";
  if (opts.shadow) {
    c.shadowColor = opts.shadow;
    c.shadowBlur = height * 0.12;
  }
  if (opts.stroke) {
    c.lineWidth = height * 0.06;
    c.strokeStyle = opts.stroke;
    c.strokeText(text, width / 2, height / 2);
  }
  c.fillStyle = opts.color ?? "#ffffff";
  c.fillText(text, width / 2, height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  textureCache.set(key, tex);
  return tex;
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

let grassTexture: THREE.CanvasTexture | null = null;
/** Procedural speckled grass texture. */
export function makeGrassTexture() {
  if (grassTexture) return grassTexture;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#63b04f";
  c.fillRect(0, 0, size, size);
  const rng = makeRng(7);
  const palette = ["#57a544", "#6fbd5a", "#4f9c3f", "#7cc865", "#5aa94a"];
  for (let i = 0; i < 9000; i++) {
    c.fillStyle = palette[Math.floor(rng() * palette.length)];
    const x = rng() * size;
    const y = rng() * size;
    c.fillRect(x, y, 1 + rng() * 3, 1 + rng() * 6);
  }
  for (let i = 0; i < 260; i++) {
    c.fillStyle = rng() > 0.5 ? "#fff6a8" : "#ffd7ea";
    c.beginPath();
    c.arc(rng() * size, rng() * size, 1.2 + rng() * 1.2, 0, Math.PI * 2);
    c.fill();
  }
  grassTexture = new THREE.CanvasTexture(canvas);
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(28, 28);
  grassTexture.colorSpace = THREE.SRGBColorSpace;
  grassTexture.anisotropy = 4;
  return grassTexture;
}

let stoneTexture: THREE.CanvasTexture | null = null;
/** Procedural stone-block texture for the castle walls. */
export function makeStoneTexture() {
  if (stoneTexture) return stoneTexture;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#d9c4a6";
  c.fillRect(0, 0, size, size);
  const rng = makeRng(21);
  const rows = 10;
  const bh = size / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * bh;
    for (let x = -bh; x < size + bh; x += bh * 1.6) {
      const shade = 200 + Math.floor(rng() * 30);
      c.fillStyle = `rgb(${shade + 10}, ${shade - 8}, ${shade - 40})`;
      c.fillRect(x + offset + 2, r * bh + 2, bh * 1.6 - 4, bh - 4);
    }
  }
  c.strokeStyle = "rgba(120,95,70,0.35)";
  c.lineWidth = 2;
  for (let r = 0; r <= rows; r++) {
    c.beginPath();
    c.moveTo(0, r * bh);
    c.lineTo(size, r * bh);
    c.stroke();
  }
  stoneTexture = new THREE.CanvasTexture(canvas);
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(2, 3);
  stoneTexture.colorSpace = THREE.SRGBColorSpace;
  return stoneTexture;
}

/** Paints a cute tulip picture to hang inside the castle. */
export function makeTulipPaintingTexture(seed: number, bg: string) {
  const key = `painting-${seed}-${bg}`;
  const cached = textureCache.get(key);
  if (cached) return cached;
  const w = 512;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, "#fff7fb");
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);
  const rng = makeRng(seed);
  const colors = ["#ff6fa5", "#e63b5a", "#ffd54a", "#b57bee", "#ff9a4d"];
  const count = 5 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const x = 80 + (i / (count - 1)) * (w - 160) + (rng() - 0.5) * 40;
    const top = 180 + rng() * 120;
    const sc = 0.8 + rng() * 0.5;
    c.strokeStyle = "#4f9c3f";
    c.lineWidth = 8 * sc;
    c.beginPath();
    c.moveTo(x, h - 40);
    c.quadraticCurveTo(x + (rng() - 0.5) * 40, (top + h) / 2, x, top + 60 * sc);
    c.stroke();
    c.fillStyle = "#5fae4a";
    c.beginPath();
    c.ellipse(x - 30 * sc, h - 160, 14 * sc, 70 * sc, 0.4, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = colors[Math.floor(rng() * colors.length)];
    c.beginPath();
    c.moveTo(x - 46 * sc, top + 40 * sc);
    c.quadraticCurveTo(x - 50 * sc, top + 120 * sc, x, top + 130 * sc);
    c.quadraticCurveTo(x + 50 * sc, top + 120 * sc, x + 46 * sc, top + 40 * sc);
    c.quadraticCurveTo(x + 28 * sc, top + 70 * sc, x + 16 * sc, top + 20 * sc);
    c.quadraticCurveTo(x, top + 60 * sc, x - 16 * sc, top + 20 * sc);
    c.quadraticCurveTo(x - 28 * sc, top + 70 * sc, x - 46 * sc, top + 40 * sc);
    c.fill();
  }
  c.font = '48px "Great Vibes", cursive';
  c.fillStyle = "#8b4a6b";
  c.textAlign = "center";
  c.fillText("for Khushi", w / 2, 100);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export const tmpVec = new THREE.Vector3();
export const tmpObj = new THREE.Object3D();
export const tmpColor = new THREE.Color();
