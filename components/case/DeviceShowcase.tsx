"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/data/projects";
import { useLang } from "@/lib/i18n";

/* The live site inside a 3D laptop and phone (drei <Html transform> + iframe).
   400 / distanceFactor CSS pixels make one world unit, so each iframe fills its screen exactly. */

const LAPTOP = { w: 3.2, h: 2.0, cssW: 1280 };
const PHONE = { w: 0.86, h: 1.86, cssW: 390 };
const df = (worldW: number, cssW: number) => (worldW * 400) / cssW;

function Screen({ url, title, cssW, worldW, worldH, poster }: { url: string; title: string; cssW: number; worldW: number; worldH: number; poster: string }) {
  const { t } = useLang();
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cssH = Math.round((cssW * worldH) / worldW);
  return (
    <Html transform distanceFactor={df(worldW, cssW)} position={[0, 0, 0.002]} zIndexRange={[20, 0]}>
      <div className="iframe-wrap" style={{ width: cssW, height: cssH, borderRadius: cssW > 600 ? 10 : 34, background: `#fff url(${poster}) top / cover no-repeat` }}>
        <iframe src={url} title={title} loading="lazy" onLoad={() => setLoaded(true)} style={{ pointerEvents: live ? "auto" : "none", opacity: loaded ? 1 : 0, transition: "opacity .6s" }} />
        {!live && (
          <button className="iframe-shield" type="button" onClick={() => setLive(true)} aria-label={`${t.caseStudy.open} : ${title}`}>
            <span>{loaded ? t.caseStudy.preview : t.caseStudy.loading}</span>
          </button>
        )}
      </div>
    </Html>
  );
}

function Devices({ project, reduced }: { project: Project; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, dt * 3);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, dt * 3);
    const time = state.clock.elapsedTime;
    g.rotation.y = -0.32 + (reduced ? 0 : pointer.current.x * 0.12);
    g.rotation.x = 0.06 - (reduced ? 0 : pointer.current.y * 0.06);
    g.position.y = reduced ? 0 : Math.sin(time * 0.8) * 0.04;
  });
  const body = new THREE.Color("#1A1D25");
  const alu = new THREE.Color("#B9BEC9");
  return (
    <group ref={group}>
      {/* laptop */}
      <group position={[-0.35, -0.25, 0]}>
        <RoundedBox args={[LAPTOP.w + 0.3, 0.1, 2.2]} radius={0.04} position={[0, -1.15, 1.0]}>
          <meshStandardMaterial color={alu} metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <group position={[0, -1.12, -0.05]} rotation={[-0.12, 0, 0]}>
          <RoundedBox args={[LAPTOP.w + 0.22, LAPTOP.h + 0.24, 0.07]} radius={0.05} position={[0, LAPTOP.h / 2 + 0.1, 0]}>
            <meshStandardMaterial color={body} metalness={0.4} roughness={0.4} />
          </RoundedBox>
          <group position={[0, LAPTOP.h / 2 + 0.12, 0.036]}>
            <Screen url={project.url} title={project.name} cssW={LAPTOP.cssW} worldW={LAPTOP.w} worldH={LAPTOP.h} poster={project.screens.poster} />
          </group>
        </group>
      </group>
      {/* phone */}
      <group position={[1.75, -0.55, 0.9]} rotation={[0, -0.25, 0]}>
        <RoundedBox args={[PHONE.w + 0.1, PHONE.h + 0.12, 0.09]} radius={0.08}>
          <meshStandardMaterial color={body} metalness={0.5} roughness={0.3} />
        </RoundedBox>
        <group position={[0, 0, 0.047]}>
          <Screen url={project.url} title={`${project.name} (mobile)`} cssW={PHONE.cssW} worldW={PHONE.w} worldH={PHONE.h} poster={project.screens.mobile ?? project.screens.poster} />
        </group>
      </group>
    </group>
  );
}

export default function DeviceShowcase({ project, reduced }: { project: Project; reduced: boolean }) {
  return (
    <div className="devices" aria-hidden="false">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.2, 6.4], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight position={[-4, 1, 3]} intensity={18} color={project.colors.accent} />
        <Devices project={project} reduced={reduced} />
      </Canvas>
    </div>
  );
}
