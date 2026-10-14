import * as THREE from "three";
import { archDims, archPoints } from "./arch";
import { boardTexture, glowTexture, poleTexture, shutterTexture } from "./textures";
import type { ShopSpec, StreetFonts } from "./types";
import { FLOOR, UPPER } from "./layout";

/** State passed to every animated detail, each frame. */
export type DetailFrame = { time: number; dt: number; act: number; on: number; hover: number };
export type Detail = { group: THREE.Group; update: (f: DetailFrame) => void };

const add = THREE.AdditiveBlending;

export function glowSprite(color: string, scale: number, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: add, transparent: true, depthWrite: false, opacity, fog: false });
  const s = new THREE.Sprite(m);
  s.scale.setScalar(scale);
  return s;
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...extra });

/* ------------------------------------------------------------------ */
/* One factory per kind. Coordinates: shop-local, facade at z = 0,      */
/* x across the facade, y up, the street is towards +z.                 */
/* ------------------------------------------------------------------ */

function barber(spec: ShopSpec, sx: number): Detail {
  const g = new THREE.Group();
  const tex = poleTexture([spec.neon, "#F6EEDF", spec.accent, "#F6EEDF"]);
  tex.repeat.set(1, 1.6);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 1.9, 24, 1, true),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.21, 1.9, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.12, blending: add, depthWrite: false }),
  );
  const brass = std("#C9A24D", { metalness: 0.8, roughness: 0.3 });
  const capT = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), brass);
  const capB = capT.clone();
  capT.position.y = 0.97;
  capB.rotation.x = Math.PI;
  capB.position.y = -0.97;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.45), brass);
  arm.position.set(0, 0.6, -0.25);
  const halo = glowSprite("#FFF3E0", 2.6, 0.55);
  const pg = new THREE.Group();
  pg.add(pole, glass, capT, capB, arm, halo);
  pg.position.set(3.15 * sx, 2.6, 0.55);
  g.add(pg);
  // barber chair and mirrors inside
  const leather = std(spec.neon, { roughness: 0.35, metalness: 0.1 });
  const chrome = std("#D9DDE5", { metalness: 0.9, roughness: 0.2 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.7), leather);
  seat.position.set(0.4, 0.95, -2.2);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.16), leather);
  back.position.set(0.4, 1.45, -2.6);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.35, 0.85, 16), chrome);
  base.position.set(0.4, 0.43, -2.2);
  g.add(seat, back, base);
  const mirrorMat = new THREE.MeshBasicMaterial({ color: "#CFE3F0" });
  const frameMat = std("#C9A24D", { metalness: 0.8, roughness: 0.3 });
  for (const x of [-1.3, 0.4, 2.1]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 0.05), frameMat);
    frame.position.set(x, 2.6, -3.62);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.35), mirrorMat);
    glass.position.set(x, 2.6, -3.59);
    g.add(frame, glass);
  }
  return {
    group: g,
    update: ({ time, on, act }) => {
      tex.offset.y = -time * (0.35 + act * 0.5);
      (pole.material as THREE.MeshBasicMaterial).color.setScalar(0.25 + 0.75 * on);
      halo.material.opacity = 0.25 + 0.45 * on * (0.6 + act * 0.4);
    },
  };
}

