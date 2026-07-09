'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import { useRef, useEffect, useMemo, useCallback, useState, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ─────────────────────────────────────────────────────────────────
// Scene constants — all tunable values live here
// ─────────────────────────────────────────────────────────────────
const S = {
  // CSS backgrounds — near-pure black, phygitals style
  bgGrad:   'linear-gradient(to bottom, #060606 0%, #000000 100%)',
  bgZoomed: '#000000',

  // Floor — sharper reflection, darker base. mixStrength kept moderate so the
  // reflection reads as a pool under the pack, not a bright grazing horizon band.
  floorSize:        40,
  floorColor:       '#050508',
  floorBlur:        [80, 30] as [number, number],  // less blur = crisper reflection
  floorMixStrength: 13,
  floorMirror:      0.88,
  floorDepthScale:  0.90,

  // Particles
  particleColor:  '#C9A96E',
  particleCount:  15,
  particleSize:   0.052,   // bigger = more visible
  particleSpeed:  0.005,
  particleSpread: 4.2,
  particleMinY:  -0.3,
  particleMaxY:   4.5,

  // Pack placeholder
  packW:             0.68,
  packH:             0.95,
  packDepth:         0.014,
  packBody:          '#1E1E2A',
  packBorder:        '#C9A96E',
  packBorderPad:     0.020,
  packMetalness:     0.30,
  packRoughness:     0.40,
  packBorderEmissive: 0.16,

  // Ring layout
  packCount:    8,
  ringRadius:   3.1,   // desktop ring radius + canonical opening STAGE z
  ringRadiusM:  1.2,   // mobile portrait ring radius (tight, for telephoto peek)
  packY:        0.56,
  entryFromY:  -4.2,
  entryStagger: 0.10,

  // Depth illusion (ring mode) — desktop
  minDepthScale:   0.52,
  minDepthOpacity: 0.25,
  // Mobile portrait: neighbors sit closer + shouldn't over-shrink or vanish,
  // so keep them near full scale and let opacity fall off faster for back packs.
  minDepthScaleM:   0.85,
  minDepthOpacityM: 0.05,

  // Camera — ring mode (desktop / landscape)
  camY:   1.20,
  camZ:   6.60,
  camFov: 42,
  camLAY: 0.0,   // lookAt Y
  camLAZ: 0.0,   // lookAt Z

  // Camera — ring mode, MOBILE PORTRAIT override (telephoto for Pokémon-Pocket
  // style peek). Far camera + narrow FOV + small ring radius compresses depth so
  // the two neighbors peek ~11% from each edge while the center pack fills ~45%
  // of width, vertically centered at ~45% from top. Derived from projection math
  // for a 440×956 viewport. On tap, the selected pack glides from this tight
  // ring to the canonical stage (z = ringRadius) so opening/zoom stay untouched.
  camYM:   0.56,
  camZM:   9.00,
  camFovM: 24,
  camLAYM: 0.40,
  camLAZM: 1.20,   // = ringRadiusM (look at the front pack)
  // Aspect blend: mobileT=1 at/below portraitLo, 0 at/above portraitHi
  portraitLo: 0.55,
  portraitHi: 0.90,

  // Camera — zoomed mode
  camYZ:   0.72,
  camZZ:   4.85,
  // Portrait override: at aspect 0.46 the desktop zoom distance can only show
  // ~0.52 world units of width — narrower than the pack (0.68) and far narrower
  // than the rising card (1.1), which caused the zoom overflow + giant card
  // back on mobile. Pulled back so the frustum width at the stage (z=3.1) is
  // ~1.25: card back fills ~88% of screen width, pack ~58%. Desktop unchanged.
  camZZM:  7.30,
  camFovZ: 36,
  camLAYZ: 0.56,   // packY
  camLAZZ: 3.10,   // ringRadius

  // Zoom transitions
  zoomDur:   0.50,
  unzoomDur: 0.42,

  // Idle motion (front pack, ±3 deg)
  idleAmp:   (3 * Math.PI) / 180,
  idleSpeed: 0.55,

  // Swipe / tap
  swipeSens:    0.0028,
  inertiaDamp:  0.91,
  tapThreshold: 8,     // px — max cumulative drag for a tap to register

  // Camera — result mode (card pulled toward camera for full view)
  camYR:    0.72,   // same height as zoomed camera
  camZR:    7.5,    // pulled back so full card fits in frame
  camFovR:  44,     // slightly wider
  camLAYR:  0.56,   // look at card center
  camLAZR:  4.2,    // where the card will be

  // Lighting — low ambient keeps background black; key dominates center.
  // These are the ZOOMED / OPENING values (dark "spotlight in the void").
  ambientInt:  0.06,
  keyColor:    '#FFF8F0',
  keyInt:      4.5,
  fillColor:   '#A0C0E8',
  fillInt:     0.18,
  rimColor:    '#6888B0',
  rimInt:      0.28,

  // RING selection screen — lit as a dark premium showroom: a directional key
  // (with distance falloff) picks out the pack, while flat ambient stays LOW so
  // the reflective floor fades to black in the distance instead of showing a
  // lit horizon band behind the pack. Lerped down to the zoomed/opening values
  // as zoomT rises, preserving the "darkness → light" world for the opening.
  ringAmbient: 0.20,
  ringKey:     7.5,

  // Environment map intensity
  envInt: 0.45,
} as const;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function packAngle(index: number, offset: number): number {
  return (Math.PI * 2 * index) / S.packCount + offset;
}

function depthFactor(angle: number): number {
  return (Math.cos(angle) + 1) / 2;
}

// Aspect → mobile blend factor. 1 = full portrait telephoto, 0 = desktop.
function mobileBlend(aspect: number): number {
  return THREE.MathUtils.clamp(
    (S.portraitHi - aspect) / (S.portraitHi - S.portraitLo), 0, 1,
  );
}

