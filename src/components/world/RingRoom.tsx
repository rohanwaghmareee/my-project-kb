"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFairy } from "@/lib/store";
import { makeRng, makeStoneTexture, tmpObj } from "@/lib/three-utils";
import { RoomCamera } from "./Interior";
import { Instanced, Reactive, TextPlane, getHeartGeometry } from "./Reactive";
import { Tulip } from "./Tulips";

const RADIUS = 9;
const HEIGHT = 9;

function Candles() {
  const flames = useRef<THREE.Group>(null);
  const candles = useMemo(() => {
    const rng = makeRng(31);
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2;
      const r = 6.2 + rng() * 1.6;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 0.35 + rng() * 0.7 };
    });
  }, []);
  useFrame(({ clock }) => {
    const g = flames.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((f, i) => {
      const s = 1 + Math.sin(t * 13 + i * 1.7) * 0.22;
      f.scale.set(s, s * 1.5, s);
    });
  });
  return (
    <group>
      {candles.map((c, i) => (
        <mesh key={i} position={[c.x, c.h / 2, c.z]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, c.h, 8]} />
          <meshStandardMaterial color="#fff2dc" roughness={0.7} />
        </mesh>
      ))}
      <group ref={flames}>
        {candles.map((c, i) => (
          <mesh key={i} position={[c.x, c.h + 0.07, c.z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffb85c" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Petals() {
  const geometry = useMemo(() => {
    const g = new THREE.CircleGeometry(0.16, 8);
    g.scale(0.65, 1, 1);
    return g;
  }, []);
  const { matrices, colors } = useMemo(() => {
    const rng = makeRng(64);
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    for (let i = 0; i < 220; i++) {
      const a = rng() * Math.PI * 2;
      const r = 1.6 + rng() * 6.4;
      tmpObj.position.set(Math.cos(a) * r, 0.01 + rng() * 0.01, Math.sin(a) * r);
      tmpObj.rotation.set(-Math.PI / 2, 0, rng() * Math.PI * 2);
      const s = 0.8 + rng() * 0.6;
      tmpObj.scale.set(s, s, s);
      tmpObj.updateMatrix();
      matrices.push(tmpObj.matrix.clone());
      colors.push(new THREE.Color(rng() > 0.5 ? "#e63b5a" : "#ff8fb6"));
    }
    return { matrices, colors };
  }, []);
  return (
    <Instanced matrices={matrices} colors={colors} geometry={geometry}>
      <meshStandardMaterial color="#ffffff" roughness={0.8} side={THREE.DoubleSide} />
    </Instanced>
  );
}

function FloatingHearts() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => getHeartGeometry(), []);
  const hearts = useMemo(() => {
    const rng = makeRng(12);
    return Array.from({ length: 34 }, () => ({
      a: rng() * Math.PI * 2,
      r: 1.5 + rng() * 6,
      y: rng() * 7,
      speed: 0.25 + rng() * 0.4,
      size: 0.6 + rng() * 0.9,
      wob: rng() * Math.PI * 2,
    }));
  }, []);
  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.getElapsedTime();
    hearts.forEach((h, i) => {
      h.y += delta * h.speed;
      if (h.y > 7.5) h.y = 0.3;
      tmpObj.position.set(
        Math.cos(h.a + t * 0.05) * h.r + Math.sin(t + h.wob) * 0.2,
        h.y,
        Math.sin(h.a + t * 0.05) * h.r,
      );
      tmpObj.quaternion.copy(state.camera.quaternion);
      tmpObj.scale.setScalar(h.size * 0.25);
      tmpObj.updateMatrix();
      m.setMatrixAt(i, tmpObj.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, hearts.length]} frustumCulled={false}>
      <meshBasicMaterial color="#ff7aa8" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}

function Ring() {
  const ringOpened = useFairy((s) => s.ringOpened);
  const openRing = useFairy((s) => s.openRing);
  const addBurst = useFairy((s) => s.addBurst);
  const group = useRef<THREE.Group>(null);
  const diamond = useRef<THREE.Mesh>(null);
  const rise = useRef(0);
  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    rise.current += ((ringOpened ? 1 : 0) - rise.current) * Math.min(1, delta * 1.6);
    g.rotation.y += delta * (0.8 + rise.current * 3.2);
    g.position.y = 0.32 + Math.sin(t * 1.5) * 0.04 + rise.current * 1.1;
    const s = 1 + rise.current * 0.8;
    g.scale.setScalar(s);
    if (diamond.current) diamond.current.rotation.y = -t * 0.8;
  });
  return (
    <Reactive
      id="ring"
      kind="none"
      message="💍 Khushi… this is for you"
      burst="hearts"
      burstColor="#ff6b9a"
      burstCount={44}
      sound="love"
      bubbleHeight={1.4}
      hoverScale={1.15}
      onReact={() => {
        openRing();
        [500, 1000, 1500].forEach((ms, i) =>
          window.setTimeout(
            () =>
              addBurst({
                position: [Math.sin(i) * 0.6, 2.6 + i * 0.4, Math.cos(i) * 0.6],
                color: ["#ff8fb6", "#ffd6ea", "#ff6b9a"][i],
                kind: "hearts",
                count: 24,
              }),
            ms,
          ),
        );
      }}
    >
      <group ref={group} position={[0, 0.32, 0]}>
        {/* generous invisible hit area so the ring is easy to tap */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.75, 12, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <mesh castShadow>
          <torusGeometry args={[0.32, 0.05, 24, 72]} />
          <meshStandardMaterial color="#ffd36b" metalness={1} roughness={0.18} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color="#ffd36b" metalness={1} roughness={0.2} />
        </mesh>
        {[
          [0.06, 0.06],
          [-0.06, 0.06],
          [0.06, -0.06],
          [-0.06, -0.06],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.44, z]} rotation={[x > 0 ? 0.3 : -0.3, 0, z > 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
            <meshStandardMaterial color="#ffd36b" metalness={1} roughness={0.2} />
          </mesh>
        ))}
        <mesh ref={diamond} position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#cfe9ff"
            emissiveIntensity={0.55}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            envMapIntensity={2.5}
          />
        </mesh>
        <pointLight position={[0, 0.6, 0]} intensity={8} distance={5} color="#ffd6ea" />
      </group>
    </Reactive>
  );
}

export function RingRoom() {
  const ringOpened = useFairy((s) => s.ringOpened);
  const setHint = useFairy((s) => s.setHint);
  const stone = useMemo(() => makeStoneTexture(), []);
  const vases = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        return [Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6] as [number, number, number];
      }),
    [],
  );
  useEffect(() => {
    setHint(ringOpened ? null : "You found the deepest room… touch the ring 💍");
    return () => setHint(null);
  }, [ringOpened, setHint]);

  return (
    <group>
      <ambientLight intensity={0.22} color="#ffd6ea" />
      <hemisphereLight args={["#ffb9d9", "#2a1626", 0.3]} />
      <spotLight
        position={[0, HEIGHT - 0.5, 0.6]}
        angle={0.42}
        penumbra={0.7}
        intensity={160}
        distance={24}
        color="#fff0f5"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 2.5, 4]} intensity={22} distance={16} color="#ffb85c" />
      <pointLight position={[0, 5, -3]} intensity={16} distance={16} color="#ff8fb6" />

      {/* round chamber */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS, HEIGHT, 48, 1, true]} />
        <meshStandardMaterial map={stone} color="#6a3f5c" roughness={1} side={THREE.BackSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[RADIUS, 48]} />
        <meshStandardMaterial color="#3a2033" roughness={0.6} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, HEIGHT, 0]}>
        <circleGeometry args={[RADIUS, 48]} />
        <meshStandardMaterial color="#1f0f1e" roughness={1} />
      </mesh>
      {/* rose carpet to the pedestal */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 4]}>
        <planeGeometry args={[2.4, 8]} />
        <meshStandardMaterial color="#8b1e3f" roughness={0.9} />
      </mesh>
      <Petals />
      <Candles />
      <FloatingHearts />
      {vases.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.36, 0.9, 16]} />
            <meshStandardMaterial color="#e6d9ea" roughness={0.3} />
          </mesh>
          {Array.from({ length: 7 }, (_, j) => {
            const a = (j / 7) * Math.PI * 2;
            return (
              <Tulip
                key={j}
                color={["#ff6fa5", "#e63b5a", "#ffd54a", "#b57bee", "#fff4f7", "#ff9a4d", "#ff6fa5"][j]}
                scale={1.1}
                position={[Math.cos(a) * 0.14, 0.7, Math.sin(a) * 0.14]}
                rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]}
              />
            );
          })}
        </group>
      ))}

      {/* pedestal */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.5, 0.3, 32]} />
          <meshStandardMaterial color="#efe3ee" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.7, 1.1, 24]} />
          <meshStandardMaterial color="#efe3ee" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.48, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.7, 0.16, 32]} />
          <meshStandardMaterial color="#efe3ee" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <boxGeometry args={[1, 0.26, 1]} />
          <meshStandardMaterial color="#8b1e3f" roughness={1} />
        </mesh>
        <group position={[0, 1.83, 0]}>
          <Ring />
        </group>
        <Sparkles count={60} scale={[2.2, 2.4, 2.2]} position={[0, 2.6, 0]} size={5} speed={0.6} color="#ffe6f3" />
      </group>

      <TextPlane
        text="For Khushi, with all my heart"
        width={9}
        height={1.4}
        position={[0, 5.2, -RADIUS + 0.2]}
        color="#ffd6ea"
        font='400 160px "Great Vibes", cursive'
        shadow="rgba(255,120,170,0.8)"
      />
      <Sparkles count={120} scale={[16, 8, 16]} position={[0, 4.5, 0]} size={2.5} speed={0.2} color="#ffd6ea" />

      <RoomCamera
        position={ringOpened ? [0, 2.6, 3.6] : [0, 2.7, 7.8]}
        look={ringOpened ? [0, 2.4, 0] : [0, 1.9, 0]}
        parallax={ringOpened ? 0.3 : 1}
      />
    </group>
  );
}
