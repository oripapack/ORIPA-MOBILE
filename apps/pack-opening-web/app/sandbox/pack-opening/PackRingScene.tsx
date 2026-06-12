'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, Environment } from '@react-three/drei';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ─────────────────────────────────────────────────────────────────
// Scene constants — all tunable values live here
// ─────────────────────────────────────────────────────────────────
const S = {
  // CSS backgrounds
  bgGrad:   'linear-gradient(to bottom, #1A1A1E 0%, #0A0A0C 100%)',
  bgZoomed: '#111116',   // solid charcoal when zoomed

  // Floor
  floorSize:        40,
  floorColor:       '#0C0C10',
  floorBlur:        [400, 100] as [number, number],
  floorMixStrength: 50,
  floorMirror:      0.70,
  floorDepthScale:  0.80,

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

  // Lighting — key: warm white from above-front; fill: soft blue from side; rim: blue-cool from behind
  ambientInt:  0.25,
  keyColor:    '#FFF5E0',
  keyInt:      3.8,
  fillColor:   '#A0C0E8',
  fillInt:     0.65,
  rimColor:    '#6888B0',
  rimInt:      0.70,

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

  const geoRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    geoRef.current?.setAttribute('position', new THREE.BufferAttribute(posArr.slice(), 3));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    const attr = geoRef.current?.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const a = attr.array as Float32Array;
    for (let i = 0; i < S.particleCount; i++) {
      a[i * 3 + 1] += S.particleSpeed * speeds[i];
      if (a[i * 3 + 1] > S.particleMaxY) a[i * 3 + 1] = S.particleMinY;
    }
    attr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef} />
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
  ringAngleRef: React.MutableRefObject<number>;
  zoomT: React.MutableRefObject<number>;
}

function PackRing({ ringAngleRef, zoomT }: PackRingProps) {
  const groups   = useRef<THREE.Group[]>([]);
  const bodyMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const brdMats  = useRef<THREE.MeshStandardMaterial[]>([]);
  const idleTime = useRef(0);
  const frontIdx = useRef(0);

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

      // Rotation + idle sway (front pack only)
      const idle = isFront ? Math.sin(idleTime.current * S.idleSpeed) * S.idleAmp : 0;
      g.rotation.y = angle + idle;

      // Scale by ring depth
      g.scale.setScalar(S.minDepthScale + df * (1 - S.minDepthScale));

      // Opacity: ring depth-based → front-only when zoomed
      const ringOp = S.minDepthOpacity + df * (1 - S.minDepthOpacity);
      const zoomOp = isFront ? 1.0 : 0.0;
      const op = THREE.MathUtils.lerp(ringOp, zoomOp, t);

      const bm = bodyMats.current[i];
      const bd = brdMats.current[i];
      if (bm) bm.opacity = op;
      if (bd) bd.opacity = op;
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
            <meshStandardMaterial color="#242432" roughness={0.88} transparent opacity={0.94} />
          </mesh>

          {/* Header stripe */}
          <mesh position={[0, S.packH * 0.40, S.packDepth * 0.9]}>
            <planeGeometry args={[S.packW * 0.80, S.packH * 0.075]} />
            <meshStandardMaterial
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
  floorGroupRef:     React.RefObject<THREE.Group | null>;
  particleGroupRef:  React.RefObject<THREE.Group | null>;
}

function ZoomController({ zoomT, floorGroupRef, particleGroupRef }: ZoomControllerProps) {
  const { camera } = useThree();

  useFrame(() => {
    const t = zoomT.current;

    // Camera position
    camera.position.set(
      0,
      THREE.MathUtils.lerp(S.camY,   S.camYZ,   t),
      THREE.MathUtils.lerp(S.camZ,   S.camZZ,   t),
    );

    // Camera lookAt
    camera.lookAt(
      0,
      THREE.MathUtils.lerp(S.camLAY, S.camLAYZ, t),
      THREE.MathUtils.lerp(S.camLAZ, S.camLAZZ, t),
    );

    // Fov
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(S.camFov, S.camFovZ, t);
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
// Scene
// ─────────────────────────────────────────────────────────────────
interface SceneProps {
  ringAngleRef: React.MutableRefObject<number>;
  zoomT:        React.MutableRefObject<number>;
}

function Scene({ ringAngleRef, zoomT }: SceneProps) {
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

      {/* Environment — drives metalness/roughness reflections on PBR materials */}
      <Environment preset="city" environmentIntensity={S.envInt} />

      {/* Floor */}
      <group ref={floorGroupRef}>
        <Floor />
      </group>

      {/* Particles */}
      <group ref={particleGroupRef}>
        <Particles />
      </group>

      {/* Pack ring */}
      <PackRing ringAngleRef={ringAngleRef} zoomT={zoomT} />

      {/* Camera + element fade (reads zoomT every frame) */}
      <ZoomController
        zoomT={zoomT}
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
  const [mode, setMode] = useState<'ring' | 'zoomed'>('ring');
  const modeRef   = useRef<'ring' | 'zoomed'>('ring');
  const ringAngle = useRef<number>(0);
  const velocity  = useRef<number>(0);
  const dragging  = useRef<boolean>(false);
  const lastX     = useRef<number>(0);
  const dragDist  = useRef<number>(0);
  const rafId     = useRef<number>(0);
  const zoomT     = useRef<number>(0);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const zoom = useCallback(() => {
    setMode('zoomed');
    modeRef.current = 'zoomed';
    velocity.current = 0;
    gsap.killTweensOf(zoomT);
    gsap.to(zoomT, { current: 1, duration: S.zoomDur, ease: 'power2.out' });
  }, []);

  const unzoom = useCallback(() => {
    setMode('ring');
    modeRef.current = 'ring';
    gsap.killTweensOf(zoomT);
    gsap.to(zoomT, { current: 0, duration: S.unzoomDur, ease: 'power2.inOut' });
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
    if (modeRef.current === 'zoomed') return;
    dragging.current = true;
    lastX.current    = e.clientX;
    velocity.current = 0;
    dragDist.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || modeRef.current === 'zoomed') return;
    const dx = e.clientX - lastX.current;
    dragDist.current  += Math.abs(dx);
    velocity.current   = dx * S.swipeSens;
    ringAngle.current += velocity.current;
    lastX.current      = e.clientX;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    // Small drag = tap → zoom in
    if (dragDist.current < S.tapThreshold && modeRef.current === 'ring') {
      zoom();
    }
  }, [zoom]);

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
          opacity: mode === 'zoomed' ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Canvas — transparent background */}
      <Canvas
        camera={{ position: [0, S.camY, S.camZ], fov: S.camFov, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Scene ringAngleRef={ringAngle} zoomT={zoomT} />
      </Canvas>

      {/* Back button — zoomed only */}
      {mode === 'zoomed' && (
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
          color: mode === 'zoomed' ? 'rgba(201,169,110,0.72)' : 'rgba(255,255,255,0.26)',
          fontSize: 12,
          letterSpacing: '0.20em',
          fontFamily: '-apple-system, system-ui, sans-serif',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'color 0.35s ease',
        }}
      >
        {mode === 'zoomed' ? 'TAP TO OPEN' : 'SWIPE TO BROWSE'}
      </p>
    </div>
  );
}
