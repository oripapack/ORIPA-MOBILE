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

  // Floor — sharper reflection, darker base
  floorSize:        40,
  floorColor:       '#050508',
  floorBlur:        [80, 30] as [number, number],  // less blur = crisper reflection
  floorMixStrength: 20,
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
  ringRadius:   3.1,
  packY:        0.56,
  entryFromY:  -4.2,
  entryStagger: 0.10,

  // Depth illusion (ring mode)
  minDepthScale:   0.52,
  minDepthOpacity: 0.25,

  // Camera — ring mode
  camY:   1.20,
  camZ:   6.60,
  camFov: 42,
  camLAY: 0.0,   // lookAt Y
  camLAZ: 0.0,   // lookAt Z

  // Camera — zoomed mode
  camYZ:   0.72,
  camZZ:   4.85,
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

  // Lighting — low ambient keeps background black; key dominates center
  ambientInt:  0.06,
  keyColor:    '#FFF8F0',
  keyInt:      4.5,
  fillColor:   '#A0C0E8',
  fillInt:     0.18,
  rimColor:    '#6888B0',
  rimInt:      0.28,

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

      // XZ only — GSAP owns Y
      g.position.x = S.ringRadius * Math.sin(angle);
      g.position.z = S.ringRadius * Math.cos(angle);

      // Rotation + idle sway: ring mode only, fades to 0 on selected pack as zoom increases
      const isSelected = i === selectedPackIdx.current;
      const idleScale  = isSelected ? (1 - t) : (isFront ? 1 : 0);
      const idle       = Math.sin(idleTime.current * S.idleSpeed) * S.idleAmp * idleScale;
      g.rotation.y     = angle + idle;

      // Scale by ring depth
      g.scale.setScalar(S.minDepthScale + df * (1 - S.minDepthScale));

      // Opacity: ring depth-based → selected-only when zoomed
      // Use selectedPackIdx (frozen at tap time) so the chosen pack stays
      // visible throughout the entire zoom transition, regardless of any
      // tiny ringAngle drift that might change frontIdx mid-tween.
      const ringOp    = S.minDepthOpacity + df * (1 - S.minDepthOpacity);
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

          {/* Art area placeholder */}
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

    // Ring → zoomed lerp
    const zY   = THREE.MathUtils.lerp(S.camY,   S.camYZ,   t);
    const zZ   = THREE.MathUtils.lerp(S.camZ,   S.camZZ,   t);
    const zFov = THREE.MathUtils.lerp(S.camFov, S.camFovZ, t);
    const zLAY = THREE.MathUtils.lerp(S.camLAY, S.camLAYZ, t);
    const zLAZ = THREE.MathUtils.lerp(S.camLAZ, S.camLAZZ, t);

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

    const cam = camera as THREE.PerspectiveCamera;
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
  // charizard.jpg is 800×1350 px (height/width = 1.6875) — test asset, replace before launch
  cardW:   1.1,
  cardH:   1.1 * (1350 / 800),  // ≈ 1.856 — matches image aspect ratio, no distortion
  resultY: 0.56,                  // card Y in result mode (camera lookAt height)
  resultZ: 4.2,                   // card Z in result mode (pulled toward camera)
} as const;

// ─────────────────────────────────────────────────────────────────
// Rarity system — 5 tiers
// In production, rarity is determined server-side before the pack is opened.
// Client only receives and displays the result.
// ─────────────────────────────────────────────────────────────────
type RarityKey = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const RARITY: Record<RarityKey, { color: string; label: string }> = {
  common:    { color: '#9CA3AF', label: 'COMMON'          },
  rare:      { color: '#3B82F6', label: 'RARE'            },
  epic:      { color: '#A855F7', label: 'EPIC PULL'       },
  legendary: { color: '#F59E0B', label: 'LEGENDARY PULL'  },
  mythic:    { color: '#EF4444', label: 'MYTHIC PULL'     },
};