// ─────────────────────────────────────────────────────────────────
// Particles
// ─────────────────────────────────────────────────────────────────
function Particles() {
  const posArr = useMemo(() => {
    const arr = new Float32Array(S.particleCount * 3);
    for (let i = 0; i < S.particleCount; i++) {
      const r = Math.random() * S.particleSpread;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3]     = r * Math.cos(a);
      arr[i * 3 + 1] = S.particleMinY + Math.random() * (S.particleMaxY - S.particleMinY);
      arr[i * 3 + 2] = r * Math.sin(a) - 1.5;
    }
    return arr;
  }, []);

  const speeds = useMemo(() => {
    const arr = new Float32Array(S.particleCount);
    for (let i = 0; i < S.particleCount; i++) arr[i] = 0.6 + Math.random() * 0.8;
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    const attr = pointsRef.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const a = attr.array as Float32Array;
    for (let i = 0; i < S.particleCount; i++) {
      a[i * 3 + 1] += S.particleSpeed * speeds[i];
      if (a[i * 3 + 1] > S.particleMaxY) a[i * 3 + 1] = S.particleMinY;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArr, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={S.particleColor}
        size={S.particleSize}
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────
// Floor
// ─────────────────────────────────────────────────────────────────
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[S.floorSize, S.floorSize]} />
      <MeshReflectorMaterial
        blur={S.floorBlur}
        resolution={512}
        mixBlur={0.9}
        mixStrength={S.floorMixStrength}
        roughness={0.85}
        depthScale={S.floorDepthScale}
        minDepthThreshold={0.2}
        maxDepthThreshold={1.2}
        color={S.floorColor}
        metalness={0.65}
        mirror={S.floorMirror as 0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pack ring
// ─────────────────────────────────────────────────────────────────
interface PackRingProps {
  ringAngleRef:    React.MutableRefObject<number>;
  zoomT:           React.MutableRefObject<number>;
  selectedPackIdx: React.MutableRefObject<number>;
  resultT:         React.MutableRefObject<number>;
}

function PackRing({ ringAngleRef, zoomT, selectedPackIdx, resultT }: PackRingProps) {
  const { camera } = useThree();
  const groups    = useRef<THREE.Group[]>([]);
  const bodyMats  = useRef<THREE.MeshStandardMaterial[]>([]);
  const brdMats   = useRef<THREE.MeshStandardMaterial[]>([]);
  const artMats   = useRef<THREE.MeshStandardMaterial[]>([]);
  const stripeMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const idleTime  = useRef(0);
  const frontIdx  = useRef(0);

  // Entry animation — GSAP animates Y, useFrame owns XZ
  useEffect(() => {
    const id = setTimeout(() => {
      groups.current.forEach((g, i) => {
        const angle = packAngle(i, 0);
        g.position.set(S.ringRadius * Math.sin(angle), S.entryFromY, S.ringRadius * Math.cos(angle));
        g.rotation.y = angle;
        g.scale.setScalar(S.minDepthScale);
        gsap.to(g.position, {
          y: S.packY,
          duration: 0.78,
          delay: i * S.entryStagger,
          ease: 'back.out(1.3)',
        });
      });
    }, 40);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const t = zoomT.current;
    idleTime.current += delta;

    // Responsive ring geometry: tight radius + less depth shrink on portrait.
    const mobileT = mobileBlend((camera as THREE.PerspectiveCamera).aspect);
    const R        = THREE.MathUtils.lerp(S.ringRadius,      S.ringRadiusM,      mobileT);
    const minScale = THREE.MathUtils.lerp(S.minDepthScale,   S.minDepthScaleM,   mobileT);
    const minOp    = THREE.MathUtils.lerp(S.minDepthOpacity, S.minDepthOpacityM, mobileT);

    // Find front pack (closest cos angle to 0)
    let best = 0, bestDf = -Infinity;
    for (let i = 0; i < S.packCount; i++) {
      const df = depthFactor(packAngle(i, ringAngleRef.current));
      if (df > bestDf) { bestDf = df; best = i; }
    }
    frontIdx.current = best;

    groups.current.forEach((g, i) => {
      if (!g) return;
      const angle   = packAngle(i, ringAngleRef.current);
      const df      = depthFactor(angle);
      const isFront = i === frontIdx.current;
      const isSelected = i === selectedPackIdx.current;

      // XZ from the responsive ring radius (GSAP owns Y). The selected pack
      // glides from the tight mobile ring to the canonical stage (0, z=ringRadius)
      // as zoom rises, so opening/zoom geometry is device-independent. On desktop
      // R === ringRadius, so this lerp is a no-op and framing is unchanged.
      const ringX = R * Math.sin(angle);
      const ringZ = R * Math.cos(angle);
      if (isSelected) {
        g.position.x = THREE.MathUtils.lerp(ringX, 0,             t);
        g.position.z = THREE.MathUtils.lerp(ringZ, S.ringRadius,  t);
      } else {
        g.position.x = ringX;
        g.position.z = ringZ;
      }

      // Rotation + idle sway: ring mode only, fades to 0 on selected pack as zoom increases
      const idleScale  = isSelected ? (1 - t) : (isFront ? 1 : 0);
      const idle       = Math.sin(idleTime.current * S.idleSpeed) * S.idleAmp * idleScale;
      g.rotation.y     = angle + idle;

      // Scale by ring depth (responsive floor)
      g.scale.setScalar(minScale + df * (1 - minScale));

      // Opacity: ring depth-based → selected-only when zoomed
      // Use selectedPackIdx (frozen at tap time) so the chosen pack stays
      // visible throughout the entire zoom transition, regardless of any
      // tiny ringAngle drift that might change frontIdx mid-tween.
      const ringOp    = minOp + df * (1 - minOp);
      const zoomOp    = isSelected ? 1.0 : 0.0;
      const zoomedOp  = THREE.MathUtils.lerp(ringOp, zoomOp, t);
      // In result mode, fade selected pack to 0 so only the card is visible
      const op = isSelected
        ? THREE.MathUtils.lerp(zoomedOp, 0, resultT.current)
        : zoomedOp;

      const bm = bodyMats.current[i];
      const bd = brdMats.current[i];
      const am = artMats.current[i];
      const sm = stripeMats.current[i];
      if (bm) bm.opacity = op;
      if (bd) bd.opacity = op;
      if (am) am.opacity = op * 0.94;
      if (sm) sm.opacity = op * 0.55;
    });
  });

  return (
    <>
      {Array.from({ length: S.packCount }, (_, i) => (
        <group key={i} ref={(el) => { if (el) groups.current[i] = el; }}>
          {/* Champagne gold border */}
          <mesh>
            <boxGeometry
              args={[S.packW + S.packBorderPad * 2, S.packH + S.packBorderPad * 2, S.packDepth]}
            />
            <meshStandardMaterial
              ref={(el) => { if (el) brdMats.current[i] = el as THREE.MeshStandardMaterial; }}
              color={S.packBorder}
              metalness={0.88}
              roughness={0.12}
              transparent
              opacity={1}
              emissive={new THREE.Color(S.packBorder)}
              emissiveIntensity={S.packBorderEmissive}
            />
          </mesh>

          {/* Dark body */}
          <mesh position-z={S.packDepth * 0.35}>
            <boxGeometry args={[S.packW, S.packH, S.packDepth]} />
            <meshStandardMaterial
              ref={(el) => { if (el) bodyMats.current[i] = el as THREE.MeshStandardMaterial; }}
              color={S.packBody}
              metalness={S.packMetalness}
              roughness={S.packRoughness}
              transparent
              opacity={1}
            />
          </mesh>

          {/* Art area placeholder — deliberately blank: the pack cover must not
              reveal the pull result (the card art only appears after opening) */}
          <mesh position={[0, 0.06, S.packDepth * 0.9]}>
            <planeGeometry args={[S.packW * 0.80, S.packH * 0.52]} />
            <meshStandardMaterial
              ref={(el) => { if (el) artMats.current[i] = el as THREE.MeshStandardMaterial; }}
              color="#242432" roughness={0.88} transparent opacity={0.94}
            />
          </mesh>

          {/* Header stripe */}
          <mesh position={[0, S.packH * 0.40, S.packDepth * 0.9]}>
            <planeGeometry args={[S.packW * 0.80, S.packH * 0.075]} />
            <meshStandardMaterial
              ref={(el) => { if (el) stripeMats.current[i] = el as THREE.MeshStandardMaterial; }}
              color={S.packBorder}
              metalness={0.75}
              roughness={0.22}
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// ZoomController — camera lerp + floor/particle fade (inside Canvas)
// ─────────────────────────────────────────────────────────────────
interface ZoomControllerProps {
  zoomT:             React.MutableRefObject<number>;
  resultT:           React.MutableRefObject<number>;
  floorGroupRef:     React.RefObject<THREE.Group | null>;
  particleGroupRef:  React.RefObject<THREE.Group | null>;
}

function ZoomController({ zoomT, resultT, floorGroupRef, particleGroupRef }: ZoomControllerProps) {
  const { camera } = useThree();

  useFrame(() => {
    const t  = zoomT.current;
    const rt = resultT.current;

    // Responsive ring framing: on portrait, pull the camera in + widen the FOV
    // so the front pack fills ~64% of height (Option A). Desktop is unchanged
    // (mobileT = 0 at aspect ≥ portraitHi). Only the ring-mode endpoints are
    // responsive; zoomed/result framing is identical across devices.
    const cam = camera as THREE.PerspectiveCamera;
    const mobileT = mobileBlend(cam.aspect);
    const ringY   = THREE.MathUtils.lerp(S.camY,   S.camYM,   mobileT);
    const ringZ   = THREE.MathUtils.lerp(S.camZ,   S.camZM,   mobileT);
    const ringFov = THREE.MathUtils.lerp(S.camFov, S.camFovM, mobileT);
    const ringLAY = THREE.MathUtils.lerp(S.camLAY, S.camLAYM, mobileT);
    const ringLAZ = THREE.MathUtils.lerp(S.camLAZ, S.camLAZM, mobileT);

    // Ring → zoomed lerp. The zoomed Z endpoint is also responsive: portrait
    // pulls back (camZZM) so the pack and the rising card fit the narrow frustum.
    const zoomedZ = THREE.MathUtils.lerp(S.camZZ, S.camZZM, mobileT);
    const zY   = THREE.MathUtils.lerp(ringY,   S.camYZ,   t);
    const zZ   = THREE.MathUtils.lerp(ringZ,   zoomedZ,   t);
    const zFov = THREE.MathUtils.lerp(ringFov, S.camFovZ, t);
    const zLAY = THREE.MathUtils.lerp(ringLAY, S.camLAYZ, t);
    const zLAZ = THREE.MathUtils.lerp(ringLAZ, S.camLAZZ, t);

    // Zoomed → result lerp (camera pulls back for full card view)
    camera.position.set(
      0,
      THREE.MathUtils.lerp(zY,   S.camYR,   rt),
      THREE.MathUtils.lerp(zZ,   S.camZR,   rt),
    );
    camera.lookAt(
      0,
      THREE.MathUtils.lerp(zLAY, S.camLAYR, rt),
      THREE.MathUtils.lerp(zLAZ, S.camLAZR, rt),
    );

    cam.fov = THREE.MathUtils.lerp(zFov, S.camFovR, rt);
    cam.updateProjectionMatrix();

    // Floor: slide below scene when zoomed
    if (floorGroupRef.current) {
      floorGroupRef.current.position.y = THREE.MathUtils.lerp(0, -6, t);
    }

    // Particles: slide off-scene when zoomed
    if (particleGroupRef.current) {
      particleGroupRef.current.position.y = THREE.MathUtils.lerp(0, -12, t);
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────
// Opening sequence — tear line → flap → card reveal
// ─────────────────────────────────────────────────────────────────
const OPEN = {
  packX:  0,
  packY:  S.packY,
  packZ:  S.ringRadius,
  // tear line sits 15% from top of pack
  tearY:  S.packY + S.packH * 0.5 - S.packH * 0.15,
  flapH:  S.packH * 0.15,
  // Phase A — interior light that leaks from the tear (peak intensity)
  interiorPeak: 2.6,
  // charizard.jpg is 800×1350 px (height/width = 1.6875) — test asset, replace before launch
  cardW:   1.1,
  cardH:   1.1 * (1350 / 800),  // ≈ 1.856 — matches image aspect ratio, no distortion
  resultY: 0.56,                  // card Y in result mode (camera lookAt height)
  resultZ: 4.2,                   // card Z in result mode (pulled toward camera)
} as const;

// ─────────────────────────────────────────────────────────────────
// Phase B — tear light palette
// Warm-white showroom tungsten, NOT casino orange. Deliberately warm to
// counteract the scene's blue fill/rim lights (which made the earlier
// pure-white tear + interior light read as cool blue-white).
// ─────────────────────────────────────────────────────────────────
const TEAR = {
  gapH:          0.16,        // height the emissive gap opens to
  coreColor:     '#FFF4E6',   // bright warm-white core of the crack
  glowColor:     '#FFE6C2',   // warm halo/bloom + interior light color
  gapColor:      '#FFEACB',   // gap emissive base (warm), tinted toward rarity
  rarityTint:    0.30,        // 0=pure warm, 1=pure rarity color (Phase E may push higher)
  coreEmissive:  2.2,
  haloEmissive:  1.3,
  bloomEmissive: 0.7,
  gapEmissive:   1.8,
} as const;

// ─────────────────────────────────────────────────────────────────
// Rarity system — 5 tiers
// In production, rarity is determined server-side before the pack is opened.
// Client only receives and displays the result.
// ─────────────────────────────────────────────────────────────────
type RarityKey = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type PackRingSceneProps = {
  /** Outcome tier from the server / roll — drives tear glow + banner colors. */
  rollRarity?: RarityKey;
  cardLabel?: string;
  /** When true, hides Back and uses `onRevealDone` on the result tap. */
  embed?: boolean;
  onRevealDone?: () => void;
  skipNonce?: number;
};

const RARITY: Record<RarityKey, { color: string; label: string }> = {
  common:    { color: '#9CA3AF', label: 'COMMON'          },
  rare:      { color: '#3B82F6', label: 'RARE'            },
  epic:      { color: '#A855F7', label: 'EPIC PULL'       },
  legendary: { color: '#F59E0B', label: 'LEGENDARY PULL'  },
  mythic:    { color: '#EF4444', label: 'MYTHIC PULL'     },
};

// Test asset — swap for production image before launch
function CardMeshInner({
  matRef,
  backMatRef,
  glowMatRef,
  diamondMatRef,
  rarityColor,
}: {
  matRef:        React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  backMatRef:    React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  glowMatRef:    React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  diamondMatRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  rarityColor:   string;
}) {
  const texture = useTexture('/assets/charizard.jpg');
  return (
    <>
      {/* Front face: charizard (faces +Z toward camera) */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[OPEN.cardW, OPEN.cardH]} />
        <meshStandardMaterial
          ref={(el) => { matRef.current = el; }}
          map={texture}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Back face: black diffuse + dark emissive so no light (incl. spotlight intensity 6) can wash it out */}
      <mesh position={[0, 0, -0.003]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[OPEN.cardW, OPEN.cardH]} />
        <meshStandardMaterial
          ref={(el) => { backMatRef.current = el; }}
          color="#000000"
          emissive="#0D0D1A"
          emissiveIntensity={1}
          roughness={1}
          metalness={0}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Rarity diamond mark — black diffuse + rarity emissive so color stays clean under intense lights */}
      <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, Math.PI / 4]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshStandardMaterial
          ref={(el) => { diamondMatRef.current = el; }}
          color="#000000"
          emissive={rarityColor}
          emissiveIntensity={0.9}
          roughness={1}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Rarity glow border — slightly oversized plane behind back face */}
      <mesh position={[0, 0, -0.007]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[OPEN.cardW + 0.06, OPEN.cardH + 0.06]} />
        <meshStandardMaterial
          ref={(el) => { glowMatRef.current = el; }}
          color="#C9A96E"
          emissive="#C9A96E"
          emissiveIntensity={2.5}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

interface OpeningSequenceProps {
  active:         boolean;
  onComplete:     () => void;
  isRevealing:    boolean;   // card moves to viewing position + rarity glow
  isFlipping:     boolean;   // triggers Y-axis flip back→front
  onFlipComplete: () => void;
  rarity:         RarityKey;
}

function OpeningSequence({ active, onComplete, isRevealing, isFlipping, onFlipComplete, rarity }: OpeningSequenceProps) {
  // Phase B — 3-layer tear line (core/halo/bloom) + emissive gap
  const tearLineGroupRef = useRef<THREE.Group>(null);
  const lineCoreMatRef   = useRef<THREE.MeshStandardMaterial | null>(null);
  const lineHaloMatRef   = useRef<THREE.MeshStandardMaterial | null>(null);
  const lineBloomMatRef  = useRef<THREE.MeshStandardMaterial | null>(null);
  const gapRef           = useRef<THREE.Mesh>(null);
  const gapMatRef        = useRef<THREE.MeshStandardMaterial | null>(null);
  const flapRef        = useRef<THREE.Mesh>(null);
  const cardRef        = useRef<THREE.Group>(null);
  const flapMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardBackMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardGlowMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardDiamondMatRef  = useRef<THREE.MeshStandardMaterial | null>(null);
  // Phase A — pack lower half (pedestal) + interior light
  const bottomRef          = useRef<THREE.Mesh>(null);
  const bottomMatRef       = useRef<THREE.MeshStandardMaterial | null>(null);
  const interiorLightRef   = useRef<THREE.PointLight>(null);

  const flapCenterY = OPEN.tearY + OPEN.flapH * 0.5;
  const cardStartY  = OPEN.packY - 0.3;
  const cardEndY    = OPEN.packY + 0.55;

  // Pack lower half spans from the bottom edge up to the tear line
  const packBottomY   = OPEN.packY - S.packH * 0.5;
  const bottomH       = OPEN.tearY - packBottomY;
  const bottomCenterY = (packBottomY + OPEN.tearY) / 2;

  // Glide card to viewing position + fade in rarity-colored glow
  useEffect(() => {
    if (!isRevealing || !cardRef.current) return;
    gsap.to(cardRef.current.position, {
      y: OPEN.resultY,
      z: OPEN.resultZ,
      duration: 0.5,
      ease: 'power2.inOut',
    });
    if (cardGlowMatRef.current) {
      cardGlowMatRef.current.color.set(RARITY[rarity].color);
      cardGlowMatRef.current.emissive.set(RARITY[rarity].color);
      gsap.to(cardGlowMatRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.3 });
    }
  }, [isRevealing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Y-axis 180° flip: back face → front face (rotation.y π → 2π)
  useEffect(() => {
    if (!isFlipping || !cardRef.current) return;
    // Kill glow at flip start
    if (cardGlowMatRef.current) {
      gsap.to(cardGlowMatRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in' });
    }
    // Crossfade materials at flip midpoint: back fades out first, front fades in after
    if (cardBackMatRef.current) {
      gsap.to(cardBackMatRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
    if (cardDiamondMatRef.current) {
      gsap.to(cardDiamondMatRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
    if (cardMatRef.current) {
      gsap.to(cardMatRef.current, { opacity: 1, duration: 0.30, ease: 'power2.out', delay: 0.28 });
    }
    gsap.to(cardRef.current.rotation, {
      y: Math.PI * 2,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: onFlipComplete,
    });
  }, [isFlipping]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) {
      // Reset all elements to hidden (including Z + rotation so next open is clean)
      if (cardRef.current) gsap.killTweensOf(cardRef.current.rotation);
      if (tearLineGroupRef.current) { tearLineGroupRef.current.scale.x = 0; tearLineGroupRef.current.visible = false; }
      if (gapRef.current)   { gapRef.current.scale.y = 0; gapRef.current.visible = false; }
      if (flapRef.current)    flapRef.current.visible = false;
      if (bottomRef.current)  bottomRef.current.visible = false;
      if (bottomMatRef.current) bottomMatRef.current.opacity = 0;
      if (interiorLightRef.current) { gsap.killTweensOf(interiorLightRef.current); interiorLightRef.current.intensity = 0; }
      if (cardRef.current)  {
        cardRef.current.position.set(OPEN.packX, cardStartY, OPEN.packZ + 0.03);
        cardRef.current.rotation.y = Math.PI;  // back face toward camera for next open
        cardRef.current.visible = false;
      }
      if (cardMatRef.current)        cardMatRef.current.opacity = 0;
      if (cardBackMatRef.current)    cardBackMatRef.current.opacity = 0;
      if (cardGlowMatRef.current)    cardGlowMatRef.current.opacity = 0;
      if (cardDiamondMatRef.current) cardDiamondMatRef.current.opacity = 0;
      return;
    }

    // Set start state before animating
    if (tearLineGroupRef.current) { tearLineGroupRef.current.scale.x = 0; tearLineGroupRef.current.visible = true; }
    if (lineCoreMatRef.current)  lineCoreMatRef.current.opacity  = 0.95;
    if (lineHaloMatRef.current)  lineHaloMatRef.current.opacity  = 0.40;
    if (lineBloomMatRef.current) lineBloomMatRef.current.opacity = 0.18;
    if (gapRef.current)   { gapRef.current.scale.y = 0; gapRef.current.visible = false; }
    // Gap emissive: warm base tinted toward this pull's rarity color (Phase B
    // prep for the Phase E full rarity treatment). Black diffuse → only the
    // emissive shows, so the tint reads clean under any lighting.
    if (gapMatRef.current) {
      const tinted = new THREE.Color(TEAR.gapColor).lerp(new THREE.Color(RARITY[rarity].color), TEAR.rarityTint);
      gapMatRef.current.color.set('#000000');
      gapMatRef.current.emissive.copy(tinted);
      gapMatRef.current.opacity = 0.85;
    }
    if (flapRef.current)  {
      flapRef.current.position.set(OPEN.packX, flapCenterY, OPEN.packZ + 0.02);
      flapRef.current.rotation.set(0, 0, 0);
      flapRef.current.visible = false;
    }
    if (flapMatRef.current) flapMatRef.current.opacity = 1;
    if (bottomRef.current)  bottomRef.current.visible = true;
    if (bottomMatRef.current) bottomMatRef.current.opacity = 0;
    if (interiorLightRef.current) interiorLightRef.current.intensity = 0;
    if (cardRef.current)  {
      cardRef.current.position.set(OPEN.packX, cardStartY, OPEN.packZ + 0.03);
      cardRef.current.rotation.y = Math.PI;  // back face toward camera
      cardRef.current.visible = false;
    }
    if (cardMatRef.current)        cardMatRef.current.opacity = 0;
    if (cardBackMatRef.current)    cardBackMatRef.current.opacity = 0;
    if (cardGlowMatRef.current)    cardGlowMatRef.current.opacity = 0;
    if (cardDiamondMatRef.current) cardDiamondMatRef.current.opacity = 0;

    const tl = gsap.timeline({ onComplete });

    // Phase 1: tear line (core/halo/bloom) sweeps left→right as the crack forms (0–0.8 s)
    if (tearLineGroupRef.current) {
      tl.to(tearLineGroupRef.current.scale, { x: 1, duration: 0.8, ease: 'power2.inOut' }, 0);
    }

    // Phase 2: top flap flies off upper-right; the gap opens and light pours (0.8–1.3 s)
    tl.call(() => {
      if (flapRef.current) flapRef.current.visible = true;
      if (gapRef.current)  gapRef.current.visible  = true;
    }, [], 0.8);
    if (gapRef.current) {
      tl.to(gapRef.current.scale, { y: 1, duration: 0.4, ease: 'power2.out' }, 0.8);
    }
    // Top flap flicks off-screen with momentum and fades to nothing mid-flight,
    // like a torn scrap flung out of view. Far target + fast start (power2.out)
    // clears the frame within ~0.45 s; opacity is gone by ~1.18 s so it never
    // lingers at the top edge.
    if (flapRef.current) {
      tl.to(flapRef.current.position, { x: OPEN.packX + 2.6, y: flapCenterY + 3.4, duration: 0.45, ease: 'power2.out' }, 0.8);
      tl.to(flapRef.current.rotation, { z: -1.6, duration: 0.45, ease: 'power2.out' }, 0.8);
    }
    if (flapMatRef.current) {
      tl.to(flapMatRef.current, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 0.9);
    }

    // Tear line + gap fade out as the rising card covers the opening (1.3 s onward)
    const tearMats = [lineCoreMatRef.current, lineHaloMatRef.current, lineBloomMatRef.current, gapMatRef.current].filter(Boolean) as THREE.MeshStandardMaterial[];
    if (tearMats.length) {
      tl.to(tearMats, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.3);
    }

    // Phase A: interior light blooms as the flap separates (0.8 s), then
    // recedes as the card rises through the tear (1.3 s onward).
    if (interiorLightRef.current) {
      tl.to(interiorLightRef.current, { intensity: OPEN.interiorPeak, duration: 0.4, ease: 'power2.out' }, 0.8);
      tl.to(interiorLightRef.current, { intensity: 0,                 duration: 0.6, ease: 'power2.in'  }, 1.3);
    }

    // Phase 3: card slides up from pack showing its back face (1.3–2.0 s)
    tl.call(() => {
      if (cardRef.current) cardRef.current.visible = true;
    }, [], 1.3);
    if (cardRef.current) {
      tl.to(cardRef.current.position, { y: cardEndY, duration: 0.7, ease: 'power2.out' }, 1.3);
    }
    if (cardBackMatRef.current) {
      tl.to(cardBackMatRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.3);
    }
    if (cardDiamondMatRef.current) {
      tl.to(cardDiamondMatRef.current, { opacity: 0.9, duration: 0.4, ease: 'power2.out' }, 1.3);
    }

    return () => { tl.kill(); };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Phase A: pack lower half — remains as a pedestal after the top flap
          flies off. Hidden (opacity 0) until Phase D fades the real pack and
          hands off to this remnant; wired here so later phases can drive it. */}
      <mesh ref={bottomRef} position={[OPEN.packX, bottomCenterY, OPEN.packZ + 0.015]} visible={false}>
        <planeGeometry args={[S.packW, bottomH]} />
        <meshStandardMaterial
          ref={(el) => { bottomMatRef.current = el; }}
          color={S.packBody}
          metalness={S.packMetalness}
          roughness={S.packRoughness}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Phase B: emissive gap — the opening behind the tear where light pours.
          Grows in height (scale.y 0→1) as the flap separates. Warm base tinted
          toward the pull's rarity. Sits just behind the tear line, in front of
          the pack face + pedestal, behind the rising card. */}
      <mesh ref={gapRef} position={[OPEN.packX, OPEN.tearY, OPEN.packZ + 0.018]} scale={[1, 0, 1]} visible={false}>
        <planeGeometry args={[S.packW * 0.92, TEAR.gapH]} />
        <meshStandardMaterial
          ref={(el) => { gapMatRef.current = el; }}
          color="#000000"
          emissive={TEAR.gapColor}
          emissiveIntensity={TEAR.gapEmissive}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Phase B: 3-layer tear line — core (bright warm-white crack), halo, and
          bloom stacked so the crack reads as light bleeding through, not a flat
          bar. Group scales in X to sweep the crack open (0–0.8 s). */}
      <group ref={tearLineGroupRef} position={[OPEN.packX, OPEN.tearY, OPEN.packZ + 0.021]} scale={[0, 1, 1]} visible={false}>
        {/* bloom — widest, faintest */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[S.packW, 0.14]} />
          <meshStandardMaterial
            ref={(el) => { lineBloomMatRef.current = el; }}
            color="#000000" emissive={TEAR.glowColor} emissiveIntensity={TEAR.bloomEmissive}
            transparent opacity={0.18} depthWrite={false}
          />
        </mesh>
        {/* halo — mid */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[S.packW, 0.05]} />
          <meshStandardMaterial
            ref={(el) => { lineHaloMatRef.current = el; }}
            color="#000000" emissive={TEAR.glowColor} emissiveIntensity={TEAR.haloEmissive}
            transparent opacity={0.40} depthWrite={false}
          />
        </mesh>
        {/* core — thin bright crack */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[S.packW, 0.012]} />
          <meshStandardMaterial
            ref={(el) => { lineCoreMatRef.current = el; }}
            color="#000000" emissive={TEAR.coreColor} emissiveIntensity={TEAR.coreEmissive}
            transparent opacity={0.95} depthWrite={false}
          />
        </mesh>
      </group>

      {/* Phase 2: top flap */}
      <mesh ref={flapRef} position={[OPEN.packX, flapCenterY, OPEN.packZ + 0.02]} visible={false}>
        <planeGeometry args={[S.packW, OPEN.flapH]} />
        <meshStandardMaterial
          ref={(el) => { flapMatRef.current = el; }}
          color={S.packBody}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Phase 3+: card — starts back-facing (rotation.y = π), flips to front on tap */}
      <group ref={cardRef} position={[OPEN.packX, cardStartY, OPEN.packZ + 0.03]} rotation={[0, Math.PI, 0]} visible={false}>
        <Suspense fallback={null}>
          <CardMeshInner
            matRef={cardMatRef}
            backMatRef={cardBackMatRef}
            glowMatRef={cardGlowMatRef}
            diamondMatRef={cardDiamondMatRef}
            rarityColor={RARITY[rarity].color}
          />
        </Suspense>
      </group>

      {/* Card-reveal spotlight — tightly focused on card position */}
      <pointLight
        visible={active}
        position={[0, OPEN.packY + 1.4, OPEN.packZ + 2.8]}
        intensity={6.0}
        color="#FFF8F0"
        distance={5.5}
        decay={2}
      />

      {/* Phase A: interior light — sits at the tear and leaks warm light as the
          flap separates. Single added light, no shadows (context-loss safety).
          Local falloff (small distance + decay 2) keeps the background black. */}
      <pointLight
        ref={interiorLightRef}
        visible={active}
        position={[OPEN.packX, OPEN.tearY, OPEN.packZ + 0.05]}
        intensity={0}
        color={TEAR.glowColor}
        distance={2.2}
        decay={2}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────────────────────────
interface SceneProps {
  ringAngleRef:    React.MutableRefObject<number>;
  zoomT:           React.MutableRefObject<number>;
  resultT:         React.MutableRefObject<number>;
  selectedPackIdx: React.MutableRefObject<number>;
  mode:            'ring' | 'zoomed' | 'opening' | 'revealing' | 'flipping' | 'result';
  rarity:          RarityKey;
  onOpenComplete:  () => void;
  onFlipComplete:  () => void;
}

// Ring selection is lit brighter (product visible); as zoomT rises the lighting
// drops to the dark zoomed/opening values, keeping the "darkness → light" world
// for the opening sequence. No lights added (context-loss safety) — existing
// ambient + key are modulated in place.
function LightModulator({ zoomT, ambientRef, keyRef }: {
  zoomT:      React.MutableRefObject<number>;
  ambientRef: React.RefObject<THREE.AmbientLight | null>;
  keyRef:     React.RefObject<THREE.PointLight | null>;
}) {
  useFrame(() => {
    const t = zoomT.current;
    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(S.ringAmbient, S.ambientInt, t);
    if (keyRef.current)     keyRef.current.intensity     = THREE.MathUtils.lerp(S.ringKey,     S.keyInt,     t);
  });
  return null;
}

function Scene({ ringAngleRef, zoomT, resultT, selectedPackIdx, mode, rarity, onOpenComplete, onFlipComplete }: SceneProps) {
  const floorGroupRef    = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  const ambientRef       = useRef<THREE.AmbientLight>(null);
  const keyRef           = useRef<THREE.PointLight>(null);

  return (
    <>
      {/* Lights */}
      <ambientLight ref={ambientRef} intensity={S.ringAmbient} />

      {/* Key light — warm white, from above-front, illuminates the front pack */}
      <pointLight ref={keyRef} position={[0, 5, 4.5]} intensity={S.ringKey} color={S.keyColor} distance={16} decay={2} />

      {/* Ring↔zoom brightness modulation */}
      <LightModulator zoomT={zoomT} ambientRef={ambientRef} keyRef={keyRef} />

      {/* Fill light — soft blue from right side */}
      <pointLight position={[3, 3, 2]} intensity={S.fillInt} color={S.fillColor} distance={12} decay={2} />

      {/* Rim light — cool blue from behind-left, outlines the packs */}
      <pointLight position={[-3.5, 2, -1.5]} intensity={S.rimInt} color={S.rimColor} distance={10} decay={2} />

      {/* Metalness highlight lights — tight radius so only the pack glints, not the background */}
      <pointLight position={[0, 6, 3.5]} intensity={1.8} color="#E8F0FF" distance={8} decay={2.5} />
      <pointLight position={[1.8, 0.8, 4.5]} intensity={1.0} color="#FFF8F0" distance={6} decay={2.5} />

      {/* Floor */}
      <group ref={floorGroupRef}>
        <Floor />
      </group>

      {/* Particles */}
      <group ref={particleGroupRef}>
        <Particles />
      </group>

      {/* Pack ring */}
      <PackRing ringAngleRef={ringAngleRef} zoomT={zoomT} selectedPackIdx={selectedPackIdx} resultT={resultT} />

      {/* Opening sequence — tear line → flap → card → reveal → flip */}
      <OpeningSequence
        active={mode === 'opening' || mode === 'revealing' || mode === 'flipping' || mode === 'result'}
        onComplete={onOpenComplete}
        isRevealing={mode === 'revealing' || mode === 'flipping' || mode === 'result'}
        isFlipping={mode === 'flipping'}
        onFlipComplete={onFlipComplete}
        rarity={rarity}
      />

      {/* Camera + element fade (reads zoomT every frame) */}
      <ZoomController
        zoomT={zoomT}
        resultT={resultT}
        floorGroupRef={floorGroupRef}
        particleGroupRef={particleGroupRef}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root — event handling + Canvas + HTML overlay
// ─────────────────────────────────────────────────────────────────
export default function PackRingScene({
  rollRarity = 'rare',
  cardLabel,
  embed = false,
  onRevealDone,
  skipNonce = 0,
}: PackRingSceneProps = {}) {
  const [mode, setMode] = useState<'ring' | 'zoomed' | 'opening' | 'revealing' | 'flipping' | 'result'>('ring');
  const modeRef        = useRef<'ring' | 'zoomed' | 'opening' | 'revealing' | 'flipping' | 'result'>('ring');
  const [rarity, setRarity] = useState<RarityKey>(rollRarity);
  // Live front-pack index for the position dots (ring mode "more packs" hint)
  const [frontIdx, setFrontIdx] = useState<number>(0);
  const ringAngle      = useRef<number>(0);
  const velocity       = useRef<number>(0);
  const dragging       = useRef<boolean>(false);
  const lastX          = useRef<number>(0);
  const dragDist       = useRef<number>(0);
  const rafId          = useRef<number>(0);
  const zoomT          = useRef<number>(0);
  // Index of the pack chosen at tap time; frozen so it doesn't drift
  // during the zoom tween even if ringAngle changes slightly.
  const selectedPackIdx  = useRef<number>(0);
  // Ring angle at the moment of tap, restored on Back
  const savedRingAngle   = useRef<number>(0);
  // Drives camera pull-back + pack fade when card is revealed (0 = zoomed, 1 = result)
  const resultT          = useRef<number>(0);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    setRarity(rollRarity);
  }, [rollRarity]);

  useEffect(() => {
    if (skipNonce === 0) return;
    setRarity(rollRarity);
    resultT.current = 1;
    zoomT.current = 1;
    setMode('result');
    modeRef.current = 'result';
    onRevealDone?.();
  }, [skipNonce, rollRarity, onRevealDone]);

  const zoom = useCallback(() => {
    // Freeze the front-most pack index at the exact moment of tap.
    let best = 0, bestDf = -Infinity;
    for (let i = 0; i < S.packCount; i++) {
      const df = depthFactor(packAngle(i, ringAngle.current));
      if (df > bestDf) { bestDf = df; best = i; }
    }
    selectedPackIdx.current = best;

    // Calculate the ring angle that places the selected pack exactly at front (angle 0).
    // packAngle(best, ringAngle) = (2π*best/packCount) + ringAngle → must equal 0
    // → targetRingAngle = -(2π*best/packCount)
    // Take shortest path to avoid spinning a full rotation.
    const baseAngle  = (Math.PI * 2 * best) / S.packCount;
    const rawTarget  = -baseAngle;
    const cur        = ringAngle.current;
    let   diff       = (rawTarget - cur) % (Math.PI * 2);
    if (diff >  Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    const targetRingAngle = cur + diff;

    savedRingAngle.current = cur;  // save for Back restoration

    setMode('zoomed');
    modeRef.current = 'zoomed';
    velocity.current = 0;
    gsap.killTweensOf(zoomT);
    gsap.killTweensOf(ringAngle);
    gsap.to(zoomT,     { current: 1,               duration: S.zoomDur, ease: 'power2.out' });
    gsap.to(ringAngle, { current: targetRingAngle,  duration: 0.6,       ease: 'power2.out' });
  }, []);

  const unzoom = useCallback(() => {
    setMode('ring');
    modeRef.current = 'ring';
    gsap.killTweensOf(zoomT);
    gsap.killTweensOf(ringAngle);
    gsap.killTweensOf(resultT);
    resultT.current = 0;  // instant reset — going back to ring, no need to ease
    gsap.to(zoomT, {
      current: 0,
      duration: S.unzoomDur,
      ease: 'power2.inOut',
      // Hard-set to exactly 0 on completion so floating-point drift
      // never leaves non-front packs faintly invisible.
      onComplete: () => { zoomT.current = 0; },
    });
    // Restore ring to its original angle before the tap
    gsap.to(ringAngle, {
      current: savedRingAngle.current,
      duration: S.unzoomDur,
      ease: 'power2.inOut',
    });
  }, []);

  const startOpening = useCallback(() => {
    setRarity(rollRarity);
    setMode('opening');
    modeRef.current = 'opening';
  }, [rollRarity]);

  // Opening animation done → enter revealing (camera pulls back, glow activates)
  const setRevealingMode = useCallback(() => {
    setMode('revealing');
    modeRef.current = 'revealing';
    gsap.to(resultT, { current: 1, duration: 0.6, ease: 'power2.inOut' });
  }, []);

  // User taps in revealing → flip begins
  const setFlippingMode = useCallback(() => {
    setMode('flipping');
    modeRef.current = 'flipping';
  }, []);

  // Flip complete → result (resultT already 1)
  const setResultMode = useCallback(() => {
    setMode('result');
    modeRef.current = 'result';
  }, []);

  // Inertia loop outside R3F — only runs when in ring mode
  const inertiaLoop = useCallback(() => {
    if (!dragging.current && modeRef.current === 'ring') {
      velocity.current *= S.inertiaDamp;
      ringAngle.current += velocity.current;
    }
    // Track which pack is centered so the dots can highlight it. Functional
    // update returns prev when unchanged → React bails out, no wasted renders.
    const step = (Math.PI * 2) / S.packCount;
    const idx  = ((Math.round(-ringAngle.current / step) % S.packCount) + S.packCount) % S.packCount;
    setFrontIdx((prev) => (prev === idx ? prev : idx));
    rafId.current = requestAnimationFrame(inertiaLoop);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(inertiaLoop);
    return () => cancelAnimationFrame(rafId.current);
  }, [inertiaLoop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (modeRef.current === 'opening' || modeRef.current === 'flipping') return;
    dragging.current = true;
    lastX.current    = e.clientX;
    velocity.current = 0;
    dragDist.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || modeRef.current !== 'ring') return;
    const dx = e.clientX - lastX.current;
    dragDist.current  += Math.abs(dx);
    velocity.current   = dx * S.swipeSens;
    ringAngle.current += velocity.current;
    lastX.current      = e.clientX;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragDist.current < S.tapThreshold) {
      if      (modeRef.current === 'ring')      zoom();
      else if (modeRef.current === 'zoomed')    startOpening();
      else if (modeRef.current === 'revealing') setFlippingMode();
      else if (modeRef.current === 'result') {
        if (embed || onRevealDone) onRevealDone?.();
        else unzoom();
      }
    }
  }, [zoom, startOpening, setFlippingMode, unzoom, embed, onRevealDone]);

  return (
    <div
      style={{
        width: '100%', height: '100%',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Gradient background (visible through transparent Canvas) */}
      <div style={{ position: 'absolute', inset: 0, background: S.bgGrad }} />

      {/* Zoom overlay — fades in over gradient */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: S.bgZoomed,
          opacity: mode !== 'ring' ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Center glow — subtle elliptical halo behind subject, always visible */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 58% 42% at 50% 44%, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.01) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Canvas — transparent background */}
      <Canvas
        camera={{ position: [0, S.camY, S.camZ], fov: S.camFov, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        dpr={[1, 1.25]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Scene ringAngleRef={ringAngle} zoomT={zoomT} resultT={resultT} selectedPackIdx={selectedPackIdx} mode={mode} rarity={rarity} onOpenComplete={setRevealingMode} onFlipComplete={setResultMode} />
      </Canvas>

      {/* Rarity banner — above Canvas so text is always visible over the card back */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: 52,
          background: `linear-gradient(90deg, transparent 0%, ${RARITY[rarity].color}E8 12%, ${RARITY[rarity].color} 50%, ${RARITY[rarity].color}E8 88%, transparent 100%)`,
          transform: 'translateY(-50%) rotate(-12deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: mode === 'revealing' ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 6,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: '0.32em',
            fontFamily: '-apple-system, system-ui, sans-serif',
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          }}
        >
          {RARITY[rarity].label}
        </span>
      </div>

      {/* Rarity badge — fades in under card after flip completes */}
      {mode !== 'ring' && (
        <div
          style={{
            position: 'absolute',
            top: '67%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: RARITY[rarity].color,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.22em',
            padding: '5px 18px',
            borderRadius: 999,
            fontFamily: '-apple-system, system-ui, sans-serif',
            pointerEvents: 'none',
            zIndex: 12,
            opacity: mode === 'result' ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {RARITY[rarity].label}
        </div>
      )}

      {/* Back button — zoomed / opening / result (sandbox only) */}
      {mode !== 'ring' && !embed && (
        <button
          onClick={unzoom}
          style={{
            position: 'absolute',
            top: 20, left: 20, zIndex: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            color: 'rgba(255,255,255,0.75)',
            fontSize: 13,
            padding: '8px 18px',
            cursor: 'pointer',
            fontFamily: '-apple-system, system-ui, sans-serif',
            letterSpacing: '0.04em',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← Back
        </button>
      )}

      {/* Position dots — "more packs" hint (ring mode only). Neighbor packs
          can't peek on portrait; these show which of the packs is centered. */}
      {mode === 'ring' && (
        <div
          style={{
            position: 'absolute',
            bottom: 76, left: 0, width: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            zIndex: 10, pointerEvents: 'none',
          }}
        >
          {Array.from({ length: S.packCount }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === frontIdx ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === frontIdx ? 'rgba(201,169,110,0.9)' : 'rgba(255,255,255,0.20)',
                transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom label */}
      <p
        style={{
          position: 'absolute',
          bottom: 44, margin: 0,
          width: '100%',
          textAlign: 'center',
          color: (mode === 'zoomed' || mode === 'revealing' || mode === 'result') ? 'rgba(201,169,110,0.72)' : 'rgba(255,255,255,0.26)',
          fontSize: 12,
          letterSpacing: '0.20em',
          fontFamily: '-apple-system, system-ui, sans-serif',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'color 0.35s ease',
        }}
      >
        {mode === 'zoomed'
          ? 'TAP TO OPEN'
          : mode === 'revealing'
          ? 'TAP TO REVEAL'
          : mode === 'flipping' || mode === 'opening'
          ? ''
          : mode === 'result'
          ? 'TAP TO CONTINUE'
          : 'SWIPE TO BROWSE'}
      </p>
    </div>
  );
}
