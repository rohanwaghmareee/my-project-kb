"use client";

import { Html, Sparkles, useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TULIP_COLORS, type WishDTO } from "@/lib/constants";
import { playSound } from "@/lib/sound";
import { useFairy } from "@/lib/store";
import { makeRng, tmpColor, tmpObj } from "@/lib/three-utils";
import { Bob, Sign } from "./Reactive";

export type TulipSpot = {
  x: number;
  z: number;
  y?: number;
  color: string;
  scale: number;
  rot: number;
  lean?: number;
};

const TULIP_MESSAGES = [
  "🌷 Every tulip here blooms for you, Khushi",
  "🌷 A tulip a day keeps the sadness away",
  "🌷 Psst… this one is your favourite colour",
  "🌷 Tulips mean perfect love. Fitting, isn't it?",
  "🌷 Happy Birthday from the whole garden!",
];

let geometries: {
  head: THREE.BufferGeometry;
  stem: THREE.BufferGeometry;
  leaf: THREE.BufferGeometry;
} | null = null;

export function getTulipGeometry() {
  if (geometries) return geometries;
  const profile = [
    [0, 0],
    [0.08, 0.01],
    [0.17, 0.08],
    [0.235, 0.2],
    [0.25, 0.34],
    [0.235, 0.46],
    [0.2, 0.54],
    [0.17, 0.58],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const cup = new THREE.LatheGeometry(profile, 14);
  const petals: THREE.BufferGeometry[] = [cup];
  for (let i = 0; i < 3; i++) {
    const petal = new THREE.ConeGeometry(0.11, 0.26, 6);
    petal.scale(1, 1, 0.45);
    petal.translate(0, 0.62, 0);
    petal.rotateZ(0.28);
    petal.translate(0.15, 0, 0);
    petal.rotateY((i / 3) * Math.PI * 2);
    petals.push(petal);
  }
  const head = mergeGeometries(petals, false) ?? cup;
  head.computeVertexNormals();

  const stem = new THREE.CylinderGeometry(0.025, 0.04, 1, 6);
  stem.translate(0, 0.5, 0);

  const leafA = new THREE.ConeGeometry(0.09, 0.72, 4);
  leafA.scale(1, 1, 0.35);
  leafA.translate(0, 0.36, 0);
  leafA.rotateZ(-0.42);
  leafA.translate(0.08, 0, 0);
  const leafB = new THREE.ConeGeometry(0.08, 0.55, 4);
  leafB.scale(1, 1, 0.35);
  leafB.translate(0, 0.28, 0);
  leafB.rotateZ(0.5);
  leafB.translate(-0.07, 0, 0);
  leafB.rotateY(1.3);
  const leaf = mergeGeometries([leafA, leafB], false) ?? leafA;

  geometries = { head, stem, leaf };
  return geometries;
}

export function pickTulipColor(rng: () => number) {
  const r = rng();
  if (r < 0.36) return TULIP_COLORS.pink;
  if (r < 0.56) return TULIP_COLORS.red;
  if (r < 0.72) return TULIP_COLORS.yellow;
  if (r < 0.86) return TULIP_COLORS.purple;
  if (r < 0.94) return TULIP_COLORS.white;
  return TULIP_COLORS.orange;
}

export function scatterInRect(
  count: number,
  seed: number,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  y = 0,
): TulipSpot[] {
  const rng = makeRng(seed);
  return Array.from({ length: count }, () => ({
    x: x0 + rng() * (x1 - x0),
    z: z0 + rng() * (z1 - z0),
    y,
    color: pickTulipColor(rng),
    scale: 0.8 + rng() * 0.4,
    rot: rng() * Math.PI * 2,
    lean: (rng() - 0.5) * 0.2,
  }));
}

/** A field of instanced tulips. Each tulip sways in the wind and reacts when touched. */
export function TulipField({
  spots,
  reactive = true,
  castShadow = true,
}: {
  spots: TulipSpot[];
  reactive?: boolean;
  castShadow?: boolean;
}) {
  const { head, stem, leaf } = useMemo(getTulipGeometry, []);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const count = spots.length;
  const excite = useMemo(() => new Float32Array(count), [count]);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [bubble, setBubble] = useState<{ pos: [number, number, number]; text: string } | null>(
    null,
  );
  const timeout = useRef<number | null>(null);
  const addBurst = useFairy((s) => s.addBurst);
  const discover = useFairy((s) => s.discover);
  useCursor(hoverId !== null);

  useLayoutEffect(() => {
    const h = headRef.current;
    if (!h) return;
    spots.forEach((s, i) => h.setColorAt(i, tmpColor.set(s.color)));
    if (h.instanceColor) h.instanceColor.needsUpdate = true;
  }, [spots]);

  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    },
    [],
  );

  useFrame(({ clock }, delta) => {
    const h = headRef.current;
    const st = stemRef.current;
    const lf = leafRef.current;
    if (!h || !st || !lf) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const s = spots[i];
      let e = excite[i];
      if (e > 0) {
        e = Math.max(0, e - delta / 1.6);
        excite[i] = e;
      }
      const sway =
        Math.sin(t * 1.6 + s.x * 0.7 + s.z * 0.5) * 0.06 + Math.sin(t * 2.3 + i) * 0.02;
      const wig = Math.sin(t * 26) * 0.35 * e;
      const sc = s.scale * (hoverId === i ? 1.15 : 1);
      tmpObj.position.set(s.x, s.y ?? 0, s.z);
      tmpObj.rotation.set(sway * 0.5 + wig * 0.4, s.rot, (s.lean ?? 0) + sway + wig);
      tmpObj.scale.set(sc, sc, sc);
      tmpObj.updateMatrix();
      st.setMatrixAt(i, tmpObj.matrix);
      lf.setMatrixAt(i, tmpObj.matrix);
      tmpObj.translateY(sc);
      const bloom = 1 + 0.45 * Math.sin(e * Math.PI);
      tmpObj.scale.set(sc * bloom, sc * bloom, sc * bloom);
      tmpObj.updateMatrix();
      h.setMatrixAt(i, tmpObj.matrix);
    }
    h.instanceMatrix.needsUpdate = true;
    st.instanceMatrix.needsUpdate = true;
    lf.instanceMatrix.needsUpdate = true;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const i = e.instanceId;
    if (i === undefined) return;
    excite[i] = 1;
    const s = spots[i];
    const y = s.y ?? 0;
    setBubble({
      pos: [s.x, y + s.scale * 1.6, s.z],
      text: TULIP_MESSAGES[Math.floor(Math.random() * TULIP_MESSAGES.length)],
    });
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setBubble(null), 2600);
    addBurst({ position: [s.x, y + s.scale, s.z], color: s.color, kind: "petals", count: 14 });
    discover("tulip");
    playSound("sparkle");
  };

  return (
    <group>
      <instancedMesh ref={stemRef} args={[stem, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color="#4f9c3f" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[leaf, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color="#5cae4a" roughness={0.8} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={headRef}
        args={[head, undefined, count]}
        frustumCulled={false}
        castShadow={castShadow}
        onClick={reactive ? onClick : undefined}
        onPointerMove={
          reactive
            ? (e) => {
                e.stopPropagation();
                setHoverId(e.instanceId ?? null);
              }
            : undefined
        }
        onPointerOut={reactive ? () => setHoverId(null) : undefined}
      >
        <meshStandardMaterial color="#ffffff" roughness={0.55} />
      </instancedMesh>
      {bubble && (
        <Html
          position={bubble.pos}
          center
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="fairy-bubble">{bubble.text}</div>
        </Html>
      )}
    </group>
  );
}

/** A single tulip (used in vases, balconies and the wish garden). */
export function Tulip({
  color,
  scale = 1,
  glow = false,
  position,
  rotation,
}: {
  color: string;
  scale?: number;
  glow?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { head, stem, leaf } = getTulipGeometry();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={stem}>
        <meshStandardMaterial color="#4f9c3f" roughness={0.8} />
      </mesh>
      <mesh geometry={leaf}>
        <meshStandardMaterial color="#5cae4a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={head} position={[0, 1, 0]} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={glow ? color : "#000000"}
          emissiveIntensity={glow ? 0.35 : 0}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

/** A bunch of tulips in a vase. */
export function TulipVase({
  position,
  count = 5,
  seed = 1,
  vaseColor = "#f3e9f5",
}: {
  position: [number, number, number];
  count?: number;
  seed?: number;
  vaseColor?: string;
}) {
  const tulips = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return {
        color: pickTulipColor(rng),
        position: [Math.cos(a) * 0.09, 0.45, Math.sin(a) * 0.09] as [number, number, number],
        rotation: [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35] as [number, number, number],
        scale: 0.85 + rng() * 0.25,
      };
    });
  }, [count, seed]);
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.6, 16]} />
        <meshStandardMaterial color={vaseColor} roughness={0.3} />
      </mesh>
      {tulips.map((t, i) => (
        <Tulip key={i} {...t} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Wish garden — one glowing tulip per birthday wish in the database   */
/* ------------------------------------------------------------------ */

export const WISH_GARDEN_CENTER: [number, number, number] = [14, 0, 15];

function WishTulip({ wish, position }: { wish: WishDTO; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | null>(null);
  const addBurst = useFairy((s) => s.addBurst);
  const discover = useFairy((s) => s.discover);
  useCursor(hovered);
  const color = TULIP_COLORS[wish.color];

  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    },
    [],
  );

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
        if (timeout.current) window.clearTimeout(timeout.current);
        timeout.current = window.setTimeout(() => setOpen(false), 4500);
        addBurst({
          position: [position[0], position[1] + 1.8, position[2]],
          color,
          kind: "hearts",
          count: 12,
        });
        discover("tulip");
        playSound("chime");
      }}
    >
      <Bob amplitude={0.02} sway={0.05} speed={1.4} offset={wish.id}>
        <Tulip color={color} scale={hovered ? 1.8 : 1.65} glow />
      </Bob>
      {(hovered || open) && (
        <Html
          position={[0, 2.35, 0]}
          center
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          {open ? (
            <div className="fairy-bubble fairy-bubble--wish">
              <strong>{wish.name}</strong>
              <span>{wish.message}</span>
            </div>
          ) : (
            <div className="fairy-tag">🌷 {wish.name}</div>
          )}
        </Html>
      )}
    </group>
  );
}

