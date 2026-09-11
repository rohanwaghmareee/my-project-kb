"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeRng } from "@/lib/three-utils";
import { Bob, Reactive } from "./Reactive";

const EYE = "#1d1a1f";

function Eyes({ y, z, spread, r = 0.035 }: { y: number; z: number; spread: number; r?: number }) {
  return (
    <>
      {[-spread, spread].map((x) => (
        <mesh key={x} position={[x, y, z]}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshStandardMaterial color={EYE} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function Leg({
  position,
  radius = 0.07,
  height = 0.9,
  color,
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[radius, radius * 0.9, height, 8]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

export function Bunny({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const fur = "#fbf7f5";
  return (
    <Reactive
      id="bunny"
      kind="hop"
      message={["🐰 Hoppy Birthday, Khushi!", "🐰 Carrots are great, but you're sweeter!"]}
      burst="hearts"
      burstColor="#ff8fb3"
      sound="pop"
      bubbleHeight={1.5}
      position={position}
      rotation={rotation}
    >
      <Bob amplitude={0.015} speed={3}>
        <mesh position={[0, 0.32, 0]} scale={[1, 0.85, 1.15]} castShadow>
          <sphereGeometry args={[0.32, 16, 14]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0.22]} castShadow>
          <sphereGeometry args={[0.24, 16, 14]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 1.02, 0.16]} rotation={[-0.15, 0, x * 1.8]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.06, 0.34, 4, 8]} />
              <meshStandardMaterial color={fur} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.045]} scale={[0.6, 0.8, 0.3]}>
              <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
              <meshStandardMaterial color="#ffb3c7" roughness={0.9} />
            </mesh>
          </group>
        ))}
        <Eyes y={0.75} z={0.43} spread={0.09} />
        <mesh position={[0, 0.66, 0.46]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ff8fa8" />
        </mesh>
        <mesh position={[0, 0.34, -0.36]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.07, 0.2]} scale={[1, 0.5, 1.6]}>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>
        ))}
      </Bob>
    </Reactive>
  );
}

export function Deer({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const coat = "#b07a52";
  const spots = useMemo(() => {
    const rng = makeRng(8);
    return Array.from({ length: 8 }, () => [
      (rng() - 0.5) * 0.6,
      1.35 + rng() * 0.2,
      (rng() - 0.5) * 1.1,
    ]);
  }, []);
  return (
    <Reactive
      id="deer"
      kind="bow"
      message={["🦌 Even the forest bows to you today, Khushi", "🦌 A gentle nod for the birthday queen"]}
      burst="sparkles"
      burstColor="#ffe08a"
      sound="chime"
      bubbleHeight={3}
      position={position}
      rotation={rotation}
    >
      <mesh position={[0, 1.1, 0]} scale={[0.8, 0.75, 1.45]} castShadow>
        <sphereGeometry args={[0.5, 16, 14]} />
        <meshStandardMaterial color={coat} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.95, 0.2]} scale={[0.6, 0.55, 1.1]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#e9d5bf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0.6]} rotation={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.8, 10]} />
        <meshStandardMaterial color={coat} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, 0.85]} scale={[0.8, 0.8, 1.15]} castShadow>
        <sphereGeometry args={[0.23, 14, 12]} />
        <meshStandardMaterial color={coat} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.93, 1.1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#c99a72" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.95, 1.21]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={EYE} />
      </mesh>
      <Eyes y={2.08} z={1.02} spread={0.12} />
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 2.2, 0.75]} rotation={[0, 0, x * 3]}>
          <coneGeometry args={[0.07, 0.22, 6]} />
          <meshStandardMaterial color={coat} roughness={0.9} />
        </mesh>
      ))}
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 2.35, 0.7]} rotation={[0, 0, x * 3.5]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.035, 0.55, 6]} />
            <meshStandardMaterial color="#6b4b32" roughness={1} />
          </mesh>
          <mesh position={[x * 0.9, 0.12, 0]} rotation={[0, 0, x * 6]}>
            <cylinderGeometry args={[0.02, 0.03, 0.3, 6]} />
            <meshStandardMaterial color="#6b4b32" roughness={1} />
          </mesh>
        </group>
      ))}
      {spots.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#f5ead9" />
        </mesh>
      ))}
      <mesh position={[0, 1.25, -0.72]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f5ead9" />
      </mesh>
      {[-0.25, 0.25].map((x) =>
        [-0.45, 0.45].map((z) => <Leg key={`${x}${z}`} position={[x, 0.45, z]} color={coat} />),
      )}
    </Reactive>
  );
}

