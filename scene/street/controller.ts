import * as THREE from "three";
import { publish, street as S } from "@/lib/streetStore";
import type { Street } from "./street";

/* Everything the camera does, independent of React Three Fiber:
   follow the scroll, cursor parallax, hover, click → fly through the door. */

export type ControllerOptions = {
  street: Street;
  camera: THREE.PerspectiveCamera;
  dom: HTMLElement;
  reducedMotion: boolean;
  onEnter: (slug: string) => void;
  onEmpty: () => void;
};

export function createStreetController(o: ControllerOptions) {
  const { street, camera, dom } = o;
  let reduced = o.reducedMotion;
  let smoothT = street.path.tAt(S.progress);
  let time = 0;
  let pickClock = 0;
  const pose = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const look = new THREE.Vector3();
  const front = new THREE.Vector3();
  const inside = new THREE.Vector3();
  const aim = new THREE.Vector3();
  let flight: { t: number; from: THREE.Vector3; look: THREE.Vector3; index: number; slug: string; done: boolean } | null = null;
  let first = true;

  const ndc = (e: PointerEvent | MouseEvent) => {
    const r = dom.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 };
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    S.pointer = ndc(e);
  };
  const onLeave = () => {
    S.pointer = null;
    S.hover = -1;
    publish({ hover: -1 });
    dom.style.cursor = "";
  };
  const onClick = (e: MouseEvent) => {
    if (flight) return;
    const p = ndc(e);
    const i = street.pick(p.x, p.y, camera);
    if (i < 0) return;
    const slug = street.shops[i].slug;
    if (i === street.shops.length - 1) return o.onEmpty();
    if (reduced) return o.onEnter(slug);
    flight = { t: 0, from: camera.position.clone(), look: look.clone(), index: i, slug, done: false };
    S.flight = { index: i, slug };
    publish({ flying: true });
  };
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerleave", onLeave);
  dom.addEventListener("click", onClick);

  function frame(delta: number) {
    const dt = Math.min(Math.max(delta, 0), 1 / 20);
    time += dt;

    // follow the scroll, with a little extra easing (none when motion is reduced)
    const target = street.path.tAt(S.progress);
    smoothT = reduced || first ? target : smoothT + (target - smoothT) * Math.min(1, dt * 5);
    street.path.poseAt(smoothT, pose);

    const f = flight;
    if (!f) {
      const p = pose.pos;
      if (S.pointer && !reduced) {
        p.x += S.pointer.x * 0.35;
        p.y += S.pointer.y * 0.18;
      }
      camera.position.copy(p);
      if (first) look.copy(pose.target);
      else look.lerp(pose.target, reduced ? 1 : Math.min(1, dt * 8));
      camera.lookAt(look);
      const fov = camera.aspect < 1.2 ? 60 : 50;
      if (camera.fov !== fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    } else {
      f.t = Math.min(1, f.t + dt / 1.35);
      const e = f.t < 0.5 ? 4 * f.t * f.t * f.t : 1 - Math.pow(-2 * f.t + 2, 3) / 2;
      const shop = street.shops[f.index];
      front.copy(shop.door).addScaledVector(shop.normal, 1.4);
      inside.copy(shop.door).addScaledVector(shop.normal, -2.6);
      if (e < 0.6) camera.position.lerpVectors(f.from, front, e / 0.6);
      else camera.position.lerpVectors(front, inside, (e - 0.6) / 0.4);
      aim.copy(shop.door).addScaledVector(shop.normal, -6);
      look.lerpVectors(f.look, aim, Math.min(1, e * 1.6));
      camera.lookAt(look);
      camera.fov = 50 - 14 * e;
      camera.updateProjectionMatrix();
      // stay inside the shop until the case-study page replaces the street
      if (f.t >= 1 && !f.done) {
        f.done = true;
        o.onEnter(f.slug);
      }
    }
    first = false;

    // hover test, a few times per second is plenty
    pickClock += dt;
    if (S.pointer && pickClock > 0.08 && !f) {
      pickClock = 0;
      const h = street.pick(S.pointer.x, S.pointer.y, camera);
      if (h !== S.hover) {
        S.hover = h;
        publish({ hover: h });
        dom.style.cursor = h >= 0 ? "pointer" : "";
      }
    }

    street.update({ time, dt, intro: S.intro, t: smoothT, hover: S.hover, pointer: reduced ? null : S.pointer, dim: 0 }, camera);
  }

  return {
    frame,
    setReducedMotion(v: boolean) {
      reduced = v;
    },
    /** Forget a finished flight (e.g. when coming back to the street). */
    reset() {
      flight = null;
      first = true;
    },
    dispose() {
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
      dom.removeEventListener("click", onClick);
    },
  };
}

export type StreetController = ReturnType<typeof createStreetController>;
