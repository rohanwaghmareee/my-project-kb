"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useFairy } from "@/lib/store";
import { Interior } from "./Interior";
import { DEFAULT_CAMERA, Outside } from "./Outside";

export default function Scene() {
  const mode = useFairy((s) => s.mode);
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: DEFAULT_CAMERA, fov: 50, near: 0.1, far: 900 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.08;
        }}
      >
        <Suspense fallback={null}>{mode === "inside" ? <Interior /> : <Outside />}</Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