export function WishGarden() {
  const wishes = useFairy((s) => s.wishes);
  const [cx, , cz] = WISH_GARDEN_CENTER;
  const radius = Math.max(3.2, 1.2 + Math.sqrt(wishes.length) * 0.75);
  const items = useMemo(
    () =>
      wishes.map((w, i) => {
        const a = i * 2.39996 + 0.6;
        const r = i === 0 ? 0 : 0.8 + Math.sqrt(i) * 0.7;
        return { w, position: [cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r] as [number, number, number] };
      }),
    [wishes, cx, cz],
  );
  const posts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return [cx + Math.cos(a) * (radius + 0.4), 0, cz + Math.sin(a) * (radius + 0.4)] as [
          number,
          number,
          number,
        ];
      }),
    [cx, cz, radius],
  );

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.03, cz]} receiveShadow>
        <circleGeometry args={[radius + 0.1, 48]} />
        <meshStandardMaterial color="#6f4b30" roughness={1} />
      </mesh>
      {posts.map((p, i) => (
        <mesh key={i} position={[p[0], 0.35, p[2]]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.7, 6]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.55, cz]}>
        <torusGeometry args={[radius + 0.4, 0.03, 6, 64]} />
        <meshStandardMaterial color="#fff6fb" />
      </mesh>
      <Sign
        text="Wish Garden"
        position={[cx - radius - 1.2, 0, cz + radius * 0.6]}
        rotation={[0, -0.6, 0]}
      />
      {items.map(({ w, position }) => (
        <WishTulip key={w.id} wish={w} position={position} />
      ))}
      <Sparkles
        count={40}
        scale={[radius * 2, 2.5, radius * 2]}
        position={[cx, 1.3, cz]}
        size={3.5}
        speed={0.35}
        color="#fff3fa"
      />
    </group>
  );
}
