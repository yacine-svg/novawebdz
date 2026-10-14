import * as THREE from "three";

/* Every texture of the street is drawn here with the Canvas 2D API:
   no image files to download, and the look stays consistent. */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Soft round glow, reused by every lamp, sign halo and headlight. */
let glowCache: THREE.Texture | null = null;
export function glowTexture() {
  if (glowCache) return glowCache;
  const { c, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,.55)");
  g.addColorStop(0.45, "rgba(255,255,255,.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowCache = toTexture(c, false);
  return glowCache;
}

/** Long soft streak: neon reflections on the wet street. */
let streakCache: THREE.Texture | null = null;
export function streakTexture() {
  if (streakCache) return streakCache;
  const { c, ctx } = canvas(64, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.15, "rgba(255,255,255,.75)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  const img = ctx.getImageData(0, 0, 64, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 64; x++) {
      const k = Math.pow(Math.max(0, 1 - Math.abs(x - 31.5) / 32), 2.2);
      img.data[(y * 64 + x) * 4 + 3] *= k;
    }
  ctx.putImageData(img, 0, 0);
  streakCache = toTexture(c, false);
  return streakCache;
}

export type FacadeOpts = {
  cols: number;
  floors: number;
  seed: number;
  wall: string; // off-white tint
  shutter: string; // blue shutters
  lit: number; // share of lit windows (0..1)
  balconyFloor: number; // floor index (0 = first upper floor) with balconies drawn in the texture, -1 for none
};

/** Upper floors of an Algiers building: whitewashed wall, tall windows, blue shutters.
    Returns the colour map and an emissive map where only the lit windows glow. */
export function facadeTextures(o: FacadeOpts) {
  const W = 512;
  const FH = 150;
  const H = o.floors * FH;
  const r = rng(o.seed);
  const { c, ctx } = canvas(W, H);
  const e = canvas(W, H);

  // wall + soft grime
  ctx.fillStyle = o.wall;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) {
    const x = r() * W, y = r() * H;
    ctx.fillStyle = `rgba(${90 + r() * 40},${90 + r() * 40},${110 + r() * 40},${r() * 0.05})`;
    ctx.fillRect(x, y, 1 + r() * 3, 1 + r() * 3);
  }
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(40,45,70,0)");
    g.addColorStop(1, `rgba(40,45,70,${0.05 + r() * 0.06})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, H * r() * 0.6, 4 + r() * 14, H);
  }
  e.ctx.fillStyle = "#000";
  e.ctx.fillRect(0, 0, W, H);

  const colW = W / o.cols;
  for (let f = 0; f < o.floors; f++) {
    const y0 = f * FH;
    // floor band
    ctx.fillStyle = "rgba(60,64,90,.10)";
    ctx.fillRect(0, y0 + FH - 8, W, 4);
    for (let k = 0; k < o.cols; k++) {
      const cx = colW * (k + 0.5);
      const ww = colW * 0.34, wh = FH * 0.62;
      const wx = cx - ww / 2, wy = y0 + FH * 0.16;
      const lit = r() < o.lit;
      const state = r(); // <.35 closed, <.7 open, else half
      // stone frame
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.fillRect(wx - 7, wy - 9, ww + 14, wh + 16);
      ctx.fillStyle = "rgba(70,74,100,.18)";
      ctx.fillRect(wx - 7, wy + wh + 2, ww + 14, 5);
      // glass
      if (lit) {
        const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
        g.addColorStop(0, "#FFD9A0");
        g.addColorStop(1, "#E89B52");
        ctx.fillStyle = g;
        e.ctx.fillStyle = r() < 0.5 ? "#FFC98A" : "#FFB36B";
        e.ctx.fillRect(wx, wy, ww, wh);
      } else {
        ctx.fillStyle = "#1B2340";
      }
      ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
      // shutters (louvres)
      const louvre = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = o.shutter;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(0,0,20,.28)";
        for (let ly = y + 5; ly < y + h - 3; ly += 7) ctx.fillRect(x + 3, ly, w - 6, 2);
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(x, y, 2, h);
      };
      if (state < 0.35) {
        louvre(wx, wy, ww / 2 - 1, wh);
        louvre(wx + ww / 2 + 1, wy, ww / 2 - 1, wh);
        e.ctx.fillStyle = "#000";
        e.ctx.fillRect(wx, wy, ww, wh);
        if (lit) {
          // light leaking through the louvres
          e.ctx.fillStyle = "rgba(255,170,90,.35)";
          for (let ly = wy + 5; ly < wy + wh - 3; ly += 7) e.ctx.fillRect(wx + 3, ly, ww - 6, 2);
        }
      } else if (state < 0.7) {
        louvre(wx - ww / 2 - 4, wy, ww / 2, wh);
        louvre(wx + ww + 4, wy, ww / 2, wh);
      } else {
        louvre(wx - ww / 2 - 4, wy, ww / 2, wh);
        louvre(wx + ww / 2 + 1, wy, ww / 2 - 1, wh);
        e.ctx.fillStyle = "#000";
        e.ctx.fillRect(wx + ww / 2, wy, ww / 2, wh);
      }
      // balcony railing drawn flat (the 3D balconies sit on top of it)
      if (f === o.balconyFloor) {
        ctx.fillStyle = "rgba(30,34,52,.85)";
        const by = wy + wh - FH * 0.22;
        ctx.fillRect(wx - ww * 0.55, by, ww * 2.1, 3);
        for (let bx = wx - ww * 0.55; bx < wx + ww * 1.55; bx += 7) ctx.fillRect(bx, by, 2, FH * 0.22);
      }
    }
  }
  // cornice shadow at the top
  const g = ctx.createLinearGradient(0, 0, 0, 30);
  g.addColorStop(0, "rgba(30,34,60,.35)");
  g.addColorStop(1, "rgba(30,34,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 30);

  return { map: toTexture(c), emissive: toTexture(e.c) };
}

/** Plaster for ground floors, side walls and the arch reveals. */
export function plasterTexture(seed: number, tint: string) {
  const { c, ctx } = canvas(256, 256);
  const r = rng(seed);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(50,55,80,${r() * 0.06})`;
    ctx.fillRect(r() * 256, r() * 256, 1 + r() * 4, 1 + r() * 4);
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Corrugated metal shutter ("rideau"), as used by every closed shop in Algiers. */
export function shutterTexture(tone: string, seed = 3) {
  const { c, ctx } = canvas(256, 256);
  const r = rng(seed);
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(0, y, 256, 2);
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fillRect(0, y + 5, 256, 2);
  }
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(0,0,0,${r() * 0.12})`;
    ctx.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2);
  }
  // a little tag on some shutters
  if (r() < 0.6) {
    ctx.strokeStyle = r() < 0.5 ? "rgba(230,70,80,.55)" : "rgba(80,140,255,.55)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    const x = 60 + r() * 100, y = 120 + r() * 60;
    ctx.moveTo(x, y);
    for (let i = 0; i < 6; i++) ctx.lineTo(x + i * 14 + r() * 10, y - 20 + r() * 40);
    ctx.stroke();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Wrought-iron balcony railing with transparency. */
let railCache: THREE.Texture | null = null;
export function railingTexture() {
  if (railCache) return railCache;
  const { c, ctx } = canvas(256, 64);
  ctx.clearRect(0, 0, 256, 64);
  ctx.strokeStyle = "#141826";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 3, 252, 58);
  ctx.lineWidth = 2;
  for (let x = 10; x < 256; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 6);
    ctx.lineTo(x, 60);
    ctx.stroke();
  }
  for (let x = 16; x < 250; x += 24) {
    ctx.beginPath();
    ctx.arc(x, 32, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  railCache = toTexture(c);
  railCache.wrapS = THREE.RepeatWrapping;
  return railCache;
}

/** Road: dark asphalt with a faint sheen; sidewalks: stone slabs. */
export function roadTexture() {
  const { c, ctx } = canvas(512, 512);
  const r = rng(11);
  ctx.fillStyle = "#151827";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const v = 20 + r() * 40;
    ctx.fillStyle = `rgba(${v},${v + 4},${v + 18},${0.25 + r() * 0.3})`;
    ctx.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2);
  }
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(8,10,20,${0.2 + r() * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(r() * 512, r() * 512, 20 + r() * 60, 8 + r() * 20, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function sidewalkTexture() {
  const { c, ctx } = canvas(256, 256);
  const r = rng(5);
  ctx.fillStyle = "#3A3F55";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64)
    for (let x = 0; x < 256; x += 64) {
      const v = 58 + r() * 18;
      ctx.fillStyle = `rgb(${v},${v + 4},${v + 20})`;
      ctx.fillRect(x + 2, y + 2, 60, 60);
    }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Neon sign: glowing tube letters on a transparent background. */
export function neonTexture(text: string, color: string, font: string, opts: { core?: string; weight?: number; tracking?: number } = {}) {
  const fontSize = 120;
  const pad = 70;
  const weight = opts.weight ?? 700;
  const tracking = opts.tracking ?? 0.04;
  const probe = canvas(4, 4).ctx;
  probe.font = `${weight} ${fontSize}px ${font}`;
  const letters = [...text];
  const widths = letters.map((ch) => probe.measureText(ch).width);
  const textW = widths.reduce((a, b) => a + b, 0) + tracking * fontSize * (letters.length - 1);
  const W = Math.min(4096, Math.ceil(textW + pad * 2));
  const H = fontSize + pad * 2;
  const { c, ctx } = canvas(W, H);
  ctx.font = `${weight} ${fontSize}px ${font}`;
  ctx.textBaseline = "middle";
  const draw = (stroke: string, width: number, blur: number, fill?: string) => {
    let x = pad;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    for (let i = 0; i < letters.length; i++) {
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillText(letters[i], x, H / 2 + 6);
      } else {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.strokeText(letters[i], x, H / 2 + 6);
      }
      x += widths[i] + tracking * fontSize;
    }
  };
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  draw(color, 16, 70);
  draw(color, 9, 26);
  draw(color, 5, 10);
  draw(opts.core ?? "#FFFFFF", 2.2, 6);
  const t = toTexture(c);
  return { texture: t, aspect: W / H };
}

/** Back wall of a lit shop interior: vertical gradient with shelves and a warm floor. */
export function interiorTexture(top: string, bottom: string, seed: number, shelves = true) {
  const { c, ctx } = canvas(256, 256);
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  if (shelves) {
    for (let y = 70; y < 200; y += 44) {
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(20, y, 216, 5);
      for (let x = 26; x < 230; x += 10 + r() * 14) {
        const h = 10 + r() * 22;
        ctx.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.18})`;
        ctx.fillRect(x, y - h, 5 + r() * 6, h);
      }
    }
  }
  const v = ctx.createRadialGradient(128, 40, 10, 128, 60, 220);
  v.addColorStop(0, "rgba(255,240,220,.32)");
  v.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, 256, 256);
  const edge = ctx.createRadialGradient(128, 128, 90, 128, 128, 190);
  edge.addColorStop(0, "rgba(0,0,10,0)");
  edge.addColorStop(1, "rgba(0,0,10,.45)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(c);
}

