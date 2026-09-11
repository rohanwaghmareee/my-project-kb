"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Reactive } from "./Reactive";

/* ------------------------------------------------------------------ */
/* Gift box                                                             */
/* ------------------------------------------------------------------ */

export function Gift({
  position,
  rotation,
  color = "#ff6fa5",
  ribbon = "#fff4f7",
  message,
  size = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  ribbon?: string;
  message: string;
  size?: number;
}) {
  const lid = useRef<THREE.Group>(null);
  const open = useRef(0);
  const target = useRef(0);
  const timer = useRef<number | null>(null);
  useFrame((_, delta) => {
    open.current += (target.current - open.current) * Math.min(1, delta * 5);
    const l = lid.current;
    if (l) {
      l.position.y = size * 0.8 + open.current * 0.9 * size;
      l.position.x = open.current * 0.4 * size;
      l.rotation.z = open.current * 0.55;
    }
  });
  return (
    <Reactive
      id="gift"
      kind="bounce"
      message={message}
      burst="confetti"
      burstCount={34}
      sound="chime"
      bubbleHeight={size * 2}
      position={position}
      rotation={rotation}
      onReact={() => {
        target.current = 1;
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => (target.current = 0), 3500);
      }}
    >
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.7, size * 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.35, 0]}>
        <boxGeometry args={[size * 0.92, size * 0.72, size * 0.18]} />
        <meshStandardMaterial color={ribbon} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.35, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.72, size * 0.92]} />
        <meshStandardMaterial color={ribbon} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.45, 0]}>
        <boxGeometry args={[size * 0.7, size * 0.5, size * 0.7]} />
        <meshStandardMaterial color="#ffe9a8" emissive="#ffd36b" emissiveIntensity={0.8} />
      </mesh>
      <group ref={lid} position={[0, size * 0.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size, size * 0.2, size]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[size * 1.02, size * 0.22, size * 0.18]} />
          <meshStandardMaterial color={ribbon} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[size * 0.18, size * 0.22, size * 1.02]} />
          <meshStandardMaterial color={ribbon} roughness={0.5} />
        </mesh>
        <mesh position={[0, size * 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[size * 0.14, size * 0.05, 8, 16]} />
          <meshStandardMaterial color={ribbon} roughness={0.5} />
        </mesh>
        <mesh position={[0, size * 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.14, size * 0.05, 8, 16]} />
          <meshStandardMaterial color={ribbon} roughness={0.5} />
        </mesh>
      </group>
    </Reactive>
  );
}

/* ------------------------------------------------------------------ */
/* Birthday cake                                                        */
/* ------------------------------------------------------------------ */

function Tier({ y, r, h, color, frosting }: { y: number; r: number; h: number; color: string; frosting: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 28]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, h, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[r, 0.045, 8, 28]} />
        <meshStandardMaterial color={frosting} roughness={0.5} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, h - 0.08 - (i % 3) * 0.04, Math.sin(a) * r]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={frosting} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

const CANDLES: [number, number][] = [
  [0, 0],
  [0.22, 0.1],
  [-0.2, 0.14],
  [0.08, -0.24],
  [-0.12, -0.2],
  [0.24, -0.1],
];

export function Cake({ position }: { position: [number, number, number] }) {
  const [lit, setLit] = useState(false);
  const flames = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = flames.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((f, i) => {
      const s = lit ? 1 + Math.sin(t * 14 + i * 1.3) * 0.25 : 0.0001;
      f.scale.set(s, s * 1.4, s);
    });
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.1, 28]} />
        <meshStandardMaterial color="#fbeaf1" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.35, 1.1, 0.4, 28, 1, true]} />
        <meshStandardMaterial color="#ffd4e4" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.14, 0.24, 0.7, 12]} />
        <meshStandardMaterial color="#8d6a52" roughness={0.9} />
      </mesh>
      <Reactive
        id="cake"
        kind="bounce"
        message={["🎂 Make a wish, birthday girl!", "🎂 Blow the candles… and wish for tulips!"]}
        burst="sparkles"
        burstColor="#ffe08a"
        burstCount={30}
        sound="magic"
        bubbleHeight={1.9}
        position={[0, 0.77, 0]}
        onReact={() => setLit(true)}
      >
        <Tier y={0} r={0.82} h={0.34} color="#ffb3c7" frosting="#fff5f8" />
        <Tier y={0.34} r={0.6} h={0.32} color="#fff5f8" frosting="#ff8fb1" />
        <Tier y={0.66} r={0.4} h={0.3} color="#ffb3c7" frosting="#fff5f8" />
        {CANDLES.map(([x, z], i) => (
          <mesh key={i} position={[x, 1.11, z]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.3, 8]} />
            <meshStandardMaterial color={["#ff6fa5", "#7dd3fc", "#ffd54a"][i % 3]} />
          </mesh>
        ))}
        <group ref={flames}>
          {CANDLES.map(([x, z], i) => (
            <mesh key={i} position={[x, 1.32, z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffb347" toneMapped={false} />
            </mesh>
          ))}
        </group>
        {lit && <pointLight position={[0, 1.6, 0]} intensity={6} distance={5} color="#ffb347" />}
        {[0.5, 1.7, 2.9, 4.1, 5.3].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.7, 0.4, Math.sin(a) * 0.7]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#e63b5a" roughness={0.4} />
          </mesh>
        ))}
      </Reactive>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Balloons                                                             */