function gym(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  // fluorescent tube that flickers
  const tubeMat = new THREE.MeshBasicMaterial({ color: "#E8F0FF" });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), tubeMat);
  tube.rotation.z = Math.PI / 2;
  tube.position.set(0, 4.05, -1.2);
  const tubeGlow = glowSprite(spec.neon, 4.2, 0.7);
  tubeGlow.position.copy(tube.position);
  g.add(tube, tubeGlow);
  // dumbbell rack
  const iron = std("#1B1F2A", { metalness: 0.7, roughness: 0.35 });
  const chrome = std("#C8CFDB", { metalness: 0.9, roughness: 0.25 });
  const rack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.6), iron);
  rack.position.set(0, 0.95, -2.3);
  g.add(rack);
  for (let i = 0; i < 6; i++) {
    const db = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), chrome);
    bar.rotation.z = Math.PI / 2;
    const w = 0.09 + i * 0.015;
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(w, w, 0.1, 12), iron);
    p1.rotation.z = Math.PI / 2;
    p1.position.x = -0.22;
    const p2 = p1.clone();
    p2.position.x = 0.22;
    db.add(bar, p1, p2);
    db.position.set(-1.4 + i * 0.56, 1.1, -2.3);
    g.add(db);
  }
  // kettlebell in the window, turning slowly
  const kb = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), std(spec.neon, { metalness: 0.5, roughness: 0.35 }));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 8, 20, Math.PI), iron);
  handle.position.y = 0.26;
  kb.add(ball, handle);
  kb.position.set(0, 1.55, -0.9);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), std("#E5484D"));
  plinth.position.set(0, 0.6, -0.9);
  g.add(kb, plinth);
  let flick = 1;
  return {
    group: g,
    update: ({ time, on, act, dt }) => {
      // irregular flicker, calmer when the shop is in focus
      const n = Math.sin(time * 37) * Math.sin(time * 13.3) * Math.sin(time * 5.1);
      const target = n > 0.55 - act * 0.3 ? 0.15 : 1;
      flick += (target - flick) * Math.min(1, dt * 40);
      const v = on * flick;
      tubeMat.color.setScalar(0.2 + 0.8 * v);
      tubeGlow.material.opacity = 0.75 * v;
      kb.rotation.y = time * 0.6;
    },
  };
}

function car(color: string) {
  const g = new THREE.Group();
  const paint = std(color, { metalness: 0.55, roughness: 0.25, emissive: color, emissiveIntensity: 0.18 });
  const dark = std("#0B0D14", { roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 3.4), paint);
  body.position.y = 0.55;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.5, 1.7), dark);
  cabin.position.set(0, 1.07, -0.25);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 1.0), paint);
  hood.position.set(0, 0.86, 1.05);
  hood.rotation.x = -0.12;
  g.add(body, cabin, hood);
  const wheelG = new THREE.CylinderGeometry(0.34, 0.34, 0.25, 16);
  for (const [x, z] of [[-0.85, 1.1], [0.85, 1.1], [-0.85, -1.15], [0.85, -1.15]]) {
    const w = new THREE.Mesh(wheelG, dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.34, z);
    g.add(w);
  }
  return g;
}