export function Fox({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const coat = "#ec7a2d";
  return (
    <Reactive
      id="fox"
      kind="spin"
      message={["🦊 Clever & cute — just like Khushi!", "🦊 Foxy wishes for a fantastic year!"]}
      burst="sparkles"
      burstColor="#ffb36b"
      sound="pop"
      bubbleHeight={1.5}
      position={position}
      rotation={rotation}
    >
      <Bob amplitude={0.01} speed={4}>
        <mesh position={[0, 0.46, 0]} scale={[0.9, 0.8, 1.4]} castShadow>
          <sphereGeometry args={[0.3, 16, 14]} />
          <meshStandardMaterial color={coat} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0.28]} scale={[0.7, 0.7, 0.8]}>
          <sphereGeometry args={[0.25, 12, 10]} />
          <meshStandardMaterial color="#fff5ea" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.76, 0.36]} castShadow>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshStandardMaterial color={coat} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.26, 8]} />
          <meshStandardMaterial color="#fff5ea" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0.73]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={EYE} />
        </mesh>
        <Eyes y={0.82} z={0.54} spread={0.09} r={0.03} />
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.98, 0.3]} rotation={[0, 0, x * 1.5]}>
            <coneGeometry args={[0.08, 0.22, 6]} />
            <meshStandardMaterial color={x < 0 ? "#3a2a24" : "#3a2a24"} roughness={0.9} />
          </mesh>
        ))}
        <group position={[0, 0.5, -0.5]} rotation={[0.9, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.12, 0.45, 4, 10]} />
            <meshStandardMaterial color={coat} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#fff5ea" roughness={0.9} />
          </mesh>
        </group>
        {[-0.14, 0.14].map((x) =>
          [-0.22, 0.22].map((z) => (
            <Leg key={`${x}${z}`} position={[x, 0.17, z]} radius={0.05} height={0.34} color="#3a2a24" />
          )),
        )}
      </Bob>
    </Reactive>
  );
}

export function Unicorn({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const coat = "#fdfbff";
  const mane = ["#ff8fb6", "#c9a3ff", "#9be7ff", "#ffe08a", "#ff8fb6", "#c9a3ff"];
  return (
    <Reactive
      id="unicorn"
      kind="rear"
      message={["🦄 A unicorn's blessing: may your year sparkle, Khushi!", "🦄 Magic recognises magic. Happy Birthday!"]}
      burst="confetti"
      burstCount={36}
      sound="magic"
      bubbleHeight={3.4}
      position={position}
      rotation={rotation}
    >
      <mesh position={[0, 1.25, 0]} scale={[0.8, 0.8, 1.5]} castShadow>
        <sphereGeometry args={[0.55, 16, 14]} />
        <meshStandardMaterial color={coat} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, 0.62]} rotation={[-0.6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.95, 10]} />
        <meshStandardMaterial color={coat} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.27, 0.95]} scale={[0.8, 0.9, 1.25]} castShadow>
        <sphereGeometry args={[0.26, 14, 12]} />
        <meshStandardMaterial color={coat} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.15, 1.25]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#f6dce8" roughness={0.7} />
      </mesh>
      <Eyes y={2.35} z={1.14} spread={0.13} r={0.04} />
      <mesh position={[0, 2.65, 0.98]} rotation={[-0.35, 0, 0]}>
        <coneGeometry args={[0.06, 0.55, 8]} />
        <meshStandardMaterial color="#ffd36b" emissive="#ffb84a" emissiveIntensity={0.6} metalness={0.7} roughness={0.25} />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 2.55, 0.8]} rotation={[0, 0, x * 2]}>
          <coneGeometry args={[0.06, 0.2, 6]} />
          <meshStandardMaterial color={coat} roughness={0.7} />
        </mesh>
      ))}
      {mane.map((c, i) => {
        const t = i / (mane.length - 1);
        return (
          <mesh key={i} position={[0, 2.5 - t * 0.85, 0.8 - t * 0.75]}>
            <sphereGeometry args={[0.15, 10, 8]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        );
      })}
      {mane.slice(0, 4).map((c, i) => (
        <mesh key={i} position={[0, 1.35 - i * 0.2, -0.85 - i * 0.08]}>
          <sphereGeometry args={[0.14, 10, 8]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x) =>
        [-0.5, 0.5].map((z) => (
          <group key={`${x}${z}`}>
            <Leg position={[x, 0.55, z]} radius={0.09} height={1.1} color={coat} />
            <mesh position={[x, 0.05, z]}>
              <cylinderGeometry args={[0.1, 0.1, 0.1, 8]} />
              <meshStandardMaterial color="#ffd36b" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )),
      )}
      <Sparkles count={20} scale={[1.6, 2.6, 2.2]} position={[0, 1.6, 0]} size={3} speed={0.5} color="#fff6fb" />
    </Reactive>
  );
}

