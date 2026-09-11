"use client";

import { Environment, Lightformer, Sparkles, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { TULIP_COLORS, type WishDTO } from "@/lib/constants";
import { playSound } from "@/lib/sound";
import { useFairy } from "@/lib/store";
import { makeRng, makeTulipPaintingTexture, tmpVec } from "@/lib/three-utils";
import { Html } from "@react-three/drei";
import { Butterfly } from "./Animals";
import { Balloons, Gift } from "./Props";
import { Bursts, TextPlane, archFrameShape, archShape } from "./Reactive";
import { RingRoom } from "./RingRoom";
import { Tulip, TulipField, TulipVase, scatterInRect } from "./Tulips";

export const ROOM = { w: 16, d: 24, h: 9 };

export const ROOM_NAMES = ["Grand Hall", "Tulip Gallery", "Hall of Wishes", "Heart Chamber"];

/* ------------------------------------------------------------------ */
/* Camera                                                               */
/* ------------------------------------------------------------------ */

export function RoomCamera({
  position,
  look,
  parallax = 1,
}: {
  position: [number, number, number];
  look: [number, number, number];
  parallax?: number;
}) {
  const { camera } = useThree();
  const first = useRef(true);
  const lookRef = useRef(new THREE.Vector3(...look));
  useEffect(() => {
    if (first.current) {
      camera.position.set(...position);
      camera.lookAt(...look);
      lookRef.current.set(...look);
      first.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);
  useFrame((state, delta) => {
    const k = 1 - Math.exp(-delta * 3);
    tmpVec.set(
      position[0] + state.pointer.x * 1.1 * parallax,
      position[1] + state.pointer.y * 0.45 * parallax,
      position[2],
    );
    camera.position.lerp(tmpVec, k);
    tmpVec.set(
      look[0] + state.pointer.x * 0.9 * parallax,
      look[1] + state.pointer.y * 0.6 * parallax,
      look[2],
    );
    lookRef.current.lerp(tmpVec, k);
    camera.lookAt(lookRef.current);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Door                                                                 */
/* ------------------------------------------------------------------ */

export function Door({
  position,
  label,
  onEnter,
  glow = "#ffd0e6",
}: {
  position: [number, number, number];
  label: string;
  onEnter: () => void;
  glow?: string;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const glowRef = useRef<THREE.Mesh>(null);
  const panelGeo = useMemo(
    () => new THREE.ExtrudeGeometry(archShape(3, 5), { depth: 0.3, bevelEnabled: false }),
    [],
  );
  const frameGeo = useMemo(
    () => new THREE.ExtrudeGeometry(archFrameShape(3, 5, 0.4), { depth: 0.5, bevelEnabled: false }),
    [],
  );
  useFrame(({ clock }) => {
    const m = glowRef.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m) m.opacity = 0.35 + Math.sin(clock.getElapsedTime() * 2.5) * 0.12 + (hovered ? 0.3 : 0);
  });
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        playSound("whoosh");
        onEnter();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={frameGeo} castShadow>
        <meshStandardMaterial color="#8a6a45" roughness={0.8} />
      </mesh>
      <mesh geometry={panelGeo} position-z={-0.05}>
        <meshStandardMaterial color="#3b2416" roughness={0.9} />
      </mesh>
      <mesh ref={glowRef} geometry={panelGeo} position={[0, 0.1, 0.32]} scale={[0.92, 0.95, 0.05]}>
        <meshBasicMaterial color={glow} transparent opacity={0.4} toneMapped={false} depthWrite={false} />
      </mesh>
      <Sparkles count={36} scale={[3, 5, 1]} position={[0, 2.5, 0.7]} size={4} speed={0.6} color={glow} />
      <TextPlane
        text={label}
        width={5.6}
        height={1.1}
        position={[0, 6.3, 0.4]}
        color="#fff8fb"
        font='600 90px "Quicksand", sans-serif'
        background="rgba(110,40,90,0.7)"
      />
      <pointLight position={[0, 3, 1.6]} intensity={hovered ? 40 : 22} distance={12} color={glow} />
      {hovered && (
        <Html position={[0, 1.6, 0.8]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="fairy-tag">Step through ✨</div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Room shell                                                           */
/* ------------------------------------------------------------------ */

function Painting({
  position,
  rotation,
  seed,
  bg,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  seed: number;
  bg: string;
}) {
  const tex = useMemo(() => makeTulipPaintingTexture(seed, bg), [seed, bg]);
  return (
    <group position={position} rotation={rotation}>
      <mesh position-z={-0.06}>
        <boxGeometry args={[2.3, 2.9, 0.12]} />
        <meshStandardMaterial color="#c9a45a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={[2, 2.6]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Chandelier({ position, color = "#ffd9a8" }: { position: [number, number, number]; color?: string }) {
  const flames = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = flames.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((f, i) => f.scale.setScalar(1 + Math.sin(t * 12 + i) * 0.15));
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.8, 6]} />
        <meshStandardMaterial color="#c9a45a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.4, 0.07, 10, 40]} />
        <meshStandardMaterial color="#c9a45a" metalness={0.8} roughness={0.3} />
      </mesh>
      <group ref={flames}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.4, 0.42, Math.sin(a) * 1.4]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color="#ffc46b" toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.4, 0.18, Math.sin(a) * 1.4]}>
            <cylinderGeometry args={[0.035, 0.035, 0.35, 6]} />
            <meshStandardMaterial color="#fff5e0" />
          </mesh>
        );
      })}
      <pointLight position={[0, 0.3, 0]} intensity={70} distance={40} color={color} decay={2} />
    </group>
  );
}

export function RoomShell({
  floor = "#f1e2e8",
  wall = "#f7e6ec",
  trim = "#d9b5c4",
  ceiling = "#fbf3f6",
  glassRoof = false,
  windows = true,
  windowGlow = "#fff1d6",
  children,
}: {
  floor?: string;
  wall?: string;
  trim?: string;
  ceiling?: string;
  glassRoof?: boolean;
  windows?: boolean;
  windowGlow?: string;
  children?: ReactNode;
}) {
  const { w, d, h } = ROOM;
  const windowGeo = useMemo(() => {
    const g = new THREE.ShapeGeometry(archShape(1.7, 4.2));
    return g;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={floor} roughness={0.35} metalness={0.05} />
      </mesh>
      {glassRoof ? (
        <group position={[0, h, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial color="#cfe8ff" transparent opacity={0.35} roughness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[0, -0.02, -d / 2 + (i * d) / 6]}>
              <boxGeometry args={[w, 0.12, 0.12]} />
              <meshStandardMaterial color="#f3f0ff" />
            </mesh>
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[-w / 2 + (i * w) / 4, -0.02, 0]}>
              <boxGeometry args={[0.12, 0.12, d]} />
              <meshStandardMaterial color="#f3f0ff" />
            </mesh>
          ))}
        </group>
      ) : (
        <mesh rotation-x={Math.PI / 2} position={[0, h, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color={ceiling} roughness={1} />
        </mesh>
      )}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2, d / 2]} rotation-y={Math.PI}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      {/* skirting & cornice */}
      {[-w / 2 + 0.1, w / 2 - 0.1].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.25, 0]}>
            <boxGeometry args={[0.2, 0.5, d]} />
            <meshStandardMaterial color={trim} roughness={0.8} />
          </mesh>
          <mesh position={[x, h - 0.2, 0]}>
            <boxGeometry args={[0.2, 0.4, d]} />
            <meshStandardMaterial color={trim} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* pillars */}
      {[-w / 2 + 1, w / 2 - 1].map((x) =>
        [-8, -3, 2, 7].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.38, 0.45, h, 14]} />
              <meshStandardMaterial color="#fbf5f7" roughness={0.6} />
            </mesh>
            <mesh position={[0, h - 0.3, 0]}>
              <boxGeometry args={[1.1, 0.5, 1.1]} />
              <meshStandardMaterial color={trim} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[1.1, 0.5, 1.1]} />
              <meshStandardMaterial color={trim} roughness={0.7} />
            </mesh>
          </group>
        )),
      )}
      {/* windows */}
      {windows &&
        [-1, 1].map((side) =>
          [-5.5, 0, 5.5].map((z) => (
            <group key={`${side}-${z}`} position={[side * (w / 2 - 0.05), 2.4, z]} rotation-y={side > 0 ? -Math.PI / 2 : Math.PI / 2}>
              <mesh geometry={windowGeo}>
                <meshStandardMaterial color={windowGlow} emissive={windowGlow} emissiveIntensity={1.1} toneMapped={false} />
              </mesh>
              <mesh position={[0, 2.1, 0.01]}>
                <boxGeometry args={[1.8, 0.08, 0.05]} />
                <meshStandardMaterial color={trim} />
              </mesh>
              <mesh position={[0, 2.1, 0.01]}>
                <boxGeometry args={[0.08, 4.2, 0.05]} />
                <meshStandardMaterial color={trim} />
              </mesh>
              <pointLight position={[0, 2, 1.5]} intensity={12} distance={9} color={windowGlow} />
            </group>
          )),
        )}
      {children}
    </group>
  );
}

