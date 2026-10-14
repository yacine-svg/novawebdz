import * as THREE from "three";
import { archDims, archShape } from "./arch";
import { BW, FASCIA, FLOOR, GROUND, HALF, SIDEWALK, UPPER, endZ, shopSide, slotZ } from "./layout";
import { Merger, mat4 } from "./merge";
import { createPath } from "./path";
import { createDetail, glowSprite, type Detail } from "./shops";
import {
  facadeTextures,
  glowTexture,
  interiorTexture,
  neonTexture,
  plasterTexture,
  railingTexture,
  rng,
  roadTexture,
  shutterTexture,
  sidewalkTexture,
  skyTexture,
  streakTexture,
} from "./textures";
import type { ShopInfo, ShopSpec, StreetFonts, StreetFrame } from "./types";

export type StreetOptions = {
  shops: ShopSpec[]; // the last one is placed at the end of the street, facing the camera
  fonts: StreetFonts;
  quality?: "high" | "medium";
};

const add = THREE.AdditiveBlending;
const WALLS = ["#ECE8DF", "#F2EEE6", "#E6E2DA", "#EFEAE0", "#E9E5DD"];
const SHUTTERS = ["#2C5BA8", "#24508F", "#3466B3", "#2B5C9C", "#36639E"];

type Lit = { mat: THREE.MeshStandardMaterial; z: number; base: number; at: number };
type Lamp = { glow: THREE.Sprite; pool: THREE.Mesh; wash: THREE.Mesh; head: THREE.MeshBasicMaterial; at: number; z: number };
type Shop = {
  info: ShopInfo;
  spec: ShopSpec;
  root: THREE.Group;
  signMat: THREE.MeshBasicMaterial;
  halo: THREE.Sprite;
  interior: THREE.MeshBasicMaterial;
  spill: THREE.Sprite;
  streak: THREE.MeshBasicMaterial;
  detail: Detail;
  hit: THREE.Mesh;
  at: number;
  flicker: number;
};
type Thread = { core: THREE.ShaderMaterial; halo: THREE.ShaderMaterial; from: number };

