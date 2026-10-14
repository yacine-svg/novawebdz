import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Collects static pieces and merges them into one mesh per material,
    so the whole street draws in a few dozen calls instead of hundreds. */
export class Merger {
  private parts = new Map<string, { material: THREE.Material; geoms: THREE.BufferGeometry[] }>();
  private tmpColor = new THREE.Color();

  add(key: string, material: THREE.Material, geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, color = "#ffffff") {
    let g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    g.applyMatrix4(matrix);
    // keep only the attributes every piece has
    for (const name of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) {
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    const n = g.attributes.position.count;
    const c = this.tmpColor.set(color);
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    let entry = this.parts.get(key);
    if (!entry) this.parts.set(key, (entry = { material, geoms: [] }));
    entry.geoms.push(g);
    if (g !== geometry && geometry !== g) {
      /* the source geometry is shared, keep it */
    }
  }

  build(target: THREE.Object3D) {
    for (const [key, { material, geoms }] of this.parts) {
      const merged = mergeGeometries(geoms, false);
      geoms.forEach((g) => g.dispose());
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, material);
      mesh.name = `merged:${key}`;
      mesh.matrixAutoUpdate = false;
      target.add(mesh);
    }
    this.parts.clear();
  }
}

export const mat4 = (x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")),
    new THREE.Vector3(sx, sy, sz),
  );