export function Duck({ position, rotation, offset = 0 }: { position: [number, number, number]; rotation?: [number, number, number]; offset?: number }) {
  return (
    <Reactive
      id="duck"
      kind="bounce"
      message={["🦆 Quack quack! Happy Birthday!", "🦆 Rubber ducks wish they were this lucky!"]}
      burst="sparkles"
      burstColor="#a8dcff"
      sound="quack"
      bubbleHeight={1}
      position={position}
      rotation={rotation}
    >
      <Bob amplitude={0.04} speed={1.6} sway={0.06} offset={offset}>
        <mesh position={[0, 0.12, 0]} scale={[1, 0.8, 1.3]} castShadow>
          <sphereGeometry args={[0.24, 14, 12]} />
          <meshStandardMaterial color="#ffd93b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.42, 0.2]} castShadow>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color="#ffd93b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.39, 0.37]}>
          <boxGeometry args={[0.13, 0.05, 0.16]} />
          <meshStandardMaterial color="#ff8c42" roughness={0.6} />
        </mesh>
        <Eyes y={0.46} z={0.31} spread={0.08} r={0.025} />
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.16, -0.02]} scale={[0.5, 0.6, 1]}>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#f7c928" roughness={0.8} />
          </mesh>
        ))}
      </Bob>
    </Reactive>
  );
}

export function Swan({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const white = "#fffdfa";
  return (
    <Reactive
      id="swan"
      kind="bow"
      message={["🦢 Grace like yours deserves a castle, Khushi", "🦢 The lake shimmers brighter on your birthday"]}
      burst="sparkles"
      burstColor="#ffffff"
      sound="chime"
      bubbleHeight={1.7}
      position={position}
      rotation={rotation}
    >
      <Bob amplitude={0.03} speed={1.3} sway={0.04} offset={2}>
        <mesh position={[0, 0.18, 0]} scale={[1, 0.7, 1.5]} castShadow>
          <sphereGeometry args={[0.36, 16, 14]} />
          <meshStandardMaterial color={white} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0.45]} rotation={[-0.35, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.1, 0.55, 10]} />
          <meshStandardMaterial color={white} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.92, 0.6]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.5, 10]} />
          <meshStandardMaterial color={white} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.15, 0.58]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color={white} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.12, 0.74]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.04, 0.18, 8]} />
          <meshStandardMaterial color="#ff9a4d" roughness={0.6} />
        </mesh>
        <Eyes y={1.17} z={0.66} spread={0.06} r={0.022} />
        {[-0.26, 0.26].map((x) => (
          <mesh key={x} position={[x, 0.36, -0.08]} rotation={[0.3, 0, x * 1.2]} scale={[0.45, 0.6, 1]}>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshStandardMaterial color={white} roughness={0.8} />
          </mesh>
        ))}
      </Bob>
    </Reactive>
  );
}

export function Frog({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const green = "#5cc45f";
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.12, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshStandardMaterial color="#3f9a4a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0.55, 0.12, -0.35]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.1, 0.1, Math.sin((i / 5) * Math.PI * 2) * 0.1]} rotation={[0.5 * Math.cos((i / 5) * Math.PI * 2), 0, -0.5 * Math.sin((i / 5) * Math.PI * 2)]}>
            <coneGeometry args={[0.08, 0.25, 6]} />
            <meshStandardMaterial color="#ffb7d5" roughness={0.8} />
          </mesh>
        ))}
      </group>
      <Reactive
        id="frog"
        kind="hop"
        message={["🐸 Ribbit! Kiss me? …Happy Birthday, Khushi!", "🐸 Every prince started as a frog, you know"]}
        burst="sparkles"
        burstColor="#b6f2a8"
        sound="pop"
        bubbleHeight={0.9}
        position={[0, 0.13, 0]}
      >
        <mesh position={[0, 0.12, 0]} scale={[1.2, 0.8, 1.2]} castShadow>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color={green} roughness={0.7} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <group key={x} position={[x, 0.27, 0.06]}>
            <mesh>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color={EYE} />
            </mesh>
          </group>
        ))}
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.07, -0.04]} scale={[1, 0.7, 1.6]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color={green} roughness={0.7} />
          </mesh>
        ))}
      </Reactive>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Flying creatures                                                     */
/* ------------------------------------------------------------------ */

const BUTTERFLY_COLORS = ["#ff8fb6", "#b57bee", "#7dd3fc", "#ffd54a", "#ff9a4d", "#a7f3d0"];

