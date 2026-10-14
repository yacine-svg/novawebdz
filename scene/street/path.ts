import * as THREE from "three";
import { plateau } from "@/lib/streetStore";
import type { ShopInfo } from "./types";

/* Camera path along the street: one key pose for the entrance, then one per
   shop. Scroll progress moves between keys with a pause at each shop. */

export type Pose = { pos: THREE.Vector3; target: THREE.Vector3 };

export { plateau };

export function createPath(shops: ShopInfo[]) {
  const keys: Pose[] = [
    { pos: new THREE.Vector3(0, 2.7, 15), target: new THREE.Vector3(0, 4.6, -40) },
  ];
  for (const s of shops) {
    if (s.side === 0) {
      // end of the street: the free storefront sits left of centre, the card goes on the right
      keys.push({
        pos: s.door.clone().add(new THREE.Vector3(-1.2, 0.4, 10)),
        target: s.door.clone().add(new THREE.Vector3(2.7, 1.1, 0)),
      });
    } else {
      // stand across the street, before the shop, and frame it on one side of the screen
      const pos = s.door.clone().addScaledVector(s.normal, 8.6);
      pos.z += 8.5;
      pos.y = 2.0;
      const target = s.door.clone().addScaledVector(s.normal, 3.6);
      target.y = 2.9;
      target.z -= 4.5;
      keys.push({ pos, target });
    }
  }
  const segments = keys.length - 1;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const fwd = new THREE.Vector3();

  /** Continuous position along the street for a 0..1 scroll progress. */
  const tAt = (p: number) => THREE.MathUtils.clamp(p, 0, 1) * segments;

  /** Camera pose for a continuous position t (0 = entrance, i + 1 = shop i). */
  function poseAt(t: number, out: Pose) {
    const k = Math.min(segments - 1, Math.max(0, Math.floor(t)));
    const f = THREE.MathUtils.clamp(t - k, 0, 1);
    const e = plateau(f);
    const A = keys[k], B = keys[k + 1];
    out.pos.lerpVectors(A.pos, B.pos, e);
    a.copy(A.target);
    b.copy(B.target);
    out.target.lerpVectors(a, b, e);
    // between two shops, look down the street rather than sweeping across facades
    fwd.copy(out.pos).add(new THREE.Vector3(0, 0.9, -22));
    const swing = Math.sin(Math.PI * e) * 0.75;
    out.target.lerp(fwd, swing);
    return out;
  }

  /** Which key the visitor is at: shop index (0-based) or -1 at the entrance / in between. */
  function focusAt(t: number) {
    const k = Math.round(t);
    const near = Math.abs(t - k) < 0.34;
    return { key: k, shop: near && k >= 1 ? k - 1 : -1, closeness: 1 - Math.min(1, Math.abs(t - k) / 0.5) };
  }

  /** Scroll progress (0..1) where shop i is centred. */
  const progressOfShop = (i: number) => (i + 1) / segments;

  return { keys, segments, tAt, poseAt, focusAt, progressOfShop };
}

export type StreetPath = ReturnType<typeof createPath>;