export function createStreet(o: StreetOptions) {
  const fonts = o.fonts;
  const group = new THREE.Group();
  group.name = "street";
  const merger = new Merger();
  const R = rng(42);

  /* ---------------- shared materials ---------------- */
  const plaster = plasterTexture(7, "#ffffff");
  plaster.repeat.set(0.3, 0.3);
  const plasterMat = new THREE.MeshStandardMaterial({ map: plaster, vertexColors: true, roughness: 0.92 });
  const solidMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.05 });
  const metalMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.6 });
  const rail = railingTexture();
  const railMat = new THREE.MeshStandardMaterial({ map: rail, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true, roughness: 0.6, metalness: 0.4 });
  const shutterTex = shutterTexture("#6E7891", 4);
  shutterTex.repeat.set(0.45, 0.45);
  const shutterMat = new THREE.MeshStandardMaterial({ map: shutterTex, vertexColors: true, roughness: 0.55, metalness: 0.35 });

  /* facade textures: a few variants shared by all buildings */
  const variants = new Map<string, ReturnType<typeof facadeTextures>>();
  const facadeFor = (floors: number, v: number, balconyFloor: number) => {
    const key = `${floors}:${v}:${balconyFloor}`;
    let t = variants.get(key);
    if (!t) {
      t = facadeTextures({ cols: 3, floors, seed: 100 + floors * 7 + v * 31, wall: "#F3F0EA", shutter: SHUTTERS[v % SHUTTERS.length], lit: 0.38, balconyFloor });
      variants.set(key, t);
    }
    return t;
  };

  const lits: Lit[] = [];
  const lamps: Lamp[] = [];
  const shops: Shop[] = [];

  /* ---------------- one building ---------------- */
  function building(opts: {
    x: number;
    z: number;
    ry: number;
    width: number;
    floors: number;
    spec: ShopSpec | null;
    seed: number;
    index: number; // -1 for plain buildings
    side: -1 | 0 | 1;
  }) {
    const r = rng(opts.seed);
    const W = opts.width;
    const H = UPPER + opts.floors * FLOOR;
    const root = new THREE.Group();
    root.position.set(opts.x, 0, opts.z);
    root.rotation.y = opts.ry;
    root.updateMatrixWorld(true);
    const M = root.matrixWorld;
    const local = (m: THREE.Matrix4) => new THREE.Matrix4().multiplyMatrices(M, m);
    const wall = WALLS[Math.floor(r() * WALLS.length)];

    // body
    merger.add("plaster", plasterMat, new THREE.BoxGeometry(W - 0.04, H - GROUND, 9), local(mat4(0, GROUND + (H - GROUND) / 2, -4.55)), wall);
    // dark back wall behind the ground floor openings
    merger.add("solid", solidMat, new THREE.PlaneGeometry(W, GROUND), local(mat4(0, GROUND / 2, -3.9)), "#0B0E1A");

    // ground floor wall with arches
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, 0);
    shape.lineTo(W / 2, 0);
    shape.lineTo(W / 2, GROUND);
    shape.lineTo(-W / 2, GROUND);
    shape.lineTo(-W / 2, 0);
    const openings: { cx: number; d: ReturnType<typeof archDims> }[] = [];
    if (opts.spec) {
      openings.push({ cx: 0, d: archDims(opts.spec.arch) });
    } else {
      const two = W > 9;
      const xs = two ? [-W / 4, W / 4] : [0];
      for (const cx of xs) openings.push({ cx, d: archDims("round", false) });
    }
    const style = opts.spec ? opts.spec.arch : "round";
    for (const op of openings) shape.holes.push(archShape(style, op.cx, op.d));
    const gw = new THREE.ExtrudeGeometry(shape, { depth: 0.38, bevelEnabled: false, curveSegments: 6 });
    merger.add("plaster", plasterMat, gw, local(mat4(0, 0, -0.3)), shade(wall, 0.94));

    // painted plinth between openings
    const edges = [-W / 2, ...openings.flatMap((op) => [op.cx - op.d.w / 2, op.cx + op.d.w / 2]), W / 2];
    const plinthCol = opts.spec ? "#2A3150" : r() < 0.5 ? "#3B4A6E" : "#5C6478";
    for (let i = 0; i < edges.length; i += 2) {
      const w = edges[i + 1] - edges[i];
      if (w <= 0.05) continue;
      merger.add("solid", solidMat, new THREE.BoxGeometry(w, 0.75, 0.06), local(mat4((edges[i] + edges[i + 1]) / 2, 0.375, 0.11)), plinthCol);
    }

    // closed openings: shutters or doors
    if (!opts.spec) {
      for (const op of openings) {
        const closed = r() < 0.7;
        const h = op.d.top;
        merger.add(
          closed ? "shutter" : "solid",
          closed ? shutterMat : solidMat,
          new THREE.PlaneGeometry(op.d.w, h),
          local(mat4(op.cx, h / 2, -0.25)),
          closed ? (r() < 0.5 ? "#9AA6C0" : "#B7BFCF") : "#2C2216",
        );
      }
    }

    // fascia band above the ground floor
    merger.add("solid", solidMat, new THREE.BoxGeometry(W, FASCIA, 0.28), local(mat4(0, GROUND + FASCIA / 2, 0.06)), opts.spec ? "#141A2E" : shade(wall, 0.9));

    // upper floors facade (own material so its windows can switch on)
    const balcony = r() < 0.65;
    const v = Math.floor(r() * 5);
    const tex = facadeFor(opts.floors, v, balcony ? -1 : opts.floors - 2);
    const fm = new THREE.MeshStandardMaterial({
      map: tex.map,
      emissiveMap: tex.emissive,
      emissive: "#ffffff",
      emissiveIntensity: 0,
      roughness: 0.9,
      color: wall,
    });
    const facade = new THREE.Mesh(new THREE.PlaneGeometry(W, opts.floors * FLOOR), fm);
    facade.position.set(0, UPPER + (opts.floors * FLOOR) / 2, 0.01);
    if (opts.side === 1 && r() < 0.5) facade.scale.x = -1; // mirrored variant for variety
    root.add(facade);
    lits.push({ mat: fm, z: opts.z, base: 0.9 + r() * 0.5, at: 0.15 + r() * 0.65 });

    // balconies on the first upper floor
    if (balcony) {
      const colW = W / 3;
      for (let k = 0; k < 3; k++) {
        const cx = -W / 2 + colW * (k + 0.5);
        const by = UPPER + 0.55;
        merger.add("solid", solidMat, new THREE.BoxGeometry(2.3, 0.14, 0.8), local(mat4(cx, by, 0.4)), shade(wall, 0.85));
        merger.add("rail", railMat, new THREE.PlaneGeometry(2.3, 0.95), local(mat4(cx, by + 0.55, 0.79)), "#1A1E2C");
        for (const sx of [-1.15, 1.15]) merger.add("rail", railMat, new THREE.PlaneGeometry(0.78, 0.95), local(mat4(cx + sx, by + 0.55, 0.4, Math.PI / 2)), "#1A1E2C");
        if (r() < 0.22) dish(local, cx + 0.7, by + 0.6, 0.5);
      }
    }

    // cornice + parapet
    merger.add("solid", solidMat, new THREE.BoxGeometry(W + 0.25, 0.32, 0.55), local(mat4(0, H, 0.12)), shade(wall, 0.88));
    merger.add("plaster", plasterMat, new THREE.BoxGeometry(W, 0.7, 0.25), local(mat4(0, H + 0.5, 0)), wall);
    // roof: water tanks and satellite dishes, very Algiers
    if (r() < 0.6) {
      merger.add("solid", solidMat, new THREE.CylinderGeometry(0.55, 0.55, 1.3, 12), local(mat4(-W / 2 + 1.5 + r() * (W - 3), H + 0.65, -2.5)), "#C9CDD6");
    }
    for (let i = 0; i < 1 + Math.floor(r() * 3); i++) dish(local, -W / 2 + 1 + r() * (W - 2), H + 0.9, -0.8 - r() * 2.5);

    // wall lantern at the building edge
    if (opts.side !== 0) lamp(local, W / 2 - 0.05, opts.z);

    group.add(root);
    return { root, H };
  }

  function dish(local: (m: THREE.Matrix4) => THREE.Matrix4, x: number, y: number, z: number) {
    const geo = new THREE.SphereGeometry(0.42, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.8);
    merger.add("metal", metalMat, geo, local(mat4(x, y, z, 0, 1, 1, 1, Math.PI / 2 + 0.35)), "#D9DCE3");
    merger.add("metal", metalMat, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), local(mat4(x, y - 0.05, z + 0.22, 0, 1, 1, 1, Math.PI / 2.4)), "#9AA0AB");
  }

  function lamp(local: (m: THREE.Matrix4) => THREE.Matrix4, x: number, zWorld: number) {
    merger.add("metal", metalMat, new THREE.BoxGeometry(0.05, 0.05, 0.7), local(mat4(x, 4.55, 0.35)), "#1B1F2B");
    const headMat = new THREE.MeshBasicMaterial({ color: "#FFD9A0" });
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.34, 6), headMat);
    const p = new THREE.Vector3(x, 4.3, 0.72).applyMatrix4(local(new THREE.Matrix4()));
    head.position.copy(p);
    group.add(head);
    const glow = glowSprite("#FFC982", 2.6, 0);
    glow.position.copy(p);
    group.add(glow);
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({ map: glowTexture(), color: "#FFB866", transparent: true, opacity: 0, blending: add, depthWrite: false }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(p.x * 0.82, 0.03, p.z);
    group.add(pool);
    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({ map: glowTexture(), color: "#FFB061", transparent: true, opacity: 0, blending: add, depthWrite: false }),
    );
    wash.applyMatrix4(local(mat4(x, 3.6, 0.12)));
    group.add(wash);
    lamps.push({ glow, pool, wash, head: headMat, at: 0, z: zWorld });
  }

  /* ---------------- shops ---------------- */
  function shop(spec: ShopSpec, index: number, root: THREE.Group, side: -1 | 0 | 1) {
    const d = archDims(spec.arch);
    const g = new THREE.Group();
    root.add(g);
    // interior room, glowing
    const interior = new THREE.MeshBasicMaterial({ map: interiorTexture(spec.interiorTop, spec.interiorBottom, index * 13 + 5, !["garage", "barber", "wedding", "empty"].includes(spec.kind)), side: THREE.BackSide });
    const ceiling = new THREE.MeshBasicMaterial({ color: shade(spec.interiorBottom, 0.6), side: THREE.BackSide });
    const floor = new THREE.MeshBasicMaterial({ color: shade(spec.interiorBottom, 0.85), side: THREE.BackSide });
    // box faces: +x, -x, +y (ceiling), -y (floor), +z (open side, never seen), -z (back wall)
    const room = new THREE.Mesh(new THREE.BoxGeometry(d.w + 1.4, GROUND - 0.05, 3.4), [interior, interior, ceiling, floor, interior, interior]);
    room.position.set(0, (GROUND - 0.05) / 2, -0.3 - 1.7);
    g.add(room);
    // glass in the opening
    const glassShape = new THREE.Shape(archShape(spec.arch, 0, d).getPoints());
    const glass = new THREE.Mesh(
      new THREE.ShapeGeometry(glassShape),
      new THREE.MeshBasicMaterial({ color: "#B8CCFF", transparent: true, opacity: 0.07, blending: add, depthWrite: false }),
    );
    glass.position.z = -0.12;
    g.add(glass);
    // neon sign on the fascia
    const neon = neonTexture(spec.sign, spec.neon, fonts.display);
    const h = 0.9;
    let w = h * neon.aspect;
    const maxW = (side === 0 ? 12 : BW) * 0.82;
    const sh = w > maxW ? (h * maxW) / w : h;
    w = Math.min(w, maxW);
    const signMat = new THREE.MeshBasicMaterial({ map: neon.texture, transparent: true, blending: add, depthWrite: false, fog: false, opacity: 0 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, sh), signMat);
    sign.position.set(0, GROUND + FASCIA / 2, 0.24);
    g.add(sign);
    const halo = glowSprite(spec.neon, 1, 0);
    halo.scale.set(w * 1.25, 2.4, 1);
    halo.position.set(0, GROUND + FASCIA / 2, 0.5);
    g.add(halo);
    // light spilling out of the shop
    const spill = glowSprite(spec.interiorTop, 7, 0);
    spill.position.set(0, 1.8, 0.9);
    g.add(spill);
    // reflection of the sign on the wet street
    const streak = new THREE.MeshBasicMaterial({ map: streakTexture(), color: spec.neon, transparent: true, opacity: 0, blending: add, depthWrite: false });
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, 6), streak);
    sm.rotation.x = -Math.PI / 2;
    sm.position.set(0, -0.0 + 0.04, 3.2);
    g.add(sm);
    // animated detail
    const detail = createDetail(spec, fonts, side);
    g.add(detail.group);
    // invisible hit area for the pointer
    const hit = new THREE.Mesh(new THREE.BoxGeometry(BW * 0.85, GROUND + FASCIA + 1.2, 2.2), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, (GROUND + FASCIA + 1.2) / 2, 0.9);
    hit.userData.shop = index;
    g.add(hit);

    root.updateMatrixWorld(true);
    const door = new THREE.Vector3(0, 1.7, 0).applyMatrix4(root.matrixWorld);
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(root.matrixWorld);
    const focus = new THREE.Vector3(0, GROUND + FASCIA / 2, 0.3).applyMatrix4(root.matrixWorld);
    const info: ShopInfo = { index, slug: spec.slug, side, door, normal, focus };
    shops.push({ info, spec, root: g, signMat, halo, interior, spill, streak, detail, hit, at: 0, flicker: 1 });
  }

  /* ---------------- layout the street ---------------- */
  const projectShops = o.shops.slice(0, -1);
  const last = o.shops[o.shops.length - 1];
  const slots = projectShops.length;
  for (let k = -2; k < slots; k++) {
    for (const side of [-1, 1] as const) {
      const isShop = k >= 0 && shopSide(k) === side;
      const spec = isShop ? projectShops[k] : null;
      const floors = spec ? 3 + Math.floor(R() * 2) : 3 + Math.floor(R() * 3);
      const { root } = building({
        x: side * HALF,
        z: slotZ(k),
        ry: side === -1 ? Math.PI / 2 : -Math.PI / 2,
        width: BW,
        floors,
        spec,
        seed: 1000 + k * 17 + (side + 1) * 5,
        index: isShop ? k : -1,
        side,
      });
      if (spec) shop(spec, k, root, side);
    }
  }
  const zEnd = endZ(o.shops.length - 1);
  const endB = building({ x: 0, z: zEnd, ry: 0, width: 2 * HALF + 4, floors: 4, spec: last, seed: 77, index: slots, side: 0 });
  shop(last, slots, endB.root, 0);
  // side buildings flanking the end so the street feels closed
  for (const side of [-1, 1] as const) {
    building({ x: side * (HALF + 7 + 2), z: zEnd + 0.4, ry: 0, width: 14, floors: 5, spec: null, seed: 300 + side, index: -1, side: 0 });
  }

  /* ---------------- ground ---------------- */
  const len = 15 - zEnd + 30;
  const road = roadTexture();
  road.repeat.set(2, len / 10);
  const roadMat = new THREE.MeshStandardMaterial({ map: road, roughness: 0.42, metalness: 0.25, color: "#8C94B8" });
  const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, len), roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0, 15 - len / 2 + 15);
  group.add(roadMesh);
  const sw = sidewalkTexture();
  sw.repeat.set(1, len / 1.5);
  const swMat = new THREE.MeshStandardMaterial({ map: sw, roughness: 0.75, color: "#AAB2CC" });
  for (const side of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(SIDEWALK, 0.16, len), swMat);
    m.position.set(side * (HALF - SIDEWALK / 2), 0.08, roadMesh.position.z);
    group.add(m);
    merger.add("solid", solidMat, new THREE.BoxGeometry(0.12, 0.18, len), mat4(side * (HALF - SIDEWALK), 0.09, roadMesh.position.z), "#9CA3BA");
  }

  /* ---------------- threads: the red & blue web between shops ---------------- */
  const threads: Thread[] = [];
  const threadMat = (color: string, halo: boolean) =>
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOn: { value: 0 }, uTime: { value: 0 }, uSeed: { value: R() * 10 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: halo
        ? /* glsl */ `
        uniform vec3 uColor; uniform float uOn; uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(abs(dot(vN, vV)), 2.0); float flow = 0.6 + 0.4*sin(vUv.x*30.0 - uTime*2.5);
          float a = uOn * f * flow * 0.35; gl_FragColor = vec4(uColor * a, a); }`
        : /* glsl */ `
        uniform vec3 uColor; uniform float uOn; uniform float uTime; uniform float uSeed; varying vec2 vUv;
        void main(){ float pulse = smoothstep(0.92, 1.0, fract(vUv.x*1.0 - uTime*0.35 + uSeed));
          float a = uOn * (0.55 + 0.45*sin(vUv.x*60.0 - uTime*4.0)) + pulse*uOn*1.5;
          gl_FragColor = vec4(uColor * (0.25 + a), clamp(0.15 + a, 0.0, 1.0)); }`,
      transparent: true,
      blending: add,
      depthWrite: false,
      fog: false,
    });
  function thread(a: THREE.Vector3, b: THREE.Vector3, sag: number, color: string, from: number) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const k = i / 16;
      const p = new THREE.Vector3().lerpVectors(a, b, k);
      p.y -= Math.sin(k * Math.PI) * sag;
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const core = threadMat(color, false);
    const halo = threadMat(color, true);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.022, 5, false), core));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.14, 8, false), halo));
    threads.push({ core, halo, from });
  }
  const RED = "#FF2E4D";
  const BLUE = "#2E7BFF";
  const signs = shops.map((s) => s.info.focus);
  for (let i = 0; i < signs.length - 1; i++) {
    const A = signs[i].clone();
    const B = signs[i + 1].clone();
    A.y += 0.6;
    B.y += 0.6;
    thread(A.clone().add(new THREE.Vector3(0, 0.25, 1.2)), B.clone().add(new THREE.Vector3(0, 0.25, 1.2)), 1.4, RED, i);
    thread(A.clone().add(new THREE.Vector3(0, -0.15, -1.6)), B.clone().add(new THREE.Vector3(0, 0.55, -1.4)), 2.1, BLUE, i);
    // web strands up to the balconies of the facade across the street
    const up = A.clone();
    up.x = -up.x * 0.98;
    up.y = UPPER + 2.4;
    up.z += 3;
    thread(A, up, 0.5, i % 2 ? RED : BLUE, i);
  }
  // a few strands over the entrance, always lit: the web starts here
  for (let i = 0; i < 4; i++) {
    const z = 6 - i * 4.5;
    thread(new THREE.Vector3(-HALF + 0.2, 7 + (i % 2) * 1.5, z), new THREE.Vector3(HALF - 0.2, 8 - (i % 2) * 1.2, z - 3), 1.2, i % 2 ? RED : BLUE, -1);
  }

  /* ---------------- sky ---------------- */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(400, 24, 16),
    new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  sky.position.z = zEnd / 2;
  group.add(sky);
  const starCount = 900;
  const sp = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const th = R() * Math.PI * 2;
    const ph = R() * 0.9 + 0.12;
    sp[i * 3] = Math.cos(th) * Math.cos(ph) * 350;
    sp[i * 3 + 1] = Math.sin(ph) * 350;
    sp[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 350 + zEnd / 2;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#C9D6FF", size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
  group.add(stars);
  const moon = glowSprite("#DCE4FF", 60, 0.55);
  moon.position.set(-60, 120, zEnd - 120);
  const moonCore = glowSprite("#FFFFFF", 14, 0.95);
  moonCore.position.copy(moon.position);
  group.add(moon, moonCore);

  merger.build(group);

  /* ---------------- lights ---------------- */
  const hemi = new THREE.HemisphereLight("#4A5CA8", "#120E1C", 0.75);
  const moonLight = new THREE.DirectionalLight("#9FB4FF", 0.55);
  moonLight.position.set(-30, 50, 20);
  const pointer = new THREE.PointLight("#FFE1BE", 0, 16, 1.6);
  const focusLight = new THREE.PointLight("#ffffff", 0, 11, 1.6);
  group.add(hemi, moonLight, pointer, focusLight);

  // order lamps/shops for the switch-on sequence (closest to the camera first)
  lamps.sort((a, b) => b.z - a.z);
  lamps.forEach((l, i) => (l.at = 0.1 + (i / lamps.length) * 0.6));
  shops.forEach((s, i) => (s.at = 0.25 + (i / shops.length) * 0.55));

  const info = shops.map((s) => s.info);
  const path = createPath(info);

  /* ---------------- per-frame update ---------------- */
  const ray = new THREE.Raycaster();
  const v2 = new THREE.Vector2();
  const tmp = new THREE.Vector3();
  const hits = shops.map((s) => s.hit);
  const ramp = (x: number, at: number, w = 0.12) => THREE.MathUtils.clamp((x - at) / w, 0, 1);
  const flick = (time: number, seed: number) => (Math.sin(time * 61 + seed * 7) * Math.sin(time * 23 + seed) > 0.2 ? 1 : 0.35);

  function update(f: StreetFrame, camera: THREE.Camera) {
    const power = f.intro * (1 - f.dim);
    const focus = path.focusAt(f.t);
    for (const l of lits) l.mat.emissiveIntensity = l.base * ramp(power, l.at, 0.25);
    for (const l of lamps) {
      const on = ramp(power, l.at, 0.08);
      const fl = on > 0 && on < 1 ? flick(f.time, l.z) : 1;
      const v = on * fl;
      l.glow.material.opacity = 0.9 * v;
      (l.pool.material as THREE.MeshBasicMaterial).opacity = 0.5 * v;
      (l.wash.material as THREE.MeshBasicMaterial).opacity = 0.32 * v;
      l.head.color.set("#FFD9A0").multiplyScalar(0.15 + 0.85 * v);
    }
    shops.forEach((s, i) => {
      let on = ramp(power, s.at, 0.1);
      // the empty shop's sign still flickers: it was just installed
      if (s.spec.kind === "empty") on *= 0.75 + 0.25 * flick(f.time * 0.5, 3);
      else if (on > 0 && on < 1) on *= flick(f.time, i);
      const act = focus.shop === i ? focus.closeness : 0;
      s.flicker += ((f.hover === i ? 1 : 0) - s.flicker) * Math.min(1, f.dt * 8);
      const boost = 1 + 0.35 * s.flicker + 0.2 * act;
      s.signMat.opacity = Math.min(1, on * 0.95 * boost);
      s.halo.material.opacity = on * (0.22 + 0.25 * act + 0.2 * s.flicker);
      s.interior.color.setScalar(0.2 + 0.62 * on);
      s.spill.material.opacity = on * (0.16 + 0.14 * act);
      s.streak.opacity = on * (0.18 + 0.15 * act);
      s.detail.update({ time: f.time, dt: f.dt, act, on, hover: s.flicker });
    });
    for (const th of threads) {
      const lit = th.from < 0 ? power : THREE.MathUtils.clamp(f.t - th.from - 0.35, 0, 1) * power;
      th.core.uniforms.uOn.value = lit;
      th.halo.uniforms.uOn.value = lit;
      th.core.uniforms.uTime.value = f.time;
      th.halo.uniforms.uTime.value = f.time;
    }
    // coloured light from the shop in focus
    if (focus.shop >= 0) {
      const s = shops[focus.shop];
      focusLight.color.set(s.spec.neon);
      focusLight.position.copy(s.info.focus).addScaledVector(s.info.normal, 3.2);
      focusLight.position.y = 2.2;
      focusLight.intensity = 3.2 * focus.closeness * power;
    } else focusLight.intensity *= 0.9;
    // light that follows the pointer
    if (f.pointer) {
      v2.set(f.pointer.x, f.pointer.y);
      ray.setFromCamera(v2, camera);
      tmp.copy(ray.ray.direction).multiplyScalar(6).add(ray.ray.origin);
      pointer.position.lerp(tmp, Math.min(1, f.dt * 6));
      pointer.intensity += (14 * power - pointer.intensity) * Math.min(1, f.dt * 3);
    } else pointer.intensity *= 0.95;
    stars.rotation.y = f.time * 0.002;
  }

  /** Shop under a pointer position (normalised device coords), or -1. */
  function pick(x: number, y: number, camera: THREE.Camera) {
    v2.set(x, y);
    ray.setFromCamera(v2, camera);
    const h = ray.intersectObjects(hits, false)[0];
    return h ? (h.object.userData.shop as number) : -1;
  }

  function setupScene(scene: THREE.Scene) {
    scene.background = new THREE.Color("#060914");
    scene.fog = new THREE.FogExp2("#0B1030", 0.017);
  }

  function dispose() {
    group.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mm of mats) {
        for (const v of Object.values(mm)) if (v instanceof THREE.Texture) v.dispose();
        mm.dispose();
      }
    });
  }

  return { group, shops: info, path, update, pick, setupScene, dispose };
}

export type Street = ReturnType<typeof createStreet>;

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}