/* ------------------------------------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0);

export function Balloons({
  position,
  colors = ["#ff6fa5", "#ffd54a", "#7dd3fc", "#b57bee", "#ff9a4d"],
}: {
  position: [number, number, number];
  colors?: string[];
}) {
  const group = useRef<THREE.Group>(null);
  const flying = useRef(false);
  const fly = useRef(0);
  const balloons = useMemo(
    () =>
      colors.map((c, i) => {
        const a = (i / colors.length) * Math.PI * 2;
        const x = Math.cos(a) * 0.38;
        const z = Math.sin(a) * 0.38;
        const y = 2.3 + (i % 2) * 0.4;
        const dir = new THREE.Vector3(x, y - 0.4, z);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
        return { color: c, x, y, z, len, quat, mid: dir.multiplyScalar(0.5) };
      }),
    [colors],
  );
  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    if (flying.current) {
      fly.current += delta;
      g.position.y = fly.current * fly.current * 1.6;
      g.position.x = Math.sin(fly.current * 1.4) * 0.8;
      g.rotation.z = Math.sin(fly.current * 2) * 0.15;
      if (fly.current > 4.2) {
        flying.current = false;
        fly.current = 0;
        g.position.set(0, 0, 0);
      }
    } else {
      g.position.y = Math.sin(t * 1.2 + position[0]) * 0.08;
      g.rotation.z = Math.sin(t * 0.8 + position[2]) * 0.05;
    }
  });
  return (
    <Reactive
      id="balloon"
      kind="none"
      message={["🎈 Up, up and away! Happy Birthday!", "🎈 Balloons for the birthday princess!"]}
      burst="confetti"
      burstCount={26}
      sound="whoosh"
      bubbleHeight={3.2}
      position={position}
      onReact={() => {
        flying.current = true;
        fly.current = 0;
      }}
    >
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#8d6a52" />
      </mesh>
      <group ref={group}>
        {balloons.map((b, i) => (
          <group key={i}>
            <mesh position={[b.x, b.y, b.z]} scale={[1, 1.15, 1]} castShadow>
              <sphereGeometry args={[0.34, 18, 16]} />
              <meshStandardMaterial color={b.color} roughness={0.25} metalness={0.05} />
            </mesh>
            <mesh position={[b.x, b.y - 0.42, b.z]} rotation-x={Math.PI}>
              <coneGeometry args={[0.06, 0.09, 6]} />
              <meshStandardMaterial color={b.color} />
            </mesh>
            <mesh position={b.mid} quaternion={b.quat}>
              <cylinderGeometry args={[0.008, 0.008, b.len, 4]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
    </Reactive>
  );
}

/* ------------------------------------------------------------------ */
/* Mushrooms                                                            */
/* ------------------------------------------------------------------ */

export function MushroomCluster({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const caps = [
    { x: 0, z: 0, s: 1 },
    { x: 0.5, z: 0.18, s: 0.65 },
    { x: -0.4, z: 0.32, s: 0.5 },
  ];
  return (
    <Reactive
      id="mushroom"
      kind="bounce"
      message={["✨ Fairy magic tingles!", "🍄 A fairy lives here… shh!"]}
      burst="sparkles"
      burstColor="#ffd6f2"
      sound="sparkle"
      bubbleHeight={1.4}
      position={position}
      rotation={rotation}
    >
      {caps.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]} scale={c.s}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.17, 0.6, 10]} />
            <meshStandardMaterial color="#f6ead8" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e63b5a" emissive="#e63b5a" emissiveIntensity={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.58, 0]} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.42, 16]} />
            <meshStandardMaterial color="#f6ead8" roughness={0.9} />
          </mesh>
          {[
            [0.16, 0.9, 0.18],
            [-0.22, 0.86, 0.08],
            [0.04, 0.96, -0.24],
            [-0.05, 0.99, 0.03],
          ].map(([sx, sy, sz], j) => (
            <mesh key={j} position={[sx, sy, sz]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#fffaf0" />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[0, 0.9, 0]} intensity={2} distance={3} color="#ff9ccf" />
    </Reactive>
  );
}

/* ------------------------------------------------------------------ */
/* Blossom tree                                                         */
/* ------------------------------------------------------------------ */

export function BlossomTree({
  position,
  scale = 1,
  color = "#ffb7d5",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <Reactive
      id="tree"
      kind="shake"
      message={["🌸 The tree showers you with blossoms!", "🍃 The trees whisper: Happy Birthday, Khushi!"]}
      burst="petals"
      burstColor={color}
      burstCount={30}
      sound="sparkle"
      bubbleHeight={5.4}
      hoverScale={1.03}
      position={position}
      scale={scale}
    >
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.48, 2.8, 8]} />
        <meshStandardMaterial color="#7a5235" roughness={1} />
      </mesh>
      {[
        [0, 3.7, 0, 1.75],
        [1.2, 3.1, 0.4, 1.25],
        [-1.15, 3.2, -0.3, 1.2],
        [0.3, 3.1, -1.15, 1.1],
        [-0.2, 3.0, 1.05, 1.0],
        [0.6, 4.6, 0.2, 1.0],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
      ))}
    </Reactive>
  );
}
