import * as THREE from "three";

/* Laptop + phone layout for the case-study hero (world units). */
export const DEVICE = {
  fov: 34,
  camY: 0.35,
  groupPos: [-0.05, 0.05, 0] as [number, number, number],
  rotX: 0.06,
  rotY: -0.3,
  laptop: { w: 3.2, h: 2.0, depth: 2.0, tilt: -0.12, pos: [-0.4, -0.15, 0] as [number, number, number] },
  phone: { w: 0.86, h: 1.86, rotY: -0.25, pos: [1.7, -0.45, 0.9] as [number, number, number] },
};

/** Step the camera back on narrow canvases so both devices always fit. */
export const cameraZ = (aspect: number) => 6.6 * Math.max(1, 1.3 / aspect);

/** A flat rectangle with rounded corners, UVs spanning 0–1 like a plane. */
export function roundedPlane(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 6);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - x) / w;
    uv[i * 2 + 1] = (pos.getY(i) - y) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/** Fit a screenshot onto a screen like CSS `object-fit: cover`, keeping the top of the page. */
export function coverCrop(tex: THREE.Texture, planeAspect: number) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width || !img?.height) return;
  const ia = img.width / img.height;
  if (ia > planeAspect) {
    tex.repeat.set(planeAspect / ia, 1);
    tex.offset.set((1 - planeAspect / ia) / 2, 0);
  } else {
    tex.repeat.set(1, ia / planeAspect);
    tex.offset.set(0, 1 - ia / planeAspect);
  }
}
