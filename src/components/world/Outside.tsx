"use client";

import { OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import * as THREE from "three";
import { useFairy } from "@/lib/store";
import { makeRng } from "@/lib/three-utils";
import { Animals } from "./Animals";
import { Castle } from "./Castle";
import { Balloons, BlossomTree, Cake, Gift, MushroomCluster } from "./Props";
import { Bursts, Sign } from "./Reactive";
import {
  Clouds,
  FlowerBushes,
  Forest,
  Ground,
  Lake,
  LampPosts,
  Mountains,
  SkyDome,
  StonePath,
  Waterfall,
  pathCurve,
  plantable,
} from "./Terrain";
import { TulipField, WishGarden, pickTulipColor, type TulipSpot } from "./Tulips";

export const DEFAULT_CAMERA: [number, number, number] = [2, 13, 46];
export const DEFAULT_TARGET: [number, number, number] = [0, 4, 2];

function useGardenTulips(): TulipSpot[] {
  return useMemo(() => {
    const rng = makeRng(2024);
    const spots: TulipSpot[] = [];
    const tangent = new THREE.Vector3();
    let guard = 0;
    while (spots.length < 470 && guard < 6000) {
      guard++;
      const u = rng();
      const p = pathCurve.getPointAt(u);
      pathCurve.getTangentAt(u, tangent);
      const side = rng() > 0.5 ? 1 : -1;
      const off = side * (3.1 + rng() * 4.6);
      const x = p.x - tangent.z * off;
      const z = p.z + tangent.x * off;
      if (!plantable(x, z)) continue;
      if (Math.hypot(x - 14, z - 15) < 5.2) continue; // wish garden
      if (Math.hypot(x + 5.5, z - 9.5) < 1.9) continue; // cake table
      if (Math.hypot(x - 5, z - 12) < 2.2) continue; // gifts
      if (Math.hypot(x + 4.6, z - 19) < 1) continue; // bunny
      spots.push({
        x,
        z,
        color: pickTulipColor(rng),
        scale: 0.85 + rng() * 0.4,
        rot: rng() * Math.PI * 2,
        lean: (rng() - 0.5) * 0.2,
      });
    }
    // beds in front of the castle
    for (let i = 0; i < 110; i++) {
      const side = rng() > 0.5 ? 1 : -1;
      const x = side * (3.6 + rng() * 7.5);
      const z = 8 + rng() * 3.2;
      if (Math.hypot(x + 5.5, z - 9.5) < 1.9) continue;
      if (Math.hypot(x - 5, z - 12) < 2.2) continue;
      spots.push({ x, z, color: pickTulipColor(rng), scale: 0.85 + rng() * 0.4, rot: rng() * Math.PI * 2 });
    }
    // lake shore
    for (let i = 0; i < 70; i++) {
      const x = (rng() - 0.5) * 30;
      const z = -9.6 - rng() * 1.6 - Math.abs(x) * 0.02;
      if (Math.abs(x) < 12 && z > -10.5) continue;
      spots.push({ x, z, color: pickTulipColor(rng), scale: 0.8 + rng() * 0.3, rot: rng() * Math.PI * 2 });
    }
    return spots;
  }, []);
}

function CameraRig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const focus = useFairy((s) => s.focus);
  const clearFocus = useFairy((s) => s.clearFocus);
  const { camera } = useThree();
  const [auto, setAuto] = useState(true);
  const active = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(...DEFAULT_CAMERA);
    const c = controls.current;
    if (c) {
      c.target.set(...DEFAULT_TARGET);
      c.update();
    }
  }, [camera]);

  useEffect(() => {
    if (!focus) {
      active.current = false;
      return;
    }
    targetPos.current.set(...focus.position);
    targetLook.current.set(...focus.target);
    active.current = true;
    setAuto(false);
  }, [focus]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    if (active.current) {
      const k = 1 - Math.exp(-delta * 2.2);
      camera.position.lerp(targetPos.current, k);
      c.target.lerp(targetLook.current, k);
      if (camera.position.distanceTo(targetPos.current) < 0.08) active.current = false;
      c.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={4}
      maxDistance={75}
      maxPolarAngle={Math.PI / 2.06}
      minPolarAngle={0.12}
      target={DEFAULT_TARGET}
      autoRotate={auto}
      autoRotateSpeed={0.35}
      regress
      onStart={() => {
        active.current = false;
        setAuto(false);
        clearFocus();
      }}
    />
  );
}

export function Outside() {
  const tulips = useGardenTulips();
  return (
    <>
      <color attach="background" args={["#f4dfea"]} />
      <fog attach="fog" args={["#f1dbe8", 60, 210]} />
      <SkyDome />
      <hemisphereLight args={["#fff2f8", "#5f9d4d", 0.85]} />
      <ambientLight intensity={0.35} color="#ffe9f3" />
      <directionalLight
        position={[32, 48, 22]}
        intensity={2.6}
        color="#fff3df"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-camera-near={5}
        shadow-camera-far={150}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />

      <Ground />
      <Lake />
      <Mountains />
      <Clouds />
      <Forest />
      <StonePath />
      <LampPosts />
      <FlowerBushes />
      <Waterfall />
      <Castle />

      <TulipField spots={tulips} />
      <WishGarden />

      <Animals />

      <Cake position={[-5.5, 0, 9.6]} />
      <Gift position={[4.6, 0, 11.6]} color="#ff6fa5" ribbon="#fff4f7" message="🎁 Inside: a whole year full of laughter" size={1.1} rotation={[0, 0.4, 0]} />
      <Gift position={[6, 0, 12.6]} color="#b57bee" ribbon="#ffd54a" message="🎁 Inside: adventures we'll take together" size={0.85} rotation={[0, -0.3, 0]} />
      <Gift position={[5.4, 1.1 * 0.9, 11.6]} color="#7dd3fc" ribbon="#ff6fa5" message="🎁 Inside: endless tulips & endless love" size={0.6} rotation={[0, 0.9, 0]} />
      <Balloons position={[7.4, 0, 10.4]} />
      <Balloons position={[-8, 0, 11]} colors={["#ffd54a", "#ff6fa5", "#a7f3d0", "#b57bee"]} />

      <MushroomCluster position={[-13.5, 0, 14]} rotation={[0, 0.5, 0]} />
      <MushroomCluster position={[16.5, 0, 8]} rotation={[0, -1, 0]} />
      <MushroomCluster position={[-16, 0, 6]} rotation={[0, 2, 0]} />

      <BlossomTree position={[18, 0, 12]} scale={1.4} />
      <BlossomTree position={[-17, 0, 16]} scale={1.2} color="#ffc6de" />
      <BlossomTree position={[20, 0, -3]} scale={1.1} color="#ffd1e0" />
      <BlossomTree position={[-12, 0, 24]} scale={1.0} color="#ffb7d5" />
      <BlossomTree position={[14, 0, 24]} scale={1.15} color="#ffc6de" />

      <Sign text="Khushi's Fairy Land" position={[-4.2, 0, 31]} rotation={[0, 0.35, 0]} width={4.2} />

      <Sparkles count={180} scale={[64, 9, 64]} position={[0, 4.5, 6]} size={2.6} speed={0.3} opacity={0.6} color="#fff6fb" />

      <Bursts />
      <CameraRig />
    </>
  );
}