function RoomLights({ ambient = 0.45, color = "#ffe9f0" }: { ambient?: number; color?: string }) {
  return (
    <>
      <ambientLight intensity={ambient} color={color} />
      <hemisphereLight args={["#ffffff", "#8a6d7a", 0.5]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Room 0 — Grand Hall                                                  */
/* ------------------------------------------------------------------ */

function GrandHall() {
  const goToRoom = useFairy((s) => s.goToRoom);
  return (
    <RoomShell>
      <RoomLights />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -0.5]} receiveShadow>
        <planeGeometry args={[3.6, 22]} />
        <meshStandardMaterial color="#b3123a" roughness={0.9} />
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.012, -0.5]}>
          <planeGeometry args={[0.2, 22]} />
          <meshStandardMaterial color="#e6c15a" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      <Chandelier position={[0, 6.6, -1]} />
      <Door position={[0, 0, -ROOM.d / 2 + 0.05]} label="→ Tulip Gallery" onEnter={() => goToRoom(1)} />
      <TextPlane
        text="Happy Birthday"
        width={7}
        height={1.6}
        position={[-4.2, 7.2, -ROOM.d / 2 + 0.1]}
        color="#fff"
        font='400 190px "Great Vibes", cursive'
        background="rgba(255,111,165,0.9)"
      />
      <TextPlane
        text="Khushi ♥"
        width={7}
        height={1.6}
        position={[4.2, 7.2, -ROOM.d / 2 + 0.1]}
        color="#fff"
        font='400 190px "Great Vibes", cursive'
        background="rgba(181,123,238,0.9)"
      />
      {[-1, 1].map((side) =>
        [-8.5, -3, 2.5].map((z, i) => (
          <Painting
            key={`${side}${z}`}
            position={[side * (ROOM.w / 2 - 0.12), 4.2, z + 2.6]}
            rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            seed={i + (side > 0 ? 10 : 20)}
            bg={["#ffe4ef", "#ece4ff", "#fff3d6"][i]}
          />
        )),
      )}
      {[-2.9, 2.9].map((x) =>
        [-7, -3, 1, 5].map((z, i) => <TulipVase key={`${x}${z}`} position={[x, 0, z]} seed={i + (x > 0 ? 3 : 9)} count={6} />),
      )}
      <Balloons position={[-6, 0, 6]} />
      <Balloons position={[6, 0, 6]} colors={["#ffd54a", "#ff6fa5", "#a7f3d0", "#b57bee"]} />
      <Balloons position={[-6, 0, -6]} colors={["#7dd3fc", "#ff9a4d", "#ff6fa5"]} />
      <Balloons position={[6, 0, -6]} colors={["#b57bee", "#ffd54a", "#ff6fa5", "#7dd3fc"]} />
      <Gift position={[-5.5, 0, -8.5]} color="#ff6fa5" ribbon="#fff4f7" message="🎁 Inside: all my hugs, wrapped up" size={1.2} />
      <Gift position={[5.5, 0, -8.5]} color="#7dd3fc" ribbon="#ffd54a" message="🎁 Inside: a lifetime of birthdays together" size={1} />
      <Sparkles count={140} scale={[14, 8, 22]} position={[0, 4.5, 0]} size={5} speed={0.45} color="#ffd1e8" />
      <RoomCamera position={[0, 2.6, 10.5]} look={[0, 2.4, -6]} />
    </RoomShell>
  );
}