const RARITY_KEYS: RarityKey[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

// Placeholder until server-side rarity assignment is in place
function pickRandomRarity(): RarityKey {
  return RARITY_KEYS[Math.floor(Math.random() * RARITY_KEYS.length)];
}

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

      {/* Back face: near-black, matte — no metalness to avoid lavender sheen from scene lights */}
      <mesh position={[0, 0, -0.003]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[OPEN.cardW, OPEN.cardH]} />
        <meshStandardMaterial
          ref={(el) => { backMatRef.current = el; }}
          color="#080810"
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Rarity diamond mark — small placeholder in center of back face */}
      <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, Math.PI / 4]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshStandardMaterial
          ref={(el) => { diamondMatRef.current = el; }}
          color={rarityColor}
          emissive={rarityColor}
          emissiveIntensity={1.2}
          roughness={0.3}
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
  const lineRef        = useRef<THREE.Mesh>(null);
  const flapRef        = useRef<THREE.Mesh>(null);
  const cardRef        = useRef<THREE.Group>(null);
  const flapMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardBackMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardGlowMatRef     = useRef<THREE.MeshStandardMaterial | null>(null);
  const cardDiamondMatRef  = useRef<THREE.MeshStandardMaterial | null>(null);

  const flapCenterY = OPEN.tearY + OPEN.flapH * 0.5;
  const cardStartY  = OPEN.packY - 0.3;
  const cardEndY    = OPEN.packY + 0.55;

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
      if (lineRef.current)  { lineRef.current.scale.x = 0; lineRef.current.visible = false; }
      if (flapRef.current)    flapRef.current.visible = false;
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
    if (lineRef.current)  { lineRef.current.scale.x = 0; lineRef.current.visible = true; }
    if (flapRef.current)  {
      flapRef.current.position.set(OPEN.packX, flapCenterY, OPEN.packZ + 0.02);
      flapRef.current.rotation.set(0, 0, 0);
      flapRef.current.visible = false;
    }
    if (flapMatRef.current) flapMatRef.current.opacity = 1;
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

    // Phase 1: tear line sweeps left→right (0–0.8 s)
    if (lineRef.current) {
      tl.to(lineRef.current.scale, { x: 1, duration: 0.8, ease: 'power2.inOut' }, 0);
    }

    // Phase 2: top flap flies off upper-right (0.8–1.3 s)
    tl.call(() => {
      if (flapRef.current) flapRef.current.visible = true;
      if (lineRef.current) lineRef.current.visible = false;
    }, [], 0.8);
    if (flapRef.current) {
      tl.to(flapRef.current.position, { x: OPEN.packX + 0.9, y: flapCenterY + 1.1, duration: 0.5, ease: 'power2.out' }, 0.8);
      tl.to(flapRef.current.rotation, { z: -0.7, duration: 0.5, ease: 'power2.out' }, 0.8);
    }
    if (flapMatRef.current) {
      tl.to(flapMatRef.current, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.95);
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
      {/* Phase 1: tear line */}
      <mesh ref={lineRef} position={[OPEN.packX, OPEN.tearY, OPEN.packZ + 0.02]} scale={[0, 1, 1]} visible={false}>
        <planeGeometry args={[S.packW, 0.012]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={2.0} transparent opacity={0.9} depthWrite={false} />
      </mesh>

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

function Scene({ ringAngleRef, zoomT, resultT, selectedPackIdx, mode, rarity, onOpenComplete, onFlipComplete }: SceneProps) {
  const floorGroupRef    = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={S.ambientInt} />

      {/* Key light — warm white, from above-front, illuminates the front pack */}
      <pointLight position={[0, 5, 4.5]} intensity={S.keyInt} color={S.keyColor} distance={16} decay={2} />

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
export default function PackRingScene() {
  const [mode, setMode] = useState<'ring' | 'zoomed' | 'opening' | 'revealing' | 'flipping' | 'result'>('ring');
  const modeRef        = useRef<'ring' | 'zoomed' | 'opening' | 'revealing' | 'flipping' | 'result'>('ring');
  const [rarity, setRarity] = useState<RarityKey>('common');
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
    // In production, rarity is determined server-side; here we pick randomly for testing
    setRarity(pickRandomRarity());
    setMode('opening');
    modeRef.current = 'opening';
  }, [setRarity]);

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
      else if (modeRef.current === 'result')    unzoom();
    }
  }, [zoom, startOpening, setFlippingMode, unzoom]);

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

      {/* Back button — zoomed / opening / result */}
      {mode !== 'ring' && (
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
          : 'SWIPE TEST 123'}
      </p>
    </div>
  );
}