/** Barber pole stripes (scrolled in the shader to look like it turns). */
export function poleTexture(colors: string[]) {
  const { c, ctx } = canvas(128, 256);
  ctx.fillStyle = "#F6EEDF";
  ctx.fillRect(0, 0, 128, 256);
  ctx.save();
  ctx.translate(64, 128);
  ctx.rotate(-Math.PI / 5);
  for (let i = -8; i < 8; i++) {
    ctx.fillStyle = colors[((i % colors.length) + colors.length) % colors.length];
    ctx.fillRect(-200, i * 44, 400, 22);
  }
  ctx.restore();
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Hand-written paper sign ("À LOUER", "À VENDRE"). */
export function boardTexture(text: string, bg: string, ink: string, font: string) {
  const { c, ctx } = canvas(512, 256);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 484, 228);
  ctx.fillStyle = ink;
  ctx.font = `800 92px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 132);
  return toTexture(c);
}

/** Night sky: deep navy gradient, stars are separate points. */
export function skyTexture() {
  const { c, ctx } = canvas(16, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#03050E");
  g.addColorStop(0.45, "#0A1230");
  g.addColorStop(0.62, "#1A2350");
  g.addColorStop(0.7, "#2B1F48");
  g.addColorStop(1, "#0A0D1C");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 512);
  return toTexture(c);
}
