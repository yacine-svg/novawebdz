"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/data/projects";
import { DEVICE, cameraZ, coverCrop, roundedPlane } from "./deviceGeometry";
import type { PreviewView } from "./LivePreview";

/* A 3D laptop and phone showing the project's screenshots.
   The screens are WebGL textures, so they always sit exactly on the devices
   (CSS-3D iframes drift when the page lands on a half pixel).
   Clicking a screen opens the live site in a full-size preview. */

function Screen({ url, w, h, r, view, onOpen }: { url: string; w: number; h: number; r: number; view: PreviewView; onOpen: (v: PreviewView) => void }) {
  const gl = useThree((s) => s.gl);
  const source = useLoader(THREE.TextureLoader, url);
  // own copy: the same screenshot can be cropped differently on each device
  const tex = useMemo(() => {
    const t = source.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    coverCrop(t, w / h);
    t.needsUpdate = true;
    return t;
  }, [source, gl, w, h]);
  const geometry = useMemo(() => roundedPlane(w, h, r), [w, h, r]);
  useEffect(() => () => {
    tex.dispose();
    geometry.dispose();
  }, [tex, geometry]);
  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(view);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, DEVICE.camY, cameraZ(aspect));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Devices({ project, reduced, onOpen }: { project: Project; reduced: boolean; onOpen: (v: PreviewView) => void }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, dt * 3);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, dt * 3);
    g.rotation.y = DEVICE.rotY + (reduced ? 0 : pointer.current.x * 0.12);
    g.rotation.x = DEVICE.rotX - (reduced ? 0 : pointer.current.y * 0.06);
    g.position.y = DEVICE.groupPos[1] + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.04);
  });
  const L = DEVICE.laptop;
  const P = DEVICE.phone;
  const body = useMemo(() => new THREE.Color("#1A1D25"), []);
  const alu = useMemo(() => new THREE.Color("#B9BEC9"), []);
  return (
    <group ref={group} position={DEVICE.groupPos}>
      {/* laptop */}
      <group position={L.pos}>
        <RoundedBox args={[L.w + 0.3, 0.1, L.depth]} radius={0.04} position={[0, -1.15, L.depth / 2 - 0.1]}>
          <meshStandardMaterial color={alu} metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <group position={[0, -1.12, -0.05]} rotation={[L.tilt, 0, 0]}>
          <RoundedBox args={[L.w + 0.22, L.h + 0.24, 0.07]} radius={0.05} position={[0, L.h / 2 + 0.1, 0]}>
            <meshStandardMaterial color={body} metalness={0.4} roughness={0.4} />
          </RoundedBox>
          <group position={[0, L.h / 2 + 0.12, 0.036]}>
            <Screen url={project.screens.poster} w={L.w} h={L.h} r={0.03} view="desktop" onOpen={onOpen} />
          </group>
        </group>
      </group>
      {/* phone */}
      <group position={P.pos} rotation={[0, P.rotY, 0]}>
        <RoundedBox args={[P.w + 0.1, P.h + 0.12, 0.09]} radius={0.08}>
          <meshStandardMaterial color={body} metalness={0.5} roughness={0.3} />
        </RoundedBox>
        <group position={[0, 0, 0.047]}>
          <Screen url={project.screens.mobile ?? project.screens.poster} w={P.w} h={P.h} r={0.09} view="mobile" onOpen={onOpen} />
        </group>
      </group>
    </group>
  );
}

export default function DeviceShowcase({ project, reduced, onOpen }: { project: Project; reduced: boolean; onOpen: (v: PreviewView) => void }) {
  useEffect(() => () => void (document.body.style.cursor = ""), []);
  return (
    <div className="devices">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, DEVICE.camY, cameraZ(1.2)], fov: DEVICE.fov }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Rig />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight position={[-4, 1, 3]} intensity={18} color={project.colors.accent} />
        <Suspense fallback={null}>
          <Devices project={project} reduced={reduced} onOpen={onOpen} />
        </Suspense>
      </Canvas>
    </div>
  );
}