function garage(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  const d = archDims(spec.arch);
  // the roll-up shutter, pinned at the top of the opening
  const tex = shutterTexture("#5B6478", 9);
  tex.repeat.set(1, 3);
  const shutter = new THREE.Mesh(new THREE.PlaneGeometry(d.w + 0.2, d.top), std("#ffffff", { map: tex, metalness: 0.5, roughness: 0.5 }));
  shutter.geometry.translate(0, -d.top / 2, 0);
  shutter.position.set(0, d.top, -0.22);
  g.add(shutter);
  const c = car(spec.accent);
  c.position.set(0, 0, -1.95);
  g.add(c);
  // headlights + beams
  const beams: THREE.Mesh[] = [];
  const lights: THREE.Sprite[] = [];
  // soft light cones: bright at the lamp, fading along the beam and at the edges
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uOn: { value: 0 }, uColor: { value: new THREE.Color("#FFE7B0") } },
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `uniform float uOn; uniform vec3 uColor; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float along = pow(vUv.y, 1.6); float edge = pow(abs(dot(vN, vV)), 1.5);
        float a = uOn * along * edge * 0.22; gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true,
    blending: add,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const x of [-0.6, 0.6]) {
    const s = glowSprite("#FFF2D0", 1.2, 0);
    s.position.set(x, 0.62, -0.2);
    lights.push(s);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 20, 1, true), beamMat);
    beam.rotation.x = -Math.PI / 2 - 0.08;
    beam.position.set(x, 0.55, 1.55);
    beams.push(beam);
    g.add(s, beam);
  }
  let open = 0;
  return {
    group: g,
    update: ({ act, on, dt }) => {
      const target = Math.max(act, 0.06);
      open += (target - open) * Math.min(1, dt * 2.2);
      shutter.scale.y = Math.max(0.12, 1 - open * 0.9);
      const lightsOn = THREE.MathUtils.smoothstep(open, 0.55, 0.9) * on;
      lights.forEach((s) => (s.material.opacity = lightsOn));
      beamMat.uniforms.uOn.value = lightsOn;
    },
  };
}

function lantern(color: string) {
  const g = new THREE.Group();
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), std("#2A2622"));
  chain.position.y = -0.25;
  const bodyMat = new THREE.MeshBasicMaterial({ color });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.42, 8), bodyMat);
  body.position.y = -0.7;
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 8), std("#6B5330", { metalness: 0.7, roughness: 0.4 }));
  top.position.y = -0.4;
  const glow = glowSprite(color, 1.6, 0.8);
  glow.position.y = -0.7;
  g.add(chain, body, top, glow);
  return { g, bodyMat, glow };
}

function restaurant(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  const lanterns = [-1.7, 0, 1.7].map((x, i) => {
    const l = lantern(i === 1 ? "#FFC266" : spec.neon);
    l.g.position.set(x, 4.55, 0.55);
    g.add(l.g);
    return l;
  });
  // table with a tagine, steam rising
  const wood = std("#5A3A22");
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 20), wood);
  table.position.set(0, 0.85, -1.4);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.85, 8), wood);
  leg.position.set(0, 0.42, -1.4);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.05, 20), std(spec.accent));
  plate.position.set(0, 0.9, -1.4);
  const lid = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.42, 20), std("#C2592C"));
  lid.position.set(0, 1.13, -1.4);
  g.add(table, leg, plate, lid);
  const steam: THREE.Sprite[] = [];
  for (let i = 0; i < 5; i++) {
    const s = glowSprite("#FFFFFF", 0.5, 0);
    steam.push(s);
    g.add(s);
  }
  return {
    group: g,
    update: ({ time, on, act }) => {
      lanterns.forEach((l, i) => {
        l.g.rotation.z = Math.sin(time * 1.3 + i * 1.7) * (0.06 + act * 0.05);
        l.g.rotation.x = Math.cos(time * 1.1 + i) * 0.04;
        l.bodyMat.color.set(i === 1 ? "#FFC266" : spec.neon).multiplyScalar(0.25 + 0.75 * on);
        l.glow.material.opacity = 0.85 * on;
      });
      steam.forEach((s, i) => {
        const k = (time * 0.35 + i / steam.length) % 1;
        s.position.set(Math.sin(k * 6 + i) * 0.08, 1.4 + k * 1.1, -1.4);
        s.scale.setScalar(0.3 + k * 0.6);
        s.material.opacity = Math.sin(k * Math.PI) * 0.18 * on;
      });
    },
  };
}

function beauty(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.1, 28), std("#F6E3E4", { roughness: 0.4 }));
  ped.position.set(0, 0.55, -0.9);
  const prof: THREE.Vector2[] = [
    [0, 0], [0.28, 0], [0.31, 0.04], [0.31, 0.62], [0.24, 0.78], [0.1, 0.84], [0.1, 0.98], [0, 0.98],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bottle = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 32),
    new THREE.MeshPhysicalMaterial({ color: spec.accent, roughness: 0.12, metalness: 0.0, clearcoat: 1, transparent: true, opacity: 0.92 }),
  );
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 20), std("#C49A4F", { metalness: 0.9, roughness: 0.25 }));
  cap.position.y = 1.06;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.315, 0.26, 32, 1, true), std("#FBF4F3"));
  label.position.y = 0.36;
  const b = new THREE.Group();
  b.add(bottle, cap, label);
  b.position.set(0, 1.1, -0.9);
  b.scale.setScalar(1.25);
  g.add(ped, b);
  const halo = glowSprite(spec.neon, 2.4, 0.4);
  halo.position.set(0, 1.8, -1.1);
  g.add(halo);
  // sparkles
  const n = 22;
  const pos = new Float32Array(n * 3);
  const seeds: number[] = [];
  for (let i = 0; i < n; i++) seeds.push(Math.random() * 10);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const sparkMat = new THREE.PointsMaterial({ map: glowTexture(), color: "#FFE3EE", size: 0.22, transparent: true, blending: add, depthWrite: false, opacity: 0.9 });
  const sparks = new THREE.Points(geo, sparkMat);
  g.add(sparks);
  return {
    group: g,
    update: ({ time, on, act }) => {
      b.rotation.y = time * (0.5 + act * 0.6);
      b.position.y = 1.1 + Math.sin(time * 1.4) * 0.05;
      for (let i = 0; i < n; i++) {
        const s = seeds[i];
        const a = time * 0.5 + s;
        pos[i * 3] = Math.cos(a) * (0.7 + 0.25 * Math.sin(s * 3));
        pos[i * 3 + 1] = 1.2 + ((time * 0.25 + s) % 1.6);
        pos[i * 3 + 2] = -0.9 + Math.sin(a) * 0.6;
      }
      geo.attributes.position.needsUpdate = true;
      sparkMat.opacity = 0.9 * on * (0.5 + act * 0.5);
      halo.material.opacity = 0.35 * on;
    },
  };
}

function toothShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0.35);
  s.bezierCurveTo(-0.62, 0.75, -0.3, 0.95, 0, 0.78);
  s.bezierCurveTo(0.3, 0.95, 0.62, 0.75, 0.5, 0.35);
  s.bezierCurveTo(0.45, 0.05, 0.42, -0.5, 0.28, -0.72);
  s.bezierCurveTo(0.18, -0.85, 0.1, -0.5, 0.05, -0.25);
  s.bezierCurveTo(0.02, -0.15, -0.02, -0.15, -0.05, -0.25);
  s.bezierCurveTo(-0.1, -0.5, -0.18, -0.85, -0.28, -0.72);
  s.bezierCurveTo(-0.42, -0.5, -0.45, 0.05, -0.5, 0.35);
  return s;
}

function dental(spec: ShopSpec, sx: number): Detail {
  const g = new THREE.Group();
  const steel = std("#D5DBE3", { metalness: 0.8, roughness: 0.3 });
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.3), steel);
  bracket.position.set(3.7 * sx, 4.45, 0.65);
  g.add(bracket);
  const geo = new THREE.ExtrudeGeometry(toothShape(), { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 18 });
  geo.center();
  const toothMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 0.6, roughness: 0.3 });
  const tooth = new THREE.Mesh(geo, toothMat);
  const edge = glowSprite(spec.neon, 2.2, 0.6);
  const t = new THREE.Group();
  t.add(tooth, edge);
  t.position.set(3.7 * sx, 3.65, 1.05);
  t.scale.setScalar(0.85);
  g.add(t);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 4), steel);
  wire.position.set(3.7 * sx, 4.25, 1.05);
  g.add(wire);
  // dental chair silhouette inside
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 1.6), std(spec.accent, { roughness: 0.4 }));
  seat.position.set(-0.6, 0.85, -2.0);
  seat.rotation.x = -0.12;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.16), std(spec.accent, { roughness: 0.4 }));
  back.position.set(-0.6, 1.3, -2.75);
  back.rotation.x = -0.35;
  const lamp = glowSprite("#FFFFFF", 1.6, 0.7);
  lamp.position.set(0.2, 2.6, -1.9);
  g.add(seat, back, lamp);
  return {
    group: g,
    update: ({ time, on, act }) => {
      t.rotation.y = time * (0.7 + act * 0.8);
      toothMat.emissiveIntensity = 0.15 + 0.6 * on;
      edge.material.opacity = 0.55 * on;
      lamp.material.opacity = 0.7 * on;
    },
  };
}

function realestate(spec: ShopSpec, fonts: StreetFonts, sx: number): Detail {
  const g = new THREE.Group();
  // swinging "À VENDRE" board
  const steel = std("#1A1F2E", { metalness: 0.6, roughness: 0.4 });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.2), steel);
  arm.position.set(3.75 * sx, 4.5, 0.6);
  const boardMat = new THREE.MeshStandardMaterial({ map: boardTexture("À VENDRE", "#F2C14E", "#0F1B2D", fonts.display), side: THREE.DoubleSide, emissive: "#F2C14E", emissiveIntensity: 0.25 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.58), boardMat);
  board.geometry.translate(0, -0.42, 0);
  const swing = new THREE.Group();
  swing.position.set(3.75 * sx, 4.48, 1.05);
  swing.rotation.y = Math.PI / 2;
  swing.add(board);
  g.add(arm, swing);
  // real shutters on the first upper floor, they open when the shop is in focus
  const tex = shutterTexture(spec.shutter ?? "#1F4F9E", 21);
  tex.repeat.set(1, 2.4);
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: "#ffffff", roughness: 0.6 });
  const leaves: { m: THREE.Object3D; dir: number }[] = [];
  const colW = 11 / 3;
  const ww = colW * 0.34, wh = FLOOR * 0.62;
  const cy = UPPER + FLOOR - FLOOR * 0.16 - wh / 2;
  for (let k = 0; k < 3; k++) {
    const cx = -11 / 2 + colW * (k + 0.5);
    for (const dir of [-1, 1]) {
      const geo = new THREE.BoxGeometry(ww / 2 + 0.02, wh + 0.04, 0.05);
      geo.translate((-dir * (ww / 2 + 0.02)) / 2, 0, 0);
      const leaf = new THREE.Mesh(geo, mat);
      const hinge = new THREE.Group();
      hinge.position.set(cx + (dir * ww) / 2, cy, 0.06);
      hinge.add(leaf);
      g.add(hinge);
      leaves.push({ m: hinge, dir });
    }
  }
  const warm: THREE.Sprite[] = [];
  for (let k = 0; k < 3; k++) {
    const s = glowSprite("#FFC27A", 1.8, 0);
    s.position.set(-11 / 2 + colW * (k + 0.5), cy, 0.2);
    warm.push(s);
    g.add(s);
  }
  let open = 0;
  return {
    group: g,
    update: ({ time, on, act, dt }) => {
      swing.rotation.x = Math.sin(time * 1.6) * 0.12;
      open += (act - open) * Math.min(1, dt * 2.5);
      leaves.forEach(({ m, dir }, i) => {
        const delay = (i % 6) * 0.06;
        const o = THREE.MathUtils.clamp((open - delay) / (1 - delay), 0, 1);
        m.rotation.y = dir * o * Math.PI * 0.92;
      });
      warm.forEach((s) => (s.material.opacity = 0.7 * open * on));
      boardMat.emissiveIntensity = 0.08 + 0.3 * on;
    },
  };
}

function wedding(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  // gold string lights hanging in swags across the facade
  const pts: number[] = [];
  const swags: [number, number][] = [[-5.2, -1.8], [-1.8, 1.8], [1.8, 5.2]];
  for (const [a, b] of swags) {
    for (let i = 0; i <= 14; i++) {
      const k = i / 14;
      const x = a + (b - a) * k;
      const y = 4.95 - Math.sin(k * Math.PI) * 0.55;
      pts.push(x, y, 0.45);
    }
  }
  for (let i = 0; i <= 16; i++) {
    // second, lower row inside the arch
    const k = i / 16;
    pts.push(-2 + 4 * k, 4.25 - Math.sin(k * Math.PI) * 0.45, 0.25);
  }
  const n = pts.length / 3;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const cols = new Float32Array(n * 3);
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.PointsMaterial({ map: glowTexture(), size: 0.38, vertexColors: true, transparent: true, blending: add, depthWrite: false });
  const bulbs = new THREE.Points(geo, mat);
  g.add(bulbs);
  const wireMat = new THREE.LineBasicMaterial({ color: "#3A2F1A" });
  for (const [a, b] of swags) {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const k = i / 14;
      p.push(new THREE.Vector3(a + (b - a) * k, 4.95 - Math.sin(k * Math.PI) * 0.55 + 0.04, 0.45));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), wireMat));
  }
  // chandelier glow inside
  const ch = glowSprite("#FFE2A0", 3.4, 0.8);
  ch.position.set(0, 3.6, -1.6);
  g.add(ch);
  const gold = new THREE.Color(spec.neon);
  const warm = new THREE.Color("#FFF1C9");
  const tmp = new THREE.Color();
  return {
    group: g,
    update: ({ time, on, act }) => {
      for (let i = 0; i < n; i++) {
        const tw = 0.55 + 0.45 * Math.sin(time * (2 + (i % 5) * 0.7) + i * 1.3);
        tmp.copy(i % 3 === 0 ? warm : gold).multiplyScalar(on * (0.5 + 0.5 * tw) * (0.8 + act * 0.4));
        cols[i * 3] = tmp.r;
        cols[i * 3 + 1] = tmp.g;
        cols[i * 3 + 2] = tmp.b;
      }
      geo.attributes.color.needsUpdate = true;
      ch.material.opacity = 0.8 * on;
    },
  };
}

function travel(spec: ShopSpec): Detail {
  const g = new THREE.Group();
  const d = archDims(spec.arch);
  const p2 = archPoints(spec.arch, 0, d).slice(1, -1);
  const curve = new THREE.CatmullRomCurve3(p2.map((p) => new THREE.Vector3(p.x, p.y, 0.12)), false, "centripetal");
  const tubeMat = new THREE.MeshBasicMaterial({ color: spec.neon });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.045, 6, false), tubeMat);
  const haloMat = new THREE.MeshBasicMaterial({ color: spec.neon, transparent: true, opacity: 0.25, blending: add, depthWrite: false });
  const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.22, 8, false), haloMat);
  g.add(tube, halo);
  // globe with an orbiting plane
  const globe = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 16), std("#0E1A33", { roughness: 0.5 }));
  const wireMat = new THREE.LineBasicMaterial({ color: spec.neon, transparent: true, opacity: 0.9 });
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(0.55, 14, 10)), wireMat);
  globe.add(core, wire);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.25, 0.9, 12), std("#A97F33", { metalness: 0.8, roughness: 0.3 }));
  stand.position.y = -0.95;
  const ringPivot = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), new THREE.MeshBasicMaterial({ color: "#FFFFFF" }));
  plane.rotation.z = -Math.PI / 2;
  plane.position.x = 0.82;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.006, 4, 64), new THREE.MeshBasicMaterial({ color: spec.neon, transparent: true, opacity: 0.5 }));
  ring.rotation.x = Math.PI / 2;
  ringPivot.add(plane, ring);
  ringPivot.rotation.z = 0.35;
  const gHalo = glowSprite(spec.neon, 2.6, 0.35);
  const gg = new THREE.Group();
  gg.add(globe, stand, ringPivot, gHalo);
  gg.position.set(0, 1.85, -1.0);
  g.add(gg);
  return {
    group: g,
    update: ({ time, on, act }) => {
      globe.rotation.y = time * 0.45;
      ringPivot.rotation.y = -time * (0.9 + act * 0.6);
      const pulse = 0.75 + 0.25 * Math.sin(time * 2.2);
      tubeMat.color.set(spec.neon).multiplyScalar(0.2 + 0.8 * on * pulse);
      haloMat.opacity = 0.28 * on * pulse * (0.7 + act * 0.5);
      wireMat.opacity = 0.9 * on;
      gHalo.material.opacity = 0.35 * on;
    },
  };
}

function empty(spec: ShopSpec, fonts: StreetFonts): Detail {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 4), std("#111"));
  cord.geometry.translate(0, -0.6, 0);
  const bulbMat = new THREE.MeshBasicMaterial({ color: "#FFE9C2" });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), bulbMat);
  bulb.position.y = -1.25;
  const glow = glowSprite("#FFD9A0", 2.6, 0.9);
  glow.position.y = -1.25;
  const pend = new THREE.Group();
  pend.add(cord, bulb, glow);
  pend.position.set(0, 4.5, -1.3);
  g.add(pend);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.65),
    new THREE.MeshStandardMaterial({ map: boardTexture("À LOUER", "#F4EFE6", "#C8102E", fonts.display), roughness: 0.9 }),
  );
  board.position.set(1.1, 1.5, -0.24);
  board.rotation.z = -0.05;
  g.add(board);
  return {
    group: g,
    update: ({ time, on }) => {
      pend.rotation.z = Math.sin(time * 0.9) * 0.08;
      bulbMat.color.set("#FFE9C2").multiplyScalar(0.2 + 0.8 * on);
      glow.material.opacity = 0.9 * on;
    },
  };
}

export function createDetail(spec: ShopSpec, fonts: StreetFonts, side: -1 | 0 | 1 = -1): Detail {
  // +x of a left-hand facade points down the street (towards the screen centre); mirror for the right side
  const sx = side === 1 ? -1 : 1;
  switch (spec.kind) {
    case "barber":
      return barber(spec, sx);
    case "gym":
      return gym(spec);
    case "garage":
      return garage(spec);
    case "restaurant":
      return restaurant(spec);
    case "beauty":
      return beauty(spec);
    case "dental":
      return dental(spec, sx);
    case "realestate":
      return realestate(spec, fonts, sx);
    case "wedding":
      return wedding(spec);
    case "travel":
      return travel(spec);
    default:
      return empty(spec, fonts);
  }
}