/* ------------------------------------------------------------------ */
/* Room 1 — Tulip Gallery                                               */
/* ------------------------------------------------------------------ */

function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.6, 32]} />
        <meshStandardMaterial color="#e4dcd6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#7cc8e6" roughness={0.1} metalness={0.3} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 1.4, 16]} />
        <meshStandardMaterial color="#e4dcd6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.9, 0.5, 0.35, 24]} />
        <meshStandardMaterial color="#e4dcd6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 10]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.8} />
      </mesh>
      <Sparkles count={90} scale={[1.6, 2.6, 1.6]} position={[0, 2.4, 0]} size={7} speed={3} color="#ffffff" />
      <Sparkles count={50} scale={[4, 0.6, 4]} position={[0, 0.9, 0]} size={5} speed={2} color="#dff4ff" />
    </group>
  );
}

const GALLERY_ANCHORS: [number, number][] = [
  [-4.5, -6],
  [4.5, -6],
  [-4.5, 5],
  [4.5, 5],
  [0, 0],
];

function TulipGallery() {
  const goToRoom = useFairy((s) => s.goToRoom);
  const beds = useMemo(
    () => [
      { x0: -6.2, x1: -2.6, z0: -9.5, z1: -3.2, seed: 101 },
      { x0: 2.6, x1: 6.2, z0: -9.5, z1: -3.2, seed: 102 },
      { x0: -6.2, x1: -2.6, z0: 3, z1: 8.5, seed: 103 },
      { x0: 2.6, x1: 6.2, z0: 3, z1: 8.5, seed: 104 },
    ],
    [],
  );
  const spots = useMemo(
    () => beds.flatMap((b) => scatterInRect(85, b.seed, b.x0 + 0.3, b.x1 - 0.3, b.z0 + 0.3, b.z1 - 0.3, 0.5)),
    [beds],
  );
  return (
    <RoomShell floor="#e7efe3" wall="#f3f7ef" trim="#b8cfae" glassRoof windowGlow="#fff7e6">
      <RoomLights ambient={0.6} color="#fff8f0" />
      <directionalLight position={[4, 12, 3]} intensity={1.6} color="#fff6e6" castShadow shadow-mapSize={[1024, 1024]} />
      {beds.map((b, i) => (
        <group key={i}>
          <mesh position={[(b.x0 + b.x1) / 2, 0.25, (b.z0 + b.z1) / 2]} castShadow receiveShadow>
            <boxGeometry args={[b.x1 - b.x0, 0.5, b.z1 - b.z0]} />
            <meshStandardMaterial color="#c9b7a2" roughness={0.9} />
          </mesh>
          <mesh position={[(b.x0 + b.x1) / 2, 0.5, (b.z0 + b.z1) / 2]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[b.x1 - b.x0 - 0.3, b.z1 - b.z0 - 0.3]} />
            <meshStandardMaterial color="#5b3e2a" roughness={1} />
          </mesh>
        </group>
      ))}
      <TulipField spots={spots} />
      <Fountain position={[0, 0, -1]} />
      {Array.from({ length: 6 }, (_, i) => (
        <Butterfly key={i} seed={i + 20} anchors={GALLERY_ANCHORS} height={2.2} range={1.6} />
      ))}
      {[-1, 1].map((side) =>
        [-9, 1.5].map((z, i) => (
          <Painting
            key={`${side}${z}`}
            position={[side * (ROOM.w / 2 - 0.12), 4.2, z + 1.2]}
            rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            seed={i + (side > 0 ? 30 : 40)}
            bg={["#e6f4e2", "#fff0f5"][i]}
          />
        )),
      )}
      <Door position={[0, 0, -ROOM.d / 2 + 0.05]} label="→ Hall of Wishes" onEnter={() => goToRoom(2)} glow="#ffe08a" />
      <TextPlane
        text="Every tulip here is for you, Khushi"
        width={9}
        height={1.2}
        position={[0, 7.4, -ROOM.d / 2 + 0.1]}
        color="#5b3e2a"
        font='400 130px "Great Vibes", cursive'
      />
      <Sparkles count={100} scale={[14, 6, 22]} position={[0, 3.5, 0]} size={3} speed={0.3} color="#fff7d6" />
      <RoomCamera position={[0, 2.8, 10.5]} look={[0, 2, -6]} />
    </RoomShell>
  );
}

