"use client";

import { Canvas, advance, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { publish, street as S } from "@/lib/streetStore";
import { buildStreet } from "./street/build";
import { createStreetController, type StreetController } from "./street/controller";

type Props = {
  /** Called when the camera has flown through a shop door. */
  onEnter: (slug: string) => void;
  /** Called when the empty storefront is clicked. */
  onEmpty: () => void;
  reducedMotion: boolean;
};

function StreetRig({ onEnter, onEmpty, reducedMotion }: Props) {
  const { scene, camera, gl } = useThree();
  const ctrl = useRef<StreetController | null>(null);
  const handlers = useRef({ onEnter, onEmpty });
  handlers.current = { onEnter, onEmpty };

  useEffect(() => {
    let alive = true;
    let cleanup = () => {};
    buildStreet().then((street) => {
      if (!alive) return street.dispose();
      street.setupScene(scene);
      scene.add(street.group);
      const c = createStreetController({
        street,
        camera: camera as THREE.PerspectiveCamera,
        dom: gl.domElement,
        reducedMotion,
        onEnter: (s) => handlers.current.onEnter(s),
        onEmpty: () => handlers.current.onEmpty(),
      });
      ctrl.current = c;
      S.ready = true;
      publish({ ready: true });
      cleanup = () => {
        c.dispose();
        scene.remove(street.group);
        street.dispose();
      };
    });
    return () => {
      alive = false;
      ctrl.current = null;
      cleanup();
    };
    // the street is built once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, camera, gl]);

  useEffect(() => ctrl.current?.setReducedMotion(reducedMotion), [reducedMotion]);

  useFrame((_, delta) => ctrl.current?.frame(delta));
  return null;
}

/** Renders on GSAP's ticker, so Lenis, ScrollTrigger and the 3D street share one clock.
    Stops rendering while the street is off-screen or the tab is hidden. */
function TickerLoop({ visible }: { visible: React.RefObject<boolean> }) {
  useEffect(() => {
    const tick = (seconds: number) => {
      if (visible.current && !document.hidden) advance(seconds);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [visible]);
  return null;
}

export default function StreetCanvas(props: Props) {
  const [dpr, setDpr] = useState<number>(() => Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1));
  const visible = useRef(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="street-canvas" aria-hidden="true">
      <Canvas
        frameloop="never"
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 50, near: 0.1, far: 900, position: [0, 2.7, 15] }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.08;
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(2, window.devicePixelRatio || 1))} />
        <TickerLoop visible={visible} />
        <StreetRig {...props} />
      </Canvas>
    </div>
  );
}
