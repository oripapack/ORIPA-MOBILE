'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ─────────────────────────────────────────────────────────────────
// Scene constants — all tunable values live here
// ─────────────────────────────────────────────────────────────────
const S = {
  // Background gradient stops (CSS behind Canvas)
  bgTop:    '#1A1A1E',
  bgBottom: '#0A0A0C',

  // Floor
  floorSize:       40,
  floorColor:      '#080808',
  floorBlur:       [280, 80] as [number, number],
  floorMixStrength: 20,
  floorDepthScale: 0.55,
  floorMirror:     0.55,

  // Gold particles
  particleColor:   '#C9A96E',
  particleCount:   15,
  particleSize:    0.034,
  particleSpeed:   0.005,
  particleSpread:  4.0,
  particleMinY:   -0.5,
  particleMaxY:    4.5,

  // Pack placeholder (poker-card aspect 63:88, slightly deeper for physical feel)
  packW:           0.68,
  packH:           0.95,
  packDepth:       0.014,
  packBody:        '#1A1A22',
  packBorder:      '#C9A96E',
  packBorderPad:   0.020,

  // Ring layout
  packCount:       8,
  ringRadius:      3.1,
  packY:           0.56,     // height above floor (after entry)
  entryFromY:     -4.2,     // start below floor

  // Depth illusion: front=1, back=minScale
  minDepthScale:   0.52,
  minDepthOpacity: 0.25,

  // Camera
  camY:  1.20,
  camZ:  6.60,
  camFov: 42,

  // Entry animation (GSAP)
  entryDuration:  1.5,
  packStagger:    0.10,    // seconds between packs

  // Idle motion (front pack only) ±3 degrees
  idleAmplitude:  (3 * Math.PI) / 180,
  idleSpeed:      0.55,

  // Swipe / drag
  swipeSensitivity: 0.0028,
  inertiaDamping:   0.91,

  // Lighting
  ambientIntensity:   0.55,
  fillColor:          '#B8C4E0',
  fillIntensity:      0.48,
  rimColor:           '#C9A96E',
  rimIntensity:       0.28,
} as const;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function packAngle(index: number, ringOffset: number): number {
  return (Math.PI * 2 * index) / S.packCount + ringOffset;
}

/** 0 = back-most, 1 = front-most */
function depthFactor(angle: number): number {
  return (Math.cos(angle) + 1) / 2;
}

// ─────────────────────────────────────────────────────────────────
// Floating gold particles
// ─────────────────────────────────────────────────────────────────
function Particles() {
  const posArr = useMemo(() => {
    const arr = new Float32Array(S.particleCount * 3);
    for (let i = 0; i < S.particleCount; i++) {
      const r = Math.random() * S.particleSpread;
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3 + 0] = r * Math.cos(theta);
      arr[i * 3 + 1] = S.particleMinY + Math.random() * (S.particleMaxY - S.particleMinY);
      arr[i * 3 + 2] = r * Math.sin(theta) - 1.5;
    }
    return arr;
  }, []);

  const speedArr = useMemo(() => {
    const arr = new Float32Array(S.particleCount);
    for (let i = 0; i < S.particleCount; i++) arr[i] = 0.6 + Math.random() * 0.8;
    return arr;
  }, []);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  // initialise geometry attribute once
  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.setAttribute(
      'position',
      new THREE.BufferAttribute(posArr.slice(), 3),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (!geoRef.current) return;
    const attr = geoRef.current.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < S.particleCount; i++) {
      arr[i * 3 + 1] += S.particleSpeed * speedArr[i];
      if (arr[i * 3 + 1] > S.particleMaxY) arr[i * 3 + 1] = S.particleMinY;
    }
    attr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial
        ref={matRef}
        color={S.particleColor}
        size={S.particleSize}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reflective floor