/* ------------------------------------------------------------------ */
/* Room 2 — Hall of Wishes (database driven)                            */
/* ------------------------------------------------------------------ */

function Lantern({ wish, position, index }: { wish: WishDTO; position: [number, number, number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | null>(null);
  const ref = useRef<THREE.Group>(null);
  const addBurst = useFairy((s) => s.addBurst);
  useCursor(hovered);
  const color = TULIP_COLORS[wish.color];
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.y = Math.sin(t * 1.1 + index) * 0.12;
    g.rotation.y = Math.sin(t * 0.5 + index) * 0.2;
  });
  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    },
    [],
  );
  return (
    <group position={position}>
      <group
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          playSound("chime");
          addBurst({ position: [position[0], position[1] + 0.6, position[2]], color, kind: "hearts", count: 10 });
          if (timeout.current) window.clearTimeout(timeout.current);
          timeout.current = window.setTimeout(() => setOpen(false), 6000);
        }}
      >
        <mesh castShadow scale={hovered ? 1.1 : 1}>
          <cylinderGeometry args={[0.36, 0.36, 0.7, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.2 : 0.7} transparent opacity={0.92} />
        </mesh>
        {[-0.38, 0.38].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 16]} />
            <meshStandardMaterial color="#5a3a44" />
          </mesh>
        ))}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.4, 6]} />
          <meshStandardMaterial color="#e6c15a" />
        </mesh>
        <pointLight intensity={hovered ? 8 : 4} distance={5} color={color} />
        <TextPlane
          text={wish.name}
          width={2}
          height={0.5}
          position={[0, -1.05, 0]}
          color="#fff8fb"
          font='600 90px "Quicksand", sans-serif'
          background="rgba(60,20,60,0.55)"
        />
        {open && (
          <Html position={[0, 1, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
            <div className="fairy-bubble fairy-bubble--wish">
              <strong>{wish.name}</strong>
              <span>{wish.message}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function HallOfWishes() {
  const goToRoom = useFairy((s) => s.goToRoom);
  const wishes = useFairy((s) => s.wishes);
  const setHint = useFairy((s) => s.setHint);
  useEffect(() => {
    setHint("Tap a lantern to read the wish · add yours with 🌷 Plant a wish");
    return () => setHint(null);
  }, [setHint]);
  const lanterns = useMemo(() => {
    const cols = [-5.6, -2.2, 2.2, 5.6];
    return wishes.map((w, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const layer = Math.floor(row / 8);
      return {
        w,
        position: [cols[col], 2.6 + layer * 2.2 + (col % 2) * 0.5, 7 - (row % 8) * 2.3] as [number, number, number],
      };
    });
  }, [wishes]);
  return (
    <RoomShell floor="#3b2440" wall="#5b3a6e" trim="#8a5f9a" ceiling="#2a1730" windowGlow="#ffd9a8">
      <RoomLights ambient={0.28} color="#e9d5ff" />
      <Sparkles count={260} scale={[15, 6, 23]} position={[0, 6.5, 0]} size={3} speed={0.15} color="#ffe9a8" />
      {lanterns.map((l, i) => (
        <Lantern key={l.w.id} wish={l.w} position={l.position} index={i} />
      ))}
      {/* Khushi's giant tulip in the centre */}
      <group position={[0, 0, -1]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[1.4, 1.6, 0.6, 24]} />
          <meshStandardMaterial color="#d9c1de" roughness={0.5} />
        </mesh>
        <group position={[0, 0.6, 0]}>
          <Tulip color="#ff6fa5" scale={2.6} glow />
        </group>
        <pointLight position={[0, 3.5, 0]} intensity={30} distance={14} color="#ff9ccf" />
        <Sparkles count={60} scale={[3, 4, 3]} position={[0, 2.5, 0]} size={5} speed={0.5} color="#ffd6ea" />
      </group>
      <TextPlane
        text={`${wishes.length} wishes bloom for Khushi`}
        width={9}
        height={1.3}
        position={[0, 7.4, -ROOM.d / 2 + 0.1]}
        color="#fff3fa"
        font='400 150px "Great Vibes", cursive'
        shadow="rgba(0,0,0,0.5)"
      />
      <Door position={[0, 0, -ROOM.d / 2 + 0.05]} label="→ Heart Chamber 💍" onEnter={() => goToRoom(3)} glow="#ff8fb6" />
      <RoomCamera position={[0, 2.8, 10.5]} look={[0, 2.4, -6]} />
    </RoomShell>
  );
}

/* ------------------------------------------------------------------ */

export function Interior() {
  const room = useFairy((s) => s.room);
  return (
    <>
      <color attach="background" args={[room === 3 ? "#160a17" : "#2a1730"]} />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.5} position={[0, 6, -8]} scale={[12, 6, 1]} color="#fff0e0" />
        <Lightformer intensity={1.2} position={[-8, 4, 0]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#ffd6e8" />
        <Lightformer intensity={1.2} position={[8, 4, 0]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color="#dbe8ff" />
        <Lightformer intensity={0.6} position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#6b3a55" />
      </Environment>
      {room === 0 && <GrandHall />}
      {room === 1 && <TulipGallery />}
      {room === 2 && <HallOfWishes />}
      {room === 3 && <RingRoom />}
      <Bursts />
    </>
  );
}

export function useRoomRng(seed: number) {
  return useMemo(() => makeRng(seed), [seed]);
}