export function Butterfly({
  seed,
  anchors,
  height = 1.2,
  range = 2.2,
}: {
  seed: number;
  anchors: [number, number][];
  height?: number;
  range?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const anchor = useRef(anchors[seed % anchors.length]);
  const phase = seed * 1.71;
  const color = BUTTERFLY_COLORS[seed % BUTTERFLY_COLORS.length];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const [ax, az] = anchor.current;
    const x = ax + Math.sin(t * 0.6 + phase) * range + Math.sin(t * 1.7 + phase) * 0.4;
    const z = az + Math.cos(t * 0.45 + phase) * range;
    const y = height + Math.sin(t * 1.3 + phase) * 0.5 + Math.sin(t * 3.1 + phase) * 0.1;
    const g = ref.current;
    if (g) {
      const dx = x - g.position.x;
      const dz = z - g.position.z;
      g.position.set(x, y, z);
      if (Math.hypot(dx, dz) > 1e-4) g.rotation.y = Math.atan2(dx, dz);
    }
    const flap = Math.sin(t * 18 + phase) * 0.95;
    if (left.current) left.current.rotation.z = flap;
    if (right.current) right.current.rotation.z = -flap;
  });

  return (
    <Reactive
      ref={ref}
      id="butterfly"
      kind="spin"
      message={["🦋 Flutter, flutter — a wish takes flight!", "🦋 Catch me and I'll grant a birthday wish!"]}
      burst="sparkles"
      burstColor={color}
      burstCount={16}
      sound="sparkle"
      bubbleHeight={0.6}
      bubbleScale={0.8}
      hoverScale={1.3}
      onReact={() => {
        anchor.current = anchors[Math.floor(Math.random() * anchors.length)];
      }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.03, 0.22, 4, 6]} />
        <meshStandardMaterial color="#3b2a3a" />
      </mesh>
      <group ref={left}>
        <mesh position={[-0.17, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.32, 0.28]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      </group>
      <group ref={right}>
        <mesh position={[0.17, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.32, 0.28]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      </group>
    </Reactive>
  );
}

export function Fairy({ seed, radius = 10, height = 10 }: { seed: number; radius?: number; height?: number }) {
  const ref = useRef<THREE.Group>(null);
  const boost = useRef(0);
  const phase = seed * 2.1;
  const color = ["#ffd6ea", "#e0d4ff", "#fff2c4"][seed % 3];
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    boost.current = Math.max(0, boost.current - delta);
    const speed = 0.35 + boost.current * 0.6;
    const a = t * speed + phase;
    const g = ref.current;
    if (!g) return;
    g.position.set(
      Math.cos(a) * radius,
      height + Math.sin(t * 1.1 + phase) * 1.6,
      Math.sin(a) * radius,
    );
    g.rotation.y = -a + Math.PI / 2;
  });
  return (
    <Reactive
      ref={ref}
      id="fairy"
      kind="spin"
      message={["🧚 Hehe! Catch me if you can!", "🧚 I sprinkled extra magic on your birthday, Khushi!"]}
      burst="sparkles"
      burstColor={color}
      burstCount={24}
      sound="sparkle"
      bubbleHeight={0.8}
      hoverScale={1.3}
      onReact={() => {
        boost.current = 4;
      }}
    >
      <mesh>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 0.05, -0.05]} rotation={[0, 0, s * 0.5]}>
          <planeGeometry args={[0.3, 0.45]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Sparkles count={14} scale={[0.9, 0.9, 0.9]} size={5} speed={1.4} color={color} />
    </Reactive>
  );
}

/* ------------------------------------------------------------------ */

export const GARDEN_ANCHORS: [number, number][] = [
  [-6, 16],
  [5, 18],
  [-5, 10],
  [6, 11],
  [-9, 5],
  [9, 4],
  [13, 15],
  [-12, 9],
  [3, 25],
  [-4, 23],
];

export function Animals() {
  return (
    <group>
      <Bunny position={[-4.6, 0, 19]} rotation={[0, 0.6, 0]} />
      <Deer position={[15, 0, 3]} rotation={[0, -0.9, 0]} />
      <Fox position={[-9.5, 0, 12]} rotation={[0, 1.1, 0]} />
      <Unicorn position={[-11, 0, 1]} rotation={[0, 0.9, 0]} />
      <Duck position={[-8, 0.1, -13]} rotation={[0, 2.4, 0]} />
      <Duck position={[-6.6, 0.1, -14.2]} rotation={[0, 2.1, 0]} offset={1.5} />
      <Duck position={[11, 0.1, -13.2]} rotation={[0, -2.2, 0]} offset={3} />
      <Swan position={[6, 0.1, -13.5]} rotation={[0, -2.6, 0]} />
      <Frog position={[-15.8, 0, -1.6]} rotation={[0, 1.2, 0]} />
      {Array.from({ length: 9 }, (_, i) => (
        <Butterfly key={i} seed={i} anchors={GARDEN_ANCHORS} />
      ))}
      <Fairy seed={0} radius={9} height={11} />
      <Fairy seed={1} radius={12} height={8.5} />
      <Fairy seed={2} radius={7} height={16} />
    </group>
  );
}