// ─────────────────────────────────────────────────────────────────
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[S.floorSize, S.floorSize]} />
      <MeshReflectorMaterial
        blur={S.floorBlur}
        resolution={512}
        mixBlur={1.2}
        mixStrength={S.floorMixStrength}
        roughness={1}
        depthScale={S.floorDepthScale}
        minDepthThreshold={0.25}
        maxDepthThreshold={1.0}
        color={S.floorColor}
        metalness={0.5}
        mirror={S.floorMirror as 0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pack ring — layout + animation
// ─────────────────────────────────────────────────────────────────
interface PackRingProps {
  ringAngleRef: React.MutableRefObject<number>;
}

function PackRing({ ringAngleRef }: PackRingProps) {
  // Mutable arrays — filled via callback refs as meshes mount
  const groupArr   = useRef<THREE.Group[]>([]);
  const bodyArr    = useRef<THREE.MeshStandardMaterial[]>([]);
  const borderArr  = useRef<THREE.MeshStandardMaterial[]>([]);
  const idleTime   = useRef(0);
  const entryDone  = useRef(false);

  // Entry animation: wait one frame for R3F to mount all meshes, then run GSAP
  useEffect(() => {
    const id = setTimeout(() => {
      groupArr.current.forEach((g, i) => {
        const angle = packAngle(i, 0);
        g.position.set(
          S.ringRadius * Math.sin(angle),
          S.entryFromY,
          S.ringRadius * Math.cos(angle),
        );
        g.rotation.y = angle;
        g.scale.setScalar(S.minDepthScale);
      });

      groupArr.current.forEach((g, i) => {
        gsap.to(g.position, {
          y: S.packY,
          duration: 0.78,
          delay: i * S.packStagger,
          ease: 'back.out(1.3)',
          onComplete: i === S.packCount - 1 ? () => { entryDone.current = true; } : undefined,
        });
      });
    }, 40);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    idleTime.current += delta;
    const ringOff = ringAngleRef.current;

    groupArr.current.forEach((g, i) => {
      const angle = packAngle(i, ringOff);
      const df = depthFactor(angle);

      // XZ: ring rotation (never touch Y — GSAP owns it)
      g.position.x = S.ringRadius * Math.sin(angle);
      g.position.z = S.ringRadius * Math.cos(angle);

      // Rotation: face outward + idle sway for front pack
      const isFront = i === 0;
      const idle = isFront
        ? Math.sin(idleTime.current * S.idleSpeed) * S.idleAmplitude
        : 0;
      g.rotation.y = angle + idle;

      // Scale / opacity depth falloff
      const scale = S.minDepthScale + df * (1 - S.minDepthScale);
      g.scale.setScalar(scale);

      const opacity = S.minDepthOpacity + df * (1 - S.minDepthOpacity);
      const bm = bodyArr.current[i];
      const bd = borderArr.current[i];
      if (bm) bm.opacity = opacity;
      if (bd) bd.opacity = opacity;
    });
  });

  return (
    <>
      {Array.from({ length: S.packCount }, (_, i) => (
        <group
          key={i}
          ref={(el) => { if (el) groupArr.current[i] = el; }}
        >
          {/* Gold border frame */}
          <mesh>
            <boxGeometry
              args={[
                S.packW + S.packBorderPad * 2,
                S.packH + S.packBorderPad * 2,
                S.packDepth,
              ]}
            />
            <meshStandardMaterial
              ref={(el) => { if (el) borderArr.current[i] = el as THREE.MeshStandardMaterial; }}
              color={S.packBorder}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={1}
              emissive={new THREE.Color(S.packBorder)}
              emissiveIntensity={0.06}
            />
          </mesh>

          {/* Dark body */}
          <mesh position-z={S.packDepth * 0.35}>
            <boxGeometry args={[S.packW, S.packH, S.packDepth]} />
            <meshStandardMaterial
              ref={(el) => { if (el) bodyArr.current[i] = el as THREE.MeshStandardMaterial; }}
              color={S.packBody}
              metalness={0.35}
              roughness={0.55}
              transparent
              opacity={1}
            />
          </mesh>

          {/* Art area placeholder */}
          <mesh position={[0, 0.06, S.packDepth * 0.9]}>
            <planeGeometry args={[S.packW * 0.80, S.packH * 0.52]} />
            <meshStandardMaterial
              color="#242430"
              roughness={0.85}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Category header stripe */}
          <mesh position={[0, S.packH * 0.40, S.packDepth * 0.9]}>
            <planeGeometry args={[S.packW * 0.80, S.packH * 0.075]} />
            <meshStandardMaterial
              color={S.packBorder}
              metalness={0.75}
              roughness={0.25}
              transparent
              opacity={0.50}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Scene — lights + floor + particles + ring
// ─────────────────────────────────────────────────────────────────
interface SceneProps {
  ringAngleRef: React.MutableRefObject<number>;
}

function Scene({ ringAngleRef }: SceneProps) {
  return (
    <>
      <ambientLight intensity={S.ambientIntensity} />
      <directionalLight position={[0, 6, 5]} intensity={S.fillIntensity} color={S.fillColor} />
      <pointLight position={[-4, 3, 1.5]} intensity={S.rimIntensity} color={S.rimColor} />

      <Floor />
      <Particles />
      <PackRing ringAngleRef={ringAngleRef} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root export — event handling + Canvas
// ─────────────────────────────────────────────────────────────────
export default function PackRingScene() {
  const ringAngle  = useRef<number>(0);
  const velocity   = useRef<number>(0);
  const dragging   = useRef<boolean>(false);
  const lastX      = useRef<number>(0);
  const rafId      = useRef<number>(0);

  // Inertia loop runs outside R3F
  const inertiaLoop = useCallback(() => {
    if (!dragging.current) {
      velocity.current *= S.inertiaDamping;
      ringAngle.current += velocity.current;
    }
    rafId.current = requestAnimationFrame(inertiaLoop);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(inertiaLoop);
    return () => cancelAnimationFrame(rafId.current);
  }, [inertiaLoop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current    = e.clientX;
    velocity.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    velocity.current  = dx * S.swipeSensitivity;
    ringAngle.current += velocity.current;
    lastX.current     = e.clientX;
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(to bottom, ${S.bgTop} 0%, ${S.bgBottom} 100%)`,
        touchAction: 'none',
        userSelect: 'none',
        position: 'relative',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        camera={{ position: [0, S.camY, S.camZ], fov: S.camFov, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene ringAngleRef={ringAngle} />
      </Canvas>

      {/* Hint */}
      <p
        style={{
          position: 'absolute',
          bottom: 44,
          margin: 0,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.24)',
          fontSize: 11,
          letterSpacing: '0.18em',
          fontFamily: '-apple-system, system-ui, sans-serif',
          pointerEvents: 'none',
        }}
      >
        SWIPE TO BROWSE
      </p>
    </div>
  );
}
