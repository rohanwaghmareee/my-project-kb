"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFairy } from "@/lib/store";
import { makeStoneTexture } from "@/lib/three-utils";
import { Reactive, TextPlane, archShape } from "./Reactive";
import { Tulip } from "./Tulips";

const WALL = "#e2cfb2";
const ROOF = "#55688a";
const ROOF_TRIM = "#43526c";
const TRIM = "#b49b7a";
const WINDOW = "#ffd27a";
const BASE_Y = 0.4;

function useWallMaterial() {
  return useMemo(() => {
    const tex = makeStoneTexture();
    return new THREE.MeshStandardMaterial({ map: tex, color: WALL, roughness: 0.95 });
  }, []);
}

function ArchWindow({
  position,
  rotation,
  width = 0.6,
  height = 1.2,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.ShapeGeometry(archShape(width, height));
    g.translate(0, -height / 2, 0);
    return g;
  }, [width, height]);
  const frame = useMemo(() => {
    const g = new THREE.ShapeGeometry(archShape(width + 0.16, height + 0.12));
    g.translate(0, -height / 2 - 0.06, 0);
    return g;
  }, [width, height]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={frame} position-z={-0.005}>
        <meshStandardMaterial color={TRIM} roughness={1} />
      </mesh>
      <mesh geometry={geo}>
        <meshStandardMaterial color={WINDOW} emissive={WINDOW} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Flag({ position, color = "#ff6fa5", size = 1 }: { position: [number, number, number]; color?: string; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 3 + position[0]) * 0.35;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.55 * size, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1 * size, 6]} />
        <meshStandardMaterial color="#5c4a3a" />
      </mesh>
      <group position={[0, 0.85 * size, 0]}>
        <mesh ref={ref} position={[0.42 * size, 0, 0]}>
          <planeGeometry args={[0.84 * size, 0.5 * size]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function Tower({
  position,
  radius,
  height,
  roofHeight,
  windows = [0.3, 0.55, 0.8],
  flagColor,
  balcony = false,
  material,
}: {
  position: [number, number, number];
  radius: number;
  height: number;
  roofHeight: number;
  windows?: number[];
  flagColor?: string;
  balcony?: boolean;
  material: THREE.Material;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[radius, radius * 1.06, height, 20]} />
      </mesh>
      <mesh position={[0, height, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.25, radius * 1.05, 0.5, 20]} />
        <meshStandardMaterial color={TRIM} roughness={1} />
      </mesh>
      <mesh position={[0, height + 0.25 + roofHeight / 2, 0]} castShadow>
        <coneGeometry args={[radius * 1.32, roofHeight, 20]} />
        <meshStandardMaterial color={ROOF} roughness={0.7} />
      </mesh>
      <mesh position={[0, height + 0.25 + roofHeight - 0.05, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffd36b" metalness={0.8} roughness={0.3} />
      </mesh>
      {windows.map((f, i) => (
        <ArchWindow key={i} position={[0, height * f, radius + 0.01]} />
      ))}
      {flagColor && <Flag position={[0, height + 0.25 + roofHeight, 0]} color={flagColor} size={0.9} />}
      {balcony && (
        <group position={[0, height * 0.62, 0]}>
          <mesh position={[0, -0.15, radius * 0.7]} castShadow>
            <boxGeometry args={[radius * 1.6, 0.25, radius * 1.1]} />
            <meshStandardMaterial color={TRIM} roughness={1} />
          </mesh>
          <mesh position={[0, 0.15, radius * 0.7]}>
            <boxGeometry args={[radius * 1.7, 0.35, radius * 1.2]} />
            <meshStandardMaterial color="#6f4b30" roughness={1} />
          </mesh>
          {[-0.5, -0.17, 0.17, 0.5].map((fx, i) => (
            <Tulip
              key={i}
              color={["#ff6fa5", "#ffd54a", "#e63b5a", "#b57bee"][i]}
              scale={0.6}
              position={[fx * radius * 1.3, 0.3, radius * 0.7 + (i % 2 ? 0.15 : -0.15)]}
            />
          ))}
        </group>
      )}
    </group>
  );
}

function HipRoof({
  position,
  width,
  depth,
  height,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
}) {
  return (
    <mesh position={position} rotation-y={Math.PI / 4} scale={[1, 1, depth / width]} castShadow>
      <coneGeometry args={[(width / Math.SQRT2) * 1.08, height, 4]} />
      <meshStandardMaterial color={ROOF} roughness={0.7} />
    </mesh>
  );
}

function Battlements({
  y,
  z,
  from,
  to,
  step = 0.9,
}: {
  y: number;
  z: number;
  from: number;
  to: number;
  step?: number;
}) {
  const items = useMemo(() => {
    const list: number[] = [];
    for (let x = from; x <= to + 0.001; x += step) list.push(x);
    return list;
  }, [from, to, step]);
  return (
    <group>
      {items.map((x, i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.45]} />
          <meshStandardMaterial color={WALL} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Bunting() {
  const flags = useMemo(() => {
    const colors = ["#ff6fa5", "#ffd54a", "#b57bee", "#7dd3fc", "#ff9a4d", "#fff4f7"];
    return Array.from({ length: 15 }, (_, i) => {
      const u = i / 14;
      const x = -5.2 + u * 10.4;
      const y = 12.6 - Math.sin(u * Math.PI) * 1.4;
      return { x, y, color: colors[i % colors.length] };
    });
  }, []);
  return (
    <group position={[0, 0, 5.4]}>
      {flags.map((f, i) => (
        <mesh key={i} position={[f.x, f.y - 0.3, 0]} rotation-x={Math.PI}>
          <coneGeometry args={[0.28, 0.6, 3]} />
          <meshStandardMaterial color={f.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function Castle() {
  const wall = useWallMaterial();
  const enterCastle = useFairy((s) => s.enterCastle);
  const setHint = useFairy((s) => s.setHint);
  const doorGeo = useMemo(
    () => new THREE.ExtrudeGeometry(archShape(2.2, 3.4), { depth: 0.25, bevelEnabled: false }),
    [],
  );
  const doorFrameGeo = useMemo(
    () => new THREE.ExtrudeGeometry(archShape(2.8, 3.75), { depth: 0.18, bevelEnabled: false }),
    [],
  );

  return (
    <group>
      {/* plinth and steps */}
      <mesh position={[0, 0.2, -1]} receiveShadow castShadow>
        <boxGeometry args={[23, 0.4, 16.5]} />
        <meshStandardMaterial color="#b9ad9b" roughness={1} />
      </mesh>
      <mesh position={[0, 0.1, 7.9]} receiveShadow>
        <boxGeometry args={[6.4, 0.2, 1.1]} />
        <meshStandardMaterial color="#c4b8a6" roughness={1} />
      </mesh>
      <mesh position={[0, 0.3, 7.2]} receiveShadow>
        <boxGeometry args={[6.4, 0.2, 1]} />
        <meshStandardMaterial color="#c4b8a6" roughness={1} />
      </mesh>

      <group position={[0, BASE_Y, 0]}>
        {/* main keep */}
        <mesh position={[0, 6, 0]} castShadow receiveShadow material={wall}>
          <boxGeometry args={[9, 12, 7]} />
        </mesh>
        <mesh position={[0, 12.1, 0]} castShadow>
          <boxGeometry args={[9.6, 0.35, 7.6]} />
          <meshStandardMaterial color={TRIM} roughness={1} />
        </mesh>
        <HipRoof position={[0, 12.25 + 2.6, 0]} width={9.8} depth={7.8} height={5.2} />
        <Flag position={[0, 12.25 + 5.2, 0]} color="#ffd54a" size={1.1} />
        {[-2.6, 0, 2.6].map((x) =>
          [8.7, 10.8].map((y) => <ArchWindow key={`${x}-${y}`} position={[x, y, 3.52]} />),
        )}
        {[-3, 3].map((x) => (
          <ArchWindow key={x} position={[x, 5.2, 3.52]} width={0.8} height={1.6} />
        ))}

        {/* balcony on the keep */}
        <group position={[0, 7.1, 3.9]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[6, 0.3, 1.1]} />
            <meshStandardMaterial color={TRIM} roughness={1} />
          </mesh>
          <mesh position={[0, 0.35, 0.1]}>
            <boxGeometry args={[6.1, 0.4, 0.9]} />
            <meshStandardMaterial color="#6f4b30" roughness={1} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <Tulip
              key={i}
              color={["#ff6fa5", "#ffd54a", "#e63b5a", "#b57bee", "#fff4f7"][i % 5]}
              scale={0.65}
              position={[-2.6 + i * 0.65, 0.5, i % 2 ? 0.25 : -0.05]}
            />
          ))}
        </group>

        {/* gatehouse */}
        <mesh position={[0, 3.5, 5]} castShadow receiveShadow material={wall}>
          <boxGeometry args={[6.2, 7, 3.2]} />
        </mesh>
        <mesh position={[0, 7.05, 5]} castShadow>
          <boxGeometry args={[6.6, 0.3, 3.6]} />
          <meshStandardMaterial color={TRIM} roughness={1} />
        </mesh>
        <Battlements y={7.45} z={6.4} from={-2.7} to={2.7} />
        <Battlements y={7.45} z={3.7} from={-2.7} to={2.7} />
        <ArchWindow position={[0, 5.4, 6.62]} width={0.9} height={1.7} />

        {/* the magical door */}
        <Reactive
          id="castle"
          kind="pulse"
          message={[
            "🏰 The castle door swings open for Princess Khushi… come in!",
            "🏰 Something precious waits in the deepest room… follow me!",
          ]}
          burst="sparkles"
          burstColor="#ffe9a8"
          burstCount={34}
          sound="magic"
          bubbleHeight={4.6}
          hoverScale={1.03}
          position={[0, 0, 6.6]}
          onReact={() => {
            setHint("Entering the castle…");
            window.setTimeout(enterCastle, 1000);
          }}
        >
          <mesh geometry={doorFrameGeo} position={[0, 0, -0.05]} castShadow>
            <meshStandardMaterial color={TRIM} roughness={1} />
          </mesh>
          <mesh geometry={doorGeo} position={[0, 0, 0.05]} castShadow>
            <meshStandardMaterial color="#5a3a22" roughness={0.9} />
          </mesh>
          {[-0.55, 0.55].map((x) =>
            [0.9, 1.9, 2.7].map((y) => (
              <mesh key={`${x}-${y}`} position={[x, y, 0.32]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#d9b25a" metalness={0.8} roughness={0.3} />
              </mesh>
            ))
          )}
          <mesh position={[0, 1.6, 0.36]}>
            <torusGeometry args={[0.18, 0.035, 8, 20]} />
            <meshStandardMaterial color="#ffd36b" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.7, 0.31]}>
            <planeGeometry args={[2.1, 3.3]} />
            <meshBasicMaterial color="#ffd6ea" transparent opacity={0.16} toneMapped={false} depthWrite={false} />
          </mesh>
          <Sparkles count={26} scale={[2.4, 3.6, 0.6]} position={[0, 1.8, 0.5]} size={4} speed={0.5} color="#fff2c4" />
        </Reactive>

        {/* front towers */}
        <Tower position={[-5.4, 0, 4]} radius={1.8} height={14} roofHeight={5.2} flagColor="#ff6fa5" balcony material={wall} />
        <Tower position={[5.4, 0, 4]} radius={1.8} height={14} roofHeight={5.2} flagColor="#b57bee" balcony material={wall} />

        {/* wings */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 8.2, 4, -1]} castShadow receiveShadow material={wall}>
              <boxGeometry args={[4.6, 8, 6.4]} />
            </mesh>
            <mesh position={[side * 8.2, 8.1, -1]} castShadow>
              <boxGeometry args={[5, 0.3, 6.8]} />
              <meshStandardMaterial color={TRIM} roughness={1} />
            </mesh>
            <HipRoof position={[side * 8.2, 8.25 + 1.6, -1]} width={5.2} depth={7} height={3.2} />
            <ArchWindow position={[side * 7.4, 3.2, 2.22]} />
            <ArchWindow position={[side * 9, 3.2, 2.22]} />
            <ArchWindow position={[side * 8.2, 6, 2.22]} width={0.8} height={1.4} />
            <Tower position={[side * 10.9, 0, 2.2]} radius={0.95} height={10} roofHeight={3.6} windows={[0.4, 0.7]} material={wall} />
          </group>
        ))}

        {/* rear towers & spire */}
        <Tower position={[-3.6, 0, -4.6]} radius={1.4} height={18} roofHeight={6} windows={[0.35, 0.6, 0.85]} material={wall} />
        <Tower position={[3.6, 0, -4.6]} radius={1.4} height={18} roofHeight={6} windows={[0.35, 0.6, 0.85]} material={wall} />
        <Tower position={[0, 0, -1.5]} radius={1.15} height={21} roofHeight={7} windows={[0.7, 0.85]} flagColor="#e63b5a" material={wall} />

        {/* ivy */}
        {[
          [-4.4, 1, 3.7, 1.1],
          [4.5, 0.8, 3.6, 0.9],
          [-9.5, 1.2, 2.2, 1.2],
          [9.8, 0.9, 2.1, 1.0],
          [-11, 3.4, 1.8, 0.7],
          [6.9, 2.2, -1.9, 0.8],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 1.4, 0.5]}>
            <sphereGeometry args={[r, 10, 8]} />
            <meshStandardMaterial color="#3f8a3c" roughness={1} />
          </mesh>
        ))}

        {/* birthday banner */}
        <group position={[0, 10.1, 5.3]}>
          <mesh>
            <planeGeometry args={[9.6, 1.9]} />
            <meshStandardMaterial color="#ff8fb6" side={THREE.DoubleSide} />
          </mesh>
          <TextPlane
            text="Happy Birthday Khushi!"
            width={9.2}
            height={1.7}
            position={[0, 0, 0.02]}
            color="#fff9fc"
            font='400 200px "Great Vibes", cursive'
            shadow="rgba(120,20,70,0.6)"
          />
        </group>
        <Bunting />
      </group>

      {/* a warm glow around the entrance */}
      <pointLight position={[0, 3, 9]} intensity={18} distance={14} color="#ffd6a3" />
    </group>
  );
}
