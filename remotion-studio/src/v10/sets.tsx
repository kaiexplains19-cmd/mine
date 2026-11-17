import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AmberLights, Acacia, Cam, Crowd, Fire, Ground, Helix, Person, PersonProps, Pine, Rain, Rock, Shelter, Stars, Torch, V3, clamp, ease, lerp, rand} from '../v01/kit';

export type ShotArgs = {t: number; d: number; k: number; who: string; cam: string; v?: string};

/* ---------- cast (you are the Neanderthal) ---------- */
const RIM = '#9a6230';
const YOU: PersonProps = {kind: 'modern', outfit: '#f07a2a', sleeve: '#e06a20', outline: RIM};
const BRO: PersonProps = {kind: 'neander', outfit: '#5a4030', trim: '#2e1c10', outline: RIM};
const GRAN: PersonProps = {kind: 'elder', outfit: '#5a4a3a', trim: '#8a7a5a', outline: RIM};
const KID: PersonProps = {kind: 'child', outfit: '#8a5a34', trim: '#4a2e14', s: 0.62, outline: RIM};
const AMA: PersonProps = {kind: 'adult', outfit: '#b0562a', trim: '#5a2e14', outline: RIM};
const MAN: PersonProps = {kind: 'adult', outfit: '#8a6a3a', trim: '#4a3018', outline: RIM};
const SCI: PersonProps = {kind: 'modern', outfit: '#e4e6ee'};

/* head position of a placed person (for close-ups) */
const head = (pos: V3, s = 1, sit = false): V3 => [pos[0], pos[1] + ((sit ? 0.42 : 0.95) + 1.18) * s, pos[2]];

/* ---------- generic camera presets ---------- */
const Camera: React.FC<{cam: string; t: number; d: number; focus: V3; anchors: Record<string, V3>; who: string; spread?: number; faces?: Record<string, number>}> = ({cam, t, d, focus, anchors, who, spread = 1, faces}) => {
  const p = t / d;
  const key = anchors[who] ? who : 'YOU';
  const H = anchors[who] ?? anchors.YOU ?? [focus[0], focus[1] + 1.8, focus[2]];
  const F = focus;
  const S = spread;
  const ry = faces ? faces[key] ?? (key === 'N' ? faces.YOU : undefined) : undefined;
  if (ry !== undefined && (cam === 'close' || cam === 'ots')) {
    /* face-aware: camera sits in front of the face the character is actually turned to, slightly off-axis */
    const dx = Math.sin(ry), dz = Math.cos(ry), px = Math.cos(ry), pz = -Math.sin(ry);
    const D0 = cam === 'close' ? 2.45 : 3.0, D1 = cam === 'close' ? 2.15 : 2.6, o = cam === 'close' ? 0.6 : 1.1;
    const at = (D: number, oo: number, up: number): V3 => [H[0] + dx * D + px * oo, H[1] + up, H[2] + dz * D + pz * oo];
    return <Cam p={p} t={t} from={at(D0, o, 0.12)} to={at(D1, o * 0.8, 0.08)} look={[H[0], H[1] - (cam === 'close' ? 0.08 : 0.3), H[2]]} fov={cam === 'close' ? 36 : 38} />;
  }
  switch (cam) {
    case 'close': {
      const side = H[0] >= F[0] ? -1 : 1;
      return <Cam p={p} t={t} from={[H[0] + side * 0.55, H[1] + 0.05, H[2] + 1.75]} to={[H[0] + side * 0.45, H[1] + 0.02, H[2] + 1.45]} look={[H[0], H[1] - 0.05, H[2]]} fov={34} />;
    }
    case 'ots': {
      const side = H[0] >= F[0] ? -1 : 1;
      return <Cam p={p} t={t} from={[H[0] + side * 1.6, H[1] + 0.25, H[2] + 2.6]} to={[H[0] + side * 1.45, H[1] + 0.2, H[2] + 2.3]} look={H} fov={36} />;
    }
    case 'top':
      return <Cam p={p} t={t} from={[F[0], F[1] + 9 * S, F[2] + 4 * S]} to={[F[0] + 0.6, F[1] + 8.4 * S, F[2] + 3.4 * S]} look={F} fov={40} />;
    case 'push':
      return <Cam p={p} t={t} from={[F[0] + 0.6, F[1] + 2.4, F[2] + 9 * S]} to={[F[0] + 0.2, F[1] + 2.0, F[2] + 5.2 * S]} look={[F[0], F[1] + 1.2, F[2]]} fov={38} />;
    case 'med':
      return <Cam p={p} t={t} from={[F[0] + 2.6 * S, F[1] + 2.1, F[2] + 6.2 * S]} to={[F[0] + 2.1 * S, F[1] + 2.0, F[2] + 5.6 * S]} look={[F[0], F[1] + 1.2, F[2]]} fov={38} />;
    default:
      return <Cam p={p} t={t} from={[F[0] - 1.2, F[1] + 3.2, F[2] + 12 * S]} to={[F[0] + 0.8, F[1] + 3.0, F[2] + 11 * S]} look={[F[0], F[1] + 1, F[2] - 1]} fov={38} />;
  }
};

const Scene: React.FC<{bg: string; children: React.ReactNode; fog?: [string, number, number]; vig?: number}> = ({bg, children, fog, vig = 0.5}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: bg}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 38, near: 0.1, far: 300, position: [0, 2, 10]}}>
        {fog && <fog attach="fog" args={fog} />}
        {children}
      </ThreeCanvas>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(8,3,14,${vig}) 100%)`}} />
    </AbsoluteFill>
  );
};

const NIGHT = 'linear-gradient(#070818 0%, #1a1838 55%, #34224a 100%)';
const CAVEBG = '#120810';

/* ---------- props ---------- */
const handTex = () => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#5a3a34'; g.fillRect(0, 0, 1024, 512);
  const R = rand(4);
  for (let i = 0; i < 900; i++) {g.fillStyle = `rgba(${40 + R() * 40},${25 + R() * 25},${30 + R() * 20},0.35)`; g.fillRect(R() * 1024, R() * 512, 8 + R() * 40, 4 + R() * 18);}
  const hand = (x: number, y: number, s: number, a: number) => {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    g.fillStyle = 'rgba(190,50,30,0.55)'; g.beginPath(); g.arc(0, 0, 70, 0, Math.PI * 2); g.fill(); // spray halo
    g.fillStyle = '#5a3a34'; g.beginPath(); g.ellipse(0, 10, 26, 32, 0, 0, Math.PI * 2); g.fill();
    [[-22, -40, -0.35], [-8, -52, -0.1], [7, -54, 0.05], [21, -46, 0.25]].forEach(([fx, fy, fa]) => {g.save(); g.translate(fx, fy); g.rotate(fa); g.fillRect(-6, -18, 12, 40); g.restore();});
    g.save(); g.translate(30, 8); g.rotate(0.9); g.fillRect(-6, -16, 12, 30); g.restore();
    g.restore();
  };
  hand(200, 260, 1.1, -0.2); hand(420, 200, 0.9, 0.15); hand(640, 300, 1.0, -0.05); hand(860, 220, 1.2, 0.2);
  const tx = new THREE.CanvasTexture(c); tx.needsUpdate = true; return tx;
};

const Bison: React.FC<{pos: V3; t: number; s?: number; rotY?: number; run?: boolean}> = ({pos, t, s = 1, rotY = 0, run}) => {
  const g = run ? Math.sin(t * 12) * 0.5 : 0;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.15, 0]} scale={[0.75, 0.75, 1.3]}><sphereGeometry args={[0.9, 12, 10]} /><meshStandardMaterial color="#3a2418" flatShading /></mesh>
      <mesh position={[0, 1.5, 0.55]} scale={[0.8, 0.8, 0.7]}><sphereGeometry args={[0.75, 12, 10]} /><meshStandardMaterial color="#2a1810" flatShading /></mesh>
      <mesh position={[0, 1.15, 1.25]}><sphereGeometry args={[0.38, 10, 8]} /><meshStandardMaterial color="#2a1810" flatShading /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.32, 1.45, 1.3]} rotation={[0, 0, sd * 0.9]}><coneGeometry args={[0.05, 0.3, 6]} /><meshStandardMaterial color="#e8dcc0" /></mesh>)}
      {[[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]].map(([x, z], i) => <mesh key={i} position={[x, 0.4, z]} rotation={[(i % 2 ? g : -g), 0, 0]}><cylinderGeometry args={[0.09, 0.08, 0.8, 6]} /><meshStandardMaterial color="#2a1810" /></mesh>)}
    </group>
  );
};

const Lion: React.FC<{pos: V3; t: number; rotY?: number; s?: number}> = ({pos, t, rotY = 0, s = 1}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={s}>
    <mesh position={[0, 0.85, 0]} scale={[0.5, 0.45, 1.2]}><sphereGeometry args={[0.9, 12, 10]} /><meshStandardMaterial color="#b08a52" flatShading /></mesh>
    <mesh position={[0, 1.1, 1.0]}><sphereGeometry args={[0.38, 12, 10]} /><meshStandardMaterial color="#9a7a4a" flatShading /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.14, 1.18, 1.34]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#ffd64a" /></mesh>)}
    {[[-0.25, 0.5], [0.25, 0.5], [-0.25, -0.5], [0.25, -0.5]].map(([x, z], i) => <mesh key={i} position={[x, 0.35, z]} rotation={[Math.sin(t * 6 + i) * 0.2, 0, 0]}><cylinderGeometry args={[0.08, 0.07, 0.7, 6]} /><meshStandardMaterial color="#7a5a30" /></mesh>)}
    <mesh position={[0, 1.0, -1.1]} rotation={[0.9, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.9, 6]} /><meshStandardMaterial color="#7a5a30" /></mesh>
  </group>
);

const Smoke: React.FC<{pos: V3; t: number; h?: number}> = ({pos, t, h = 6}) => (
  <group position={pos}>
    {Array.from({length: 8}).map((_, i) => {const y = ((i * 0.8 + t * 0.6) % h); return <mesh key={i} position={[Math.sin(y + i) * 0.3, y, 0]}><sphereGeometry args={[0.35 + y * 0.12, 10, 8]} /><meshBasicMaterial color="#b8aac8" transparent opacity={0.28 * (1 - y / h)} depthWrite={false} /></mesh>;})}
  </group>
);

const CaveShell: React.FC<{color?: string; r?: number}> = ({color = '#4a2e2a', r = 7}) => (
  <>
    <mesh position={[0, 0, -1]}><sphereGeometry args={[r, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} side={THREE.BackSide} roughness={1} flatShading /></mesh>
    <Ground color="#2a1a18" size={30} />
  </>
);

const Hills: React.FC<{color?: string; seed?: number}> = ({color = '#1c1530', seed = 2}) => {
  const R = rand(seed);
  return <>{Array.from({length: 7}).map((_, i) => <mesh key={i} position={[-30 + i * 10 + R() * 4, -2, -25 - R() * 15]} scale={[8 + R() * 6, 3 + R() * 3, 6]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={color} /></mesh>)}</>;
};

/* ---------- sets ---------- */
type SetFn = React.FC<ShotArgs>;
export const SETS: Record<string, SetFn> = {
  caveArt: ({t, d, k, who, cam}) => {
    const tex = useMemo(handTex, []);
    const press = clamp(t / 1.2);
    const spray = t > 0.8 && t < 3.5;
    return (
      <Scene bg={CAVEBG} vig={0.7}>
        <AmberLights rim={1.4} fill={0.5} ambI={0.35} key1="#ff9a4a" />
        <pointLight position={[-2, 1.5, 3]} intensity={9} color="#ff8a3c" distance={10} decay={1.3} />
        <mesh position={[0, 2.2, -1.2]}><planeGeometry args={[8, 4]} /><meshStandardMaterial map={tex} roughness={1} /></mesh>
        <CaveShell />
        <Torch pos={[-2.6, 0, 0.5]} t={t} on={1} />
        <Person {...YOU} pos={[-1.3, 0, 0.3]} rotY={Math.PI * 1.15} t={t} armRFwd={lerp(0.4, 1.35, ease(press))} armR={0.25} look={[0, 0.3]} />
        {spray && Array.from({length: 26}).map((_, i) => {const a = rand(i + Math.floor(t * 8))(); return <mesh key={i} position={[-0.75 + Math.sin(i) * 0.35, 2.25 + Math.cos(i * 1.7) * 0.3, -1.0 + a * 0.4]}><sphereGeometry args={[0.025, 6, 6]} /><meshBasicMaterial color="#c8402a" transparent opacity={0.55} /></mesh>;})}
        <Camera cam={cam === 'close' || cam === 'med' ? 'ots' : cam} t={t} d={d} who={who} focus={[0.4, 0.2, -0.4]} anchors={{N: [0.3, 2.2, -1.0], YOU: head([-1.3, 0, 0.3], 1)}} spread={0.45} />
      </Scene>
    );
  },
  hillsNight: ({t, d, k, who, cam}) => {
    const fires = [12, 12, 12, 5, 2, 2, 2, 2, 2, 2][Math.min(k, 9)];
    const spots = useMemo(() => {const R = rand(12); return Array.from({length: 12}, () => [R() * 36 - 18, -2.2, -9 - R() * 14] as V3);}, []);
    return (
      <Scene bg={NIGHT}>
        <AmberLights rim={1.6} fill={0.7} ambI={0.6} amb="#5a5a9a" />
        <directionalLight position={[-6, 8, -4]} intensity={1.2} color="#9fb4ff" />
        <Stars n={500} />
        <Hills color="#2a2448" />
        <mesh position={[0, -2.6, -20]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[160, 80]} /><meshStandardMaterial color="#141024" /></mesh>
        {spots.slice(0, fires).map((p, i) => <group key={i} position={p}><mesh><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color={i === 0 ? '#ffc060' : '#ff8a2a'} /></mesh><mesh><sphereGeometry args={[1.0, 10, 10]} /><meshBasicMaterial color="#ff8a2a" transparent opacity={0.18} depthWrite={false} /></mesh></group>)}
        <mesh position={[0, -3.1, 2]}><sphereGeometry args={[4.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#3a2c44" /></mesh>
        <Person {...YOU} pos={[0.3, 1.3, 1.6]} rotY={Math.PI} t={t} />
        <Person {...KID} pos={[-0.7, 1.3, 1.9]} rotY={Math.PI * 0.95} t={t} />
        {k >= 3 && <Person {...GRAN} pos={[1.3, 1.3, 2.0]} rotY={Math.PI * 1.05} t={t} prop="staff" />}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 1.3, 1.6]} anchors={{YOU: head([0.3, 1.3, 1.6]), KID: head([-0.7, 1.3, 1.9], 0.62), GRAN: head([1.3, 1.3, 2.0])}} />
      </Scene>
    );
  },
  timeline: ({t, d, k, who, cam}) => (
    <Scene bg="linear-gradient(#0e1838, #3a4a7a 60%, #c0a0b0)">
      <AmberLights key1="#cfe0ff" rim={2} fill={0.8} amb="#4a5a8a" />
      <Ground color="#d8e0f0" />
      {[[-8, -14, 3], [6, -18, 4], [-2, -26, 6]].map(([x, z, s], i) => <mesh key={i} position={[x, s * 0.4, z]} scale={[s * 1.4, s, s]}><coneGeometry args={[1, 1.4, 6]} /><meshStandardMaterial color={i === 2 ? '#5a4a5a' : '#eef2ff'} flatShading /></mesh>)}
      {k >= 1 && <><mesh position={[-2, 9.5, -26]}><sphereGeometry args={[1.6, 10, 10]} /><meshBasicMaterial color="#ff6a2a" /></mesh><Smoke pos={[-2, 9, -26]} t={t} h={10} /></>}
      <Lion pos={[4, 0, -4]} t={t} rotY={-1.2} s={k >= 1 ? 1 : 0.001} />
      {Array.from({length: 7}).map((_, i) => <Person key={i} {...(i % 2 ? YOU : BRO)} pos={[-6 + i * 2, 0, -1 - (i % 2)]} rotY={0.2} t={t + i} walk={t * 4 + i} s={0.9} />)}
      <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, -2]} anchors={{}} spread={1.3} />
    </Scene>
  ),
  caveHome: ({t, d, k, who, cam}) => (
    <Scene bg={CAVEBG} vig={0.65}>
      <AmberLights rim={0.9} fill={0.35} ambI={0.3} />
      <CaveShell color="#5a3428" />
      <Fire pos={[0, 0, 0.6]} t={t} light={11} />
      <Person {...YOU} pos={[-1.2, 0, 0.2]} rotY={0.9} sit t={t} look={[1, 0]} armRFwd={who === 'YOU' ? 0.6 : 0.2} />
      <Person {...GRAN} pos={[1.3, 0, 0.0]} rotY={-0.9} sit t={t} look={[-1, 0]} />
      <Person {...KID} pos={[0.2, 0, -0.9]} sit t={t} look={[Math.sin(t), 0]} />
      {k >= 3 && <Person {...BRO} pos={[-2.6, 0, -1.2]} rotY={0.6} sit t={t} />}
      <mesh position={[-0.6, 0.12, 1.3]}><cylinderGeometry args={[0.18, 0.13, 0.18, 10]} /><meshStandardMaterial color="#2a1a14" /></mesh>
      <mesh position={[-0.6, 0.22, 1.3]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 12]} /><meshBasicMaterial color="#0a0604" /></mesh>
      <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0]} anchors={{YOU: head([-1.2, 0, 0.2], 1, true), GRAN: head([1.3, 0, 0], 1, true), MAN: head([1.3, 0, 0], 1, true), KID: head([0.2, 0, -0.9], 0.62, true), N: head([-1.2, 0, 0.2], 1, true)}} spread={0.6} />
    </Scene>
  ),
  steppeHunt: ({t, d, k, who, cam}) => {
    const down = k >= 3;
    return (
      <Scene bg="linear-gradient(#5a6a8a, #b0b8d0 60%, #f0d8c0)" fog={['#c8c8d8', 10, 60]}>
        <AmberLights key1="#ffe0c0" rim={2.2} fill={1} amb="#6a7a9a" />
        <Ground color="#d8dce8" />
        {Array.from({length: 30}).map((_, i) => {const R = rand(i + 3); return <mesh key={i} position={[R() * 30 - 15, 0.15, R() * -20]}><coneGeometry args={[0.06, 0.4, 4]} /><meshStandardMaterial color="#9a8a6a" /></mesh>;})}
        <Bison pos={[1.8 + (k >= 2 ? t * 0.8 : 0), 0, -2.6]} s={1.45} t={t} rotY={k >= 2 ? -0.6 : -1.4} run={k >= 2} />
        <Person {...YOU} pos={[-1.6, 0, 0.6]} rotY={0.7} t={t} prop="spear" armRFwd={k >= 1 && k <= 2 ? 1.3 : 0.5} kneel={k === 0} look={[1, 0]} />
        <Person {...BRO} pos={[0.2, 0, 1.2]} rotY={down ? 0.2 : 0.4} t={t} prop={down ? null : 'spear'} armRFwd={0.8} kneel={!down} sit={down} look={down ? [-1, 0] : [1, 0]} />
        {[[-3, -0.5], [2.6, 1.4], [-2.4, 2.2]].map(([x, z], i) => <Person key={i} {...BRO} pos={[x, 0, z]} rotY={0.6} kneel t={t + i} prop="spear" armRFwd={0.9} />)}
        {k === 6 && <Person {...BRO} pos={[-1.6, 0.9, 0.5]} rotY={Math.PI / 2} t={t} lean={1.2} />}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0]} anchors={{YOU: head([-1.6, 0, 0.6], 1, false), BRO: head([0.2, 0, 1.2], 1, down)}} />
      </Scene>
    );
  },
  strangers: ({t, d, k, who, cam}) => (
    <Scene bg="linear-gradient(#2a2a4a, #8a6a7a 55%, #f0b080)" fog={['#9a7a8a', 12, 70]}>
      <AmberLights key1="#ffc080" rim={2.4} fill={0.7} />
      <Ground color="#4a3a3a" />
      <Hills color="#3a2a3a" seed={7} />
      <Smoke pos={[-6, 0, -22]} t={t} h={9} /><Smoke pos={[-2, 0, -24]} t={t + 1} h={9} /><Smoke pos={[3, 0, -21]} t={t + 2} h={9} />
      {Array.from({length: 9}).map((_, i) => <Person key={i} {...(i % 3 ? MAN : AMA)} pos={[-6 + i * 1.3, 0, -10 - (i % 3)]} rotY={0.1} t={t + i} walk={t * 4 + i} s={0.9} prop={i % 2 ? 'spear' : null} />)}
      <Person {...MAN} pos={[1.2, 0, -3]} rotY={-0.3} t={t} prop="spear" armRFwd={0.9} look={[-1, 0]} />
      <Person {...YOU} pos={[-1.8, 0, 2.4]} rotY={Math.PI * 0.85} t={t} look={[0, 0]} />
      <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, -3]} anchors={{MAN: head([1.2, 0, -3]), YOU: head([-1.8, 0, 2.4])}} faces={{MAN: -0.3, YOU: Math.PI * 0.85}} />
    </Scene>
  ),
  sapiensCamp: ({t, d, k, who, cam}) => {
    const people = useMemo(() => {const R = rand(33); return Array.from({length: 60}, () => [R() * 16 - 8, 0, R() * -12 + 2] as V3);}, []);
    return (
      <Scene bg="linear-gradient(#24163e, #7a3a50 50%, #f08a4a)">
        <AmberLights key1="#ff9a4a" rim={2.6} fill={0.7} />
        <Ground color="#5a3a2a" />
        {[[-5, -6], [-2, -8], [2, -7], [5, -5], [7, -9], [-7, -9]].map(([x, z], i) => <Shelter key={i} pos={[x, 0, z]} rotY={i} s={1.1} />)}
        {[-4, 0, 4].map((x, i) => <Fire key={i} pos={[x, 0, -2 - i]} t={t + i} light={i === 1 ? 8 : 0} s={0.8} />)}
        <Crowd positions={people} visible={60} color="#8a5a3a" s={0.95} />
        {Array.from({length: 10}).map((_, i) => <mesh key={i} position={[-1 + i * 0.22, 0.85, 1.2]}><sphereGeometry args={[0.05, 8, 6]} /><meshStandardMaterial color="#f4ece0" /></mesh>)}
        <Person {...AMA} pos={[-1.5, 0, 1.4]} rotY={0.6} t={t} armRFwd={0.9} prop="food" />
        <Person {...MAN} pos={[1.5, 0, 1.2]} rotY={-0.6} t={t} armLFwd={0.9} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, -2]} anchors={{AMA: head([-1.5, 0, 1.4]), MAN: head([1.5, 0, 1.2])}} />
      </Scene>
    );
  },
  meeting: ({t, d, k, who, cam}) => (
    <Scene bg="linear-gradient(#2a3a4a, #6a6a7a 55%, #d0a07a)" fog={['#7a7480', 3, 18]}>
      <AmberLights key1="#ffc080" rim={2.4} fill={0.6} />
      <Ground color="#3a4038" />
      {[[-4, -3], [4.5, -4], [-6, -8], [6, -9], [-2, -10], [2.5, -13]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.6} color="#24323a" />)}
      <Person {...YOU} pos={[-1.6, 0, 1]} rotY={1.0} t={t} walk={k === 0 ? t * 4 : undefined} look={[1, 0]} />
      {[[1.8, -1.2], [2.8, -0.4], [3.4, -1.8]].map(([x, z], i) => <Person key={i} {...MAN} pos={[x, 0, z]} rotY={-0.9} t={t + i} prop="spear" armRFwd={k >= 1 ? 1.25 : 0.4} />)}
      {k >= 2 && <Person {...AMA} pos={[0.6, 0, 0.2]} rotY={-1.1} t={t} prop="food" armRFwd={1.2} look={[-1, 0]} />}
      <Camera cam={cam} t={t} d={d} who={who} focus={[0.4, 0, 0]} anchors={{YOU: head([-1.6, 0, 1]), AMA: head([0.6, 0, 0.2]), MAN: head([1.8, 0, -1.2])}} />
    </Scene>
  ),
  sharedFire: ({t, d, k, who, cam}) => {
    const lion = k >= 4 && k <= 7;
    return (
      <Scene bg="linear-gradient(#0c0a22, #241a38)">
        <AmberLights rim={1.0} fill={0.3} ambI={0.35} />
        <Stars n={350} />
        <Ground color="#241c22" />
        {[[-5, -5], [5, -6], [-7, -9], [7, -10]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.5} color="#161c2a" />)}
        <Fire pos={[0, 0, 0]} t={t} light={11} />
        <Person {...YOU} pos={[-1.5, 0, -0.3]} rotY={1.3} sit={!lion} t={t} look={[1, 0]} prop={lion ? 'spear' : null} armRFwd={lion ? 1.3 : 0} />
        <Person {...AMA} pos={[1.5, 0, -0.3]} rotY={-1.3} sit t={t} look={[-1, 0]} />
        <Person {...MAN} pos={[0.9, 0, -1.6]} rotY={-0.6} sit={!lion} t={t} prop={lion ? 'spear' : null} armRFwd={lion ? 1.3 : 0} />
        <Person {...KID} pos={[-0.5, 0, 1.4]} rotY={2.6} sit t={t} />
        <Person kind="child" outfit="#b07a4a" trim="#6a4a2a" s={0.58} pos={[0.6, 0, 1.5]} rotY={-2.6} sit t={t} look={[-1, 0]} />
        {lion && <Lion pos={[-3 + Math.sin(t * 0.8) * 1.5, 0, -4 + (k >= 6 ? t * 0.3 : 0)]} t={t} rotY={0.6 + Math.sin(t * 0.8)} />}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0]} anchors={{YOU: head([-1.5, 0, -0.3], 1, !lion), AMA: head([1.5, 0, -0.3], 1, true), MAN: head([0.9, 0, -1.6], 1, !lion), KID: head([-0.5, 0, 1.4], 0.62, true)}} spread={0.7} />
      </Scene>
    );
  },
  burial: ({t, d, k, who, cam}) => (
    <Scene bg={CAVEBG} vig={0.75}>
      <AmberLights rim={1.2} fill={0.6} ambI={0.45} key1="#ffb070" />
      <pointLight position={[0.3, 2.2, 1.6]} intensity={7} color="#ffb070" distance={7} decay={1.3} />
      <CaveShell color="#3a2a2a" />
      <Torch pos={[2.4, 0, -0.5]} t={t} on={1} light />
      <mesh position={[0, 0.02, 0.4]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.1, 20]} /><meshStandardMaterial color="#1a100c" /></mesh>
      <group position={[0.1, 0.05, 0.4]} rotation={[0, 0, Math.PI / 2]}><Person {...GRAN} pos={[0, 0, 0]} t={0} s={0.85} rotY={0} /></group>
      {Array.from({length: 7}).map((_, i) => <mesh key={i} position={[-0.6 + i * 0.2, 0.08, 0.95 + Math.sin(i) * 0.1]}><sphereGeometry args={[0.05, 6, 6]} /><meshBasicMaterial color={i % 2 ? '#e8c84a' : '#c86a8a'} /></mesh>)}
      <Person {...YOU} pos={[-0.9, 0, 1.6]} rotY={2.6} kneel t={t} look={[0.5, -1]} />
      <Person {...KID} pos={[0.8, 0, 1.8]} rotY={-2.6} t={t} look={[-0.5, -1]} />
      {cam === 'wide'
        ? <Cam p={t / d} t={t} from={[-0.6, 3.4, -3.6]} to={[0.4, 3.1, -3.1]} look={[0, 0.5, 0.9]} fov={42} />
        : <Cam p={t / d} t={t} from={[-0.3, 2.4, -2.7]} to={[0.2, 2.25, -2.35]} look={[0, 1.05, 1.1]} fov={42} />}
    </Scene>
  ),
  coast: ({t, d, k, who, cam}) => (
    <Scene bg="linear-gradient(#3a3a6a, #b07a7a 55%, #ffc080)">
      <AmberLights key1="#ffc080" rim={2.4} fill={0.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -20]}><planeGeometry args={[120, 60]} /><meshStandardMaterial color="#3a5a8a" roughness={0.4} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-6 + i * 2.4, -0.28, -2 - ((t * 0.9 + i) % 9)]}><planeGeometry args={[2, 0.08]} /><meshBasicMaterial color="#e8eef8" transparent opacity={0.45} /></mesh>)}
      <mesh position={[0, -0.25, 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[40, 8]} /><meshStandardMaterial color="#c8a070" /></mesh>
      <mesh position={[-7, 4, -6]} scale={[4, 6, 4]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#6a5a5a" flatShading /></mesh>
      <mesh position={[-5.8, 1.2, -3.4]}><circleGeometry args={[1.1, 16]} /><meshBasicMaterial color="#0e0808" /></mesh>
      {k >= 4 && <><Fire pos={[4, 0, -1]} t={t} light={7} /><Smoke pos={[4, 0.5, -1]} t={t} h={7} />{[[3, -1.6], [5, -1.4], [4.5, 0]].map(([x, z], i) => <Person key={i} {...(i ? MAN : AMA)} pos={[x, 0, z]} rotY={-1.2} t={t + i} armRFwd={i === 0 && k >= 7 ? 1.2 : 0} />)}</>}
      <Person {...YOU} pos={[-3.4, 0, 0.6]} rotY={k >= 4 ? 1.1 : 0.4} t={t} walk={k === 0 ? t * 4 : undefined} look={[1, 0]} />
      <Camera cam={cam} t={t} d={d} who={who} focus={[-1, 0, -1]} anchors={{YOU: head([-3.4, 0, 0.6]), AMA: head([3, 0, -1.6])}} />
    </Scene>
  ),
  mixedFamily: ({t, d, k, who, cam}) => {
    const seats = useMemo(() => Array.from({length: 12}, (_, i) => {const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6, a] as [number, number, number, number];}), []);
    return (
      <Scene bg="linear-gradient(#141030, #3a2448 60%, #6a3a40)">
        <AmberLights rim={1.6} fill={0.6} ambI={0.5} />
        <Stars n={400} />
        <Ground color="#2a2024" />
        <Fire pos={[0, 0, 0]} t={t} light={12} s={1.2} />
        {seats.map(([x, , z, a], i) => <Person key={i} {...(i === 0 ? YOU : i % 3 === 0 ? BRO : i % 3 === 1 ? AMA : MAN)} kind={i === 0 ? 'modern' : i % 4 === 2 ? 'child' : i % 3 === 0 ? 'neander' : 'adult'} s={i % 4 === 2 ? 0.6 : 0.95} pos={[x, 0, z]} rotY={-a - Math.PI / 2} sit t={t + i} mouth={k >= 2 ? 'smile' : 'line'} />)}
        <Camera cam={cam === 'close' || cam === 'ots' ? 'med' : cam} t={t} d={d} who={who} focus={[0, 0, 0]} anchors={{}} spread={0.62} />
      </Scene>
    );
  },
  lab: ({t, d, k, who, cam}) => (
    <Scene bg="linear-gradient(#0c1424, #1a2a3a)">
      <ambientLight intensity={0.7} color="#8aa0c0" />
      <directionalLight position={[2, 5, 4]} intensity={1.6} color="#e8f0ff" />
      <pointLight position={[0.4, 1.6, 0.6]} intensity={6} color="#9fe8ff" distance={6} decay={1.4} />
      <Ground color="#2a3440" size={30} />
      <mesh position={[0, 6, -3.5]}><planeGeometry args={[20, 12]} /><meshStandardMaterial color="#1a2430" /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[3.2, 0.08, 1.2]} /><meshStandardMaterial color="#c8d0dc" /></mesh>
      {[-1.4, 1.4].map((x) => <mesh key={x} position={[x, 0.45, 0]}><boxGeometry args={[0.08, 0.9, 1.0]} /><meshStandardMaterial color="#8a94a4" /></mesh>)}
      {[-0.9, 0.5].map((x, i) => (
        <group key={i} position={[x, 1.55, -0.35]}>
          <mesh><boxGeometry args={[1.1, 0.7, 0.05]} /><meshStandardMaterial color="#111822" /></mesh>
          {Array.from({length: 8}).map((_, r) => <mesh key={r} position={[-0.4 + ((t * 0.3 + r * 0.11) % 0.8), 0.27 - r * 0.07, 0.03]}><planeGeometry args={[0.25, 0.02]} /><meshBasicMaterial color={['#4fe08a', '#4fa3ff', '#ffb02e', '#e5484d'][(r + i) % 4]} /></mesh>)}
        </group>
      ))}
      <mesh position={[0.2, 1.0, 0.25]} rotation={[0, 0, 1.2]}><capsuleGeometry args={[0.04, 0.3, 4, 8]} /><meshStandardMaterial color="#e8dcc0" /></mesh>
      <Person {...SCI} pos={[1.6, 0, 0.8]} rotY={-0.7} t={t} armLFwd={0.9} look={[-0.6, -0.4]} mouth={k >= 1 ? 'smile' : 'line'} />
      <Camera cam={cam} t={t} d={d} who={who} focus={[0.3, 0.4, 0]} anchors={{SCI: head([1.6, 0, 0.8])}} spread={0.55}  faces={{SCI: -0.7}} />
    </Scene>
  ),
  worldDNA: ({t, d, k, who, cam}) => {
    const dots = useMemo(() => {const R = rand(41); return Array.from({length: 220}, () => {const la = (R() * 1.2 - 0.25), lo = R() * Math.PI * 2; return [Math.cos(la) * Math.cos(lo) * 2.02, Math.sin(la) * 2.02, Math.cos(la) * Math.sin(lo) * 2.02] as V3;});}, []);
    return (
      <Scene bg="radial-gradient(#1c1440, #06040f)">
        <ambientLight intensity={0.5} color="#6a5a9a" />
        <directionalLight position={[-4, 3, 4]} intensity={3.4} color="#ffd0a0" />
        <pointLight position={[3, 2, 5]} intensity={20} color="#9fb4ff" decay={1.5} />
        <Stars n={600} r={70} minY={-30} />
        <group rotation={[0.3, t * 0.15, 0]}>
          <mesh><sphereGeometry args={[2, 48, 32]} /><meshStandardMaterial color="#3a5a8a" emissive="#0c1a34" roughness={0.7} /></mesh>
          {dots.slice(0, Math.round(lerp(40, 220, ease(t / Math.max(1, d * 0.7))))).map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.035, 6, 6]} /><meshBasicMaterial color={i % 5 === 0 ? '#ffd27a' : '#ffb02e'} /></mesh>)}
        </group>
        <group position={[3.6, -1.8, -1]} scale={0.6}><Helix t={t} hot={1} /></group>
        <Camera cam={cam === 'close' ? 'push' : cam} t={t} d={d} who={who} focus={[0, -1.2, 0]} anchors={{}} spread={0.75} />
      </Scene>
    );
  },
};


/* ================= v2 sets: driven by explicit script variants (v), not line order ================= */
const BOY: PersonProps = {kind: 'child', outfit: '#b07a4a', trim: '#6a4a2a', s: 0.6, outline: RIM};
const ELDER: PersonProps = {kind: 'elder', outfit: '#7a6a5a', trim: '#a89a6a', outline: RIM};
export const Rhino: React.FC<{pos: V3; t: number; s?: number; rotY?: number; run?: boolean}> = ({pos, t, s = 1, rotY = 0, run}) => {
  const g = run ? Math.sin(t * 14) * 0.5 : 0;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.2, 0]} scale={[0.8, 0.75, 1.4]}><sphereGeometry args={[0.95, 12, 10]} /><meshStandardMaterial color="#5a4030" flatShading /></mesh>
      <mesh position={[0, 1.05, 1.35]} scale={[0.7, 0.65, 0.9]}><sphereGeometry args={[0.55, 12, 10]} /><meshStandardMaterial color="#4a3426" flatShading /></mesh>
      <mesh position={[0, 1.35, 1.85]} rotation={[0.5, 0, 0]}><coneGeometry args={[0.13, 0.75, 8]} /><meshStandardMaterial color="#e8dcc0" /></mesh>
      <mesh position={[0, 1.4, 1.5]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.08, 0.35, 8]} /><meshStandardMaterial color="#e8dcc0" /></mesh>
      {[[-0.35, 0.6], [0.35, 0.6], [-0.35, -0.6], [0.35, -0.6]].map(([x, z], i) => <mesh key={i} position={[x, 0.42, z]} rotation={[(i % 2 ? g : -g), 0, 0]}><cylinderGeometry args={[0.13, 0.12, 0.85, 8]} /><meshStandardMaterial color="#3a2a20" /></mesh>)}
    </group>
  );
};
const has = (v: string | undefined, f: string) => (v ?? '').split(/[ ,]/).includes(f);

Object.assign(SETS, {
  steppeHunt: (({t, d, who, cam, v}) => {
    const charge = has(v, 'charge'), kill = has(v, 'kill');
    const rz = charge ? lerp(-9, -2.2, ease(t / d)) : -3;
    return (
      <Scene bg="linear-gradient(#5a6a8a, #b0b8d0 60%, #f0d8c0)" fog={['#c8c8d8', 10, 60]}>
        <AmberLights key1="#ffe0c0" rim={2.2} fill={1} amb="#6a7a9a" />
        <Ground color="#d8dce8" />
        {Array.from({length: 30}).map((_, i) => {const R = rand(i + 3); return <mesh key={i} position={[R() * 30 - 15, 0.15, R() * -20]}><coneGeometry args={[0.06, 0.4, 4]} /><meshStandardMaterial color="#9a8a6a" /></mesh>;})}
        {charge || has(v, 'chargeend') ? <Rhino pos={[0.6, 0, rz]} t={t} rotY={0} run={charge} s={1.15} />
          : <Bison pos={[1.8 + (kill ? 0 : t * 0.3), kill ? -0.35 : 0, -2.6]} s={1.45} t={t} rotY={kill ? -1.0 : -1.4} run={!kill} />}
        <Person {...YOU} pos={[-0.6, 0, 0.6]} rotY={charge ? 0.2 : 0.7} t={t} prop="spear" armRFwd={kill || charge || has(v, 'chargeend') ? 1.35 : 0.6} kneel={has(v, 'hunt')} look={[0.6, 0]} />
        {[[-3, -0.5], [2.8, 1.4]].map(([x, z], i) => <Person key={i} {...MAN} pos={[x, 0, z]} rotY={0.5} t={t + i} prop="spear" armRFwd={0.6} walk={charge ? t * 7 + i : undefined} />)}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0]} anchors={{YOU: head([-0.6, 0, 0.6], 1, has(v, 'hunt')), N: head([-0.6, 0, 0.6], 1, has(v, 'hunt')), MAN: head([2.8, 0, 1.4])}}  faces={{YOU: charge ? 0.2 : 0.7, N: charge ? 0.2 : 0.7, MAN: 0.5}} />
      </Scene>
    );
  }) as SetFn,
  hillsNight: (({t, d, who, cam, v}) => {
    const fires = has(v, 'fires12') ? 12 : has(v, 'fires5') ? 5 : has(v, 'fires0') ? 0 : 2;
    const spots = useMemo(() => {const R = rand(12); return Array.from({length: 12}, () => [R() * 36 - 18, -2.2, -9 - R() * 14] as V3);}, []);
    return (
      <Scene bg={NIGHT}>
        <AmberLights rim={1.6} fill={0.7} ambI={0.6} amb="#5a5a9a" />
        <directionalLight position={[-6, 8, -4]} intensity={1.2} color="#9fb4ff" />
        <Stars n={500} />
        <Hills color="#2a2448" />
        <mesh position={[0, -2.6, -20]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[160, 80]} /><meshStandardMaterial color="#141024" /></mesh>
        {spots.slice(0, fires).map((p, i) => <group key={i} position={p}><mesh><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color={i === 0 ? '#ffc060' : '#ff8a2a'} /></mesh><mesh><sphereGeometry args={[1.0, 10, 10]} /><meshBasicMaterial color="#ff8a2a" transparent opacity={0.18} depthWrite={false} /></mesh></group>)}
        <mesh position={[0, -3.1, 2]}><sphereGeometry args={[4.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#3a2c44" /></mesh>
        <Person {...YOU} pos={[0.3, 1.3, 1.6]} rotY={Math.PI} t={t} />
        <Person {...KID} pos={[-0.7, 1.3, 1.9]} rotY={Math.PI * 0.95} t={t} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 1.3, 1.6]} spread={0.62} anchors={{YOU: head([0.3, 1.3, 1.6]), KID: head([-0.7, 1.3, 1.9], 0.62), AMA: head([-0.7, 1.3, 1.9], 0.62)}}  faces={{YOU: Math.PI, N: Math.PI, KID: Math.PI * 0.95, AMA: Math.PI * 0.95}} />
      </Scene>
    );
  }) as SetFn,
  caveHome: (({t, d, who, cam, v}) => {
    const tar = has(v, 'tar');
    const boy = who === 'BOY';
    return (
      <Scene bg={CAVEBG} vig={0.65}>
        <AmberLights rim={1.1} fill={0.5} ambI={0.4} />
        <CaveShell color="#5a3428" />
        <Fire pos={[0, 0, 0.6]} t={t} light={11} />
        <Person {...YOU} pos={[-1.2, 0, 0.2]} rotY={0.9} sit t={t} look={[1, 0]} armRFwd={tar ? 0.9 : 0.2} />
        <Person {...GRAN} pos={[1.3, 0, 0.0]} rotY={-0.9} sit t={t} look={[-1, 0]} />
        {boy ? <Person {...BOY} pos={[-0.2, 0, 1.1]} rotY={2.4} sit t={t} look={[-1, 0]} armRFwd={0.8} /> : <Person {...KID} pos={[-0.2, 0, 1.1]} rotY={2.4} sit t={t} look={[-1, 0]} armRFwd={tar ? 0.8 : 0} />}
        <mesh position={[-0.75, 0.12, 1.0]}><cylinderGeometry args={[0.18, 0.13, 0.18, 10]} /><meshStandardMaterial color="#2a1a14" /></mesh>
        <mesh position={[-0.75, 0.22, 1.0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 12]} /><meshBasicMaterial color="#0a0604" /></mesh>
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0.3]} anchors={{YOU: head([-1.2, 0, 0.2], 1, true), N: head([-1.2, 0, 0.2], 1, true), GRAN: head([1.3, 0, 0], 1, true), KID: head([-0.2, 0, 1.1], 0.62, true), BOY: head([-0.2, 0, 1.1], 0.6, true)}} spread={0.6}  faces={{YOU: 0.1, N: 0.1, GRAN: -0.9, MAN: -0.9, KID: 1.65, BOY: 1.65}} />
      </Scene>
    );
  }) as SetFn,
  meeting: (({t, d, who, cam, v}) => {
    const offer = has(v, 'offer');
    return (
      <Scene bg="linear-gradient(#2a3a4a, #6a6a7a 55%, #d0a07a)" fog={['#7a7480', 3, 18]}>
        <AmberLights key1="#ffc080" rim={2.4} fill={0.6} />
        <Ground color="#3a4038" />
        {[[-4, -3], [4.5, -4], [-6, -8], [6, -9], [-2, -10], [2.5, -13]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.6} color="#24323a" />)}
        <Person {...YOU} pos={[-1.6 + (has(v, 'walk') ? ease(t / d) * 0.8 : 0.8), 0, 1]} rotY={1.0} t={t} walk={has(v, 'walk') ? t * 4 : undefined} look={[1, 0]} />
        {[[1.8, -1.2], [2.8, -0.4], [3.4, -1.8]].map(([x, z], i) => <Person key={i} {...MAN} pos={[x, 0, z]} rotY={-0.9} t={t + i} prop="spear" armRFwd={offer ? 0.5 : 1.25} />)}
        {offer && <Person {...AMA} pos={[0.6, 0, 0.2]} rotY={-1.1} t={t} prop="food" armRFwd={1.2} look={[-1, 0]} />}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0.4, 0, 0]} anchors={{YOU: head([-0.8, 0, 1]), N: head([0.6, 0, 0.2]), AMA: head([0.6, 0, 0.2]), MAN: head([1.8, 0, -1.2])}}  faces={{YOU: 1.0, N: -1.1, AMA: -1.1, MAN: -0.9}} />
      </Scene>
    );
  }) as SetFn,
  sapiensCamp: (({t, d, who, cam, v}) => {
    const lift = has(v, 'lift');
    const people = useMemo(() => {const R = rand(33); return Array.from({length: 50}, () => [R() * 16 - 8, 0, R() * -10 - 3] as V3);}, []);
    return (
      <Scene bg="linear-gradient(#24163e, #7a3a50 50%, #f08a4a)">
        <AmberLights key1="#ff9a4a" rim={2.6} fill={0.8} />
        <Ground color="#5a3a2a" />
        {[[-5, -6], [-2, -8], [2, -7], [5, -5], [7, -9], [-7, -9]].map(([x, z], i) => <Shelter key={i} pos={[x, 0, z]} rotY={i} s={1.1} />)}
        {[-4, 0, 4].map((x, i) => <Fire key={i} pos={[x, 0, -2.5 - i]} t={t + i} light={i === 1 ? 8 : 0} s={0.8} />)}
        <Crowd positions={people} visible={50} color="#8a5a3a" s={0.95} />
        <Person {...YOU} pos={[0, 0, 0.6]} rotY={0.2} t={t} armL={lift ? 2.6 : 0} armR={lift ? 2.6 : 0} look={[0.3, 0]} />
        {lift && <mesh position={[0, 2.78, 0.6]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.22, 0.22, 3.2, 10]} /><meshStandardMaterial color="#6a4426" flatShading /></mesh>}
        <Person {...BOY} pos={[1.4, 0, 1.6]} rotY={-0.8} t={t} look={[-1, 0.3]} mouth={lift ? 'o' : 'smile'} />
        <Person {...ELDER} pos={[-1.9, 0, 1.0]} rotY={0.7} t={t} prop="staff" look={[1, 0]} />
        <Person {...MAN} pos={[2.4, 0, 0.2]} rotY={-0.9} t={t} prop="spear" look={[-1, 0]} />
        <Person {...AMA} pos={[-2.8, 0, -0.4]} rotY={0.9} t={t} look={[1, 0]} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0.4]} anchors={{YOU: head([0, 0, 0.6]), N: head([0, 0, 0.6]), BOY: head([1.4, 0, 1.6], 0.6), ELDER: head([-1.9, 0, 1.0]), MAN: head([2.4, 0, 0.2]), AMA: head([-2.8, 0, -0.4])}} spread={0.85}  faces={{YOU: 0.2, N: 0.2, BOY: -0.8, ELDER: 0.7, MAN: -0.9, AMA: 0.9}} />
      </Scene>
    );
  }) as SetFn,
  sharedFire: (({t, d, who, cam, v}) => {
    const lion = has(v, 'lion'), fight = has(v, 'fight'), after = has(v, 'after');
    const lionPos: V3 = fight ? [lerp(-2.6, -1.0, ease(t / 0.8)), Math.max(0, Math.sin(clamp(t / 0.8) * Math.PI) * 1.2), lerp(-3.2, -1.2, ease(t / 0.8))] : [-3 + Math.sin(t * 0.8) * 1.2, 0, -4];
    const standing = lion || fight;
    return (
      <Scene bg="linear-gradient(#0c0a22, #241a38)">
        <AmberLights rim={1.2} fill={0.45} ambI={0.45} />
        <Stars n={350} />
        <Ground color="#241c22" />
        {[[-5, -5], [5, -6], [-7, -9], [7, -10]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.5} color="#161c2a" />)}
        <Fire pos={[0, 0, 0]} t={t} light={12} />
        <Person {...YOU} pos={fight ? [-1.3, 0, -0.9] : [-1.5, 0, -0.3]} rotY={fight ? 2.6 : 1.3} sit={!standing} t={t} look={fight ? [-1, 0] : [1, 0]} prop={standing ? 'spear' : null} armRFwd={standing ? 1.35 : 0} armL={after ? -0.2 : 0} armLFwd={after ? 1.4 : 0} lean={fight ? 0.25 : 0} />
        {after && <mesh position={[-1.25, 0.95, 0.05]} rotation={[0, 1.3, 0.2]}><torusGeometry args={[0.18, 0.04, 6, 14]} /><meshStandardMaterial color="#e8dcc0" /></mesh>}
        <Person {...AMA} pos={[1.5, 0, -0.3]} rotY={-1.3} sit={!standing} t={t} look={[-1, 0]} mouth={after ? 'smile' : standing ? 'o' : 'line'} />
        <Person {...MAN} pos={[0.9, 0, -1.6]} rotY={-0.6} sit={!standing} t={t} prop={standing ? 'spear' : null} armRFwd={standing ? 1.3 : 0} />
        <Person {...ELDER} pos={[1.9, 0, 1.0]} rotY={-2.2} sit t={t} prop="staff" />
        <Person {...KID} pos={[-0.5, 0, 1.4]} rotY={2.6} sit={!standing} t={t} />
        <Person {...BOY} pos={standing ? [-2.4, 0, -2.4] : [0.6, 0, 1.5]} rotY={standing ? 2.4 : -2.6} sit={!standing} t={t} look={[-1, 0]} mouth={standing ? 'o' : 'smile'} />
        {(lion || fight) && <><Lion pos={lionPos} t={t} s={1.5} rotY={fight ? 0.9 : 0.6 + Math.sin(t * 0.8)} /><pointLight position={[lionPos[0] + 1, 2.2, lionPos[2] + 1.5]} intensity={6} color="#ffb070" distance={6} decay={1.3} /></>}
        <Camera cam={cam} t={t} d={d} who={who} focus={standing ? [-1.6, 0, -2.0] : [0, 0, 0]} anchors={{YOU: head(fight ? [-1.3, 0, -0.9] : [-1.5, 0, -0.3], 1, !standing), N: head(fight ? [-1.3, 0, -0.9] : [-1.5, 0, -0.3], 1, !standing), AMA: head([1.5, 0, -0.3], 1, !standing), MAN: head([0.9, 0, -1.6], 1, !standing), ELDER: head([1.9, 0, 1.0], 1, true), KID: head([-0.5, 0, 1.4], 0.62, !standing), BOY: head(standing ? [-2.4, 0, -2.4] : [0.6, 0, 1.5], 0.6, !standing)}} spread={0.75}  faces={{YOU: fight ? 2.6 : 1.3, N: fight ? 2.6 : 1.3, AMA: -1.3, MAN: -0.6, ELDER: -2.2, KID: 2.6, BOY: standing ? 2.4 : -2.6}} />
      </Scene>
    );
  }) as SetFn,
});


/* ================= 50K sets: you (modern, hoodie) wake up 50,000 years ago ================= */
const DENI: PersonProps = {kind: 'adult', outfit: '#5a4a3a', trim: '#2e241a', outline: RIM};
const TINY: PersonProps = {kind: 'adult', outfit: '#8a6a3a', trim: '#4a3018', s: 0.62, outline: RIM};
const NCH: PersonProps = {kind: 'neander', outfit: '#5a4030', trim: '#2e1c10', s: 0.6, outline: RIM};
const rot = (from: [number, number], to: [number, number]) => Math.atan2(to[0] - from[0], to[1] - from[1]);
const SNOWBG = 'linear-gradient(#6a7aa8, #b8c0dc 55%, #f0dcc8)';

Object.assign(SETS, {
  /* four kinds of humans walking the Ice Age */
  timeline: (({t, d, who, cam}) => (
    <Scene bg="linear-gradient(#0e1838, #3a4a7a 60%, #c0a0b0)">
      <AmberLights key1="#cfe0ff" rim={2} fill={0.8} amb="#4a5a8a" />
      <Ground color="#d8e0f0" />
      {[[-8, -14, 3], [6, -18, 4], [-2, -26, 6]].map(([x, z, s], i) => <mesh key={i} position={[x, s * 0.4, z]} scale={[s * 1.4, s, s]}><coneGeometry args={[1, 1.4, 6]} /><meshStandardMaterial color={i === 2 ? '#5a4a5a' : '#eef2ff'} flatShading /></mesh>)}
      {[BRO, MAN, DENI, TINY, BRO, AMA, DENI].map((p, i) => <Person key={i} {...p} pos={[-6 + i * 2, 0, -1 - (i % 2)]} rotY={0.25} t={t + i} walk={t * 4 + i} prop={i % 3 === 1 ? 'spear' : null} />)}
      <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, -2]} anchors={{}} spread={1.3} />
    </Scene>
  )) as SetFn,

  /* waking up on your back in the snow, three faces leaning over you */
  wake: (({t, d, who, cam, v}) => {
    const sit = has(v, 'sit'), phone = has(v, 'phone');
    const low = !sit && (cam === 'pov' || cam === 'close');   /* the ring of faces over you */
    const H: [number, number] = [0, -1.25];
    const ang: Record<string, number> = {MAN: -1.9, AMA: Math.PI, ELDER: 1.9};
    const R = low ? 1.8 : 1.25, LEAN = low ? 0.8 : 0.1;
    const at = (k: string): [number, number] => [H[0] + Math.sin(ang[k]) * R, H[1] + Math.cos(ang[k]) * R];
    const crew: [PersonProps, string][] = [[MAN, 'MAN'], [ELDER, 'ELDER'], [AMA, 'AMA']];
    const hd = (k: string): V3 => {const p = at(k); const h = 1.73 * Math.cos(LEAN), off = 1.73 * Math.sin(LEAN); const dx = H[0] - p[0], dz = H[1] - p[1], L = Math.hypot(dx, dz); return [p[0] + dx / L * off, h, p[1] + dz / L * off];};
    const anchors: Record<string, V3> = {YOU: head([0, 0, -0.6], 1, true), N: head([0, 0, -0.6], 1, true), KID: head([1.0, 0, -0.5], 0.62), MAN: hd('MAN'), ELDER: hd('ELDER'), AMA: hd('AMA')};
    return (
      <Scene bg={SNOWBG} vig={0.4}>
        <AmberLights key1="#fff0e0" rim={2.0} fill={1.2} ambI={0.8} amb="#8a90b8" />
        <directionalLight position={[0, -2, 0]} intensity={0.6} color="#e8ecff" />
        <Ground color="#e8ecf6" size={60} />
        {[[-7, -9], [6, -11], [-3, -16], [9, -6]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.6} color="#3a4a5a" />)}
        {sit
          ? <Person {...YOU} pos={[0, 0, -0.6]} rotY={0.15} sit t={t} look={phone ? [0, -0.8] : [0, 0.2]} mouth="o" brows prop={phone ? 'phone' : null} armRFwd={phone ? 1.15 : 0} armR={phone ? -0.15 : 0} />
          : (low ? null : <group position={[0, 0.18, 0.9]} rotation={[-Math.PI / 2, 0, 0]}><Person {...YOU} pos={[0, 0, 0]} t={0} mouth="o" brows /></group>)}
        {crew.map(([p, k]) => {const q = at(k); return <Person key={k} {...p} pos={[q[0], 0, q[1]]} rotY={rot(q, H)} t={t} kneel={low} lean={LEAN} look={[0, low ? -1 : 0]} mouth={k === 'ELDER' && low ? 'o' : 'line'} prop={!low && k === 'MAN' ? 'spear' : !low && k === 'ELDER' ? 'staff' : null} />;})}
        {!low && <Person {...KID} pos={[1.0, 0, -0.5]} rotY={sit ? -0.4 : rot([1.0, -0.5], H)} t={t} look={[0, -0.3]} />}
        {low
          ? (() => {const tg: V3 = cam === 'pov' ? [0, 3.0, -1.6] : anchors[who] ?? [0, 3.0, -1.6];
              return <Cam p={t / d} t={t} from={[0, 0.3, -1.05]} to={[0.04, 0.32, -1.1]} look={cam === 'pov' ? tg : [tg[0] * 0.8, tg[1], tg[2] * 0.8 + (-1.25) * 0.2]} fov={cam === 'pov' ? 88 : 62} />;})()
          : <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, -1.2]} anchors={anchors} faces={{YOU: 0.15, N: 0.15, KID: -0.4}} spread={0.75} />}
      </Scene>
    );
  }) as SetFn,

  /* day 1: you can't make fire; the kid can */
  fireFail: (({t, d, who, cam, v}) => {
    const lit = has(v, 'kidfire');
    const Y: [number, number] = [-0.75, 0.3], K: [number, number] = [0.8, 0.3];
    return (
      <Scene bg="linear-gradient(#7a8ab8, #c8c0d0 55%, #f0d0b0)" fog={['#c8c0d0', 12, 50]}>
        <AmberLights key1="#ffe0c0" rim={2.2} fill={1.0} amb="#7a7a9a" />
        <Ground color="#b8b0b0" />
        {[[-5, -6], [-1.5, -8], [3, -7], [6, -5]].map(([x, z], i) => <Shelter key={i} pos={[x, 0, z]} rotY={i} s={1.1} />)}
        <Person {...YOU} pos={[Y[0], 0, Y[1]]} rotY={0.65} sit t={t} look={[0.4, -0.6]} armLFwd={1.1} armRFwd={1.1} armL={-0.25} armR={-0.25} brows={!lit} mouth={lit ? 'o' : 'line'} />
        <group position={[Y[0] + 0.36, 0.42, Y[1] + 0.48]} rotation={[0, t * 18, 0]}><mesh><cylinderGeometry args={[0.025, 0.025, 0.65, 6]} /><meshStandardMaterial color="#8a5a30" /></mesh></group>
        <mesh position={[Y[0] + 0.36, 0.05, Y[1] + 0.48]}><boxGeometry args={[0.35, 0.05, 0.14]} /><meshStandardMaterial color="#6a4426" /></mesh>
        <Person {...KID} pos={[K[0], 0, K[1]]} rotY={-0.65} sit t={t} look={[-0.6, -0.3]} mouth={lit ? 'smile' : 'line'} armRFwd={lit ? 0.6 : 0} />
        {lit && <Fire pos={[0.4, 0, 0.95]} t={t} light={6} s={0.55} />}
        <Person {...AMA} pos={[1.9, 0, -0.9]} rotY={-0.5} t={t} look={[-1, -0.2]} />
        <Person {...MAN} pos={[-2.1, 0, -1.0]} rotY={0.45} t={t} prop="spear" armRFwd={0.4} look={[1, -0.2]} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0.4]} spread={0.6}
          anchors={{YOU: head([Y[0], 0, Y[1]], 1, true), N: head([Y[0], 0, Y[1]], 1, true), KID: head([K[0], 0, K[1]], 0.62, true), AMA: head([1.9, 0, -0.9]), MAN: head([-2.1, 0, -1.0])}}
          faces={{YOU: 0.65, N: 0.65, KID: -0.65, AMA: -0.5, MAN: 0.45}} />
      </Scene>
    );
  }) as SetFn,

  /* year 10: the guy who couldn't make fire, on a mammoth-tusk seat */
  throne: (({t, d, who, cam}) => {
    const tribe = useMemo(() => Array.from({length: 16}, (_, i) => [-3.6 + (i % 8) * 1.0, 0, 2.8 + Math.floor(i / 8) * 0.9] as V3), []);
    return (
      <Scene bg="linear-gradient(#ff9a6a 0%, #c0504a 45%, #4a1e2e 100%)">
        <AmberLights key1="#ff9a6a" rim={3.0} fill={0.9} ambI={0.55} amb="#7a3a4a" />
        <Ground color="#4a2430" />
        {[[-5, -5], [-2, -7], [3, -6], [6, -4]].map(([x, z], i) => <Shelter key={i} pos={[x, 0, z]} rotY={i} s={1.1} />)}
        <Fire pos={[-2.2, 0, 1.2]} t={t} light={7} s={0.8} />
        <mesh position={[0, 0.35, -0.2]}><boxGeometry args={[1.6, 0.7, 1.0]} /><meshStandardMaterial color="#5a3a2a" flatShading /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.75, 1.6, -0.5]} rotation={[0, 0, sd * -0.15]}><torusGeometry args={[1.1, 0.09, 10, 24, Math.PI * 0.85]} /><meshStandardMaterial color="#f2e6c8" roughness={0.5} /></mesh>)}
        <group position={[0, 0.7, 0]}>
          <Person {...YOU} pos={[0, 0, 0]} sit t={t} look={[0, 0.1]} smug glint outline="#ffd27a" prop="spear" armRFwd={0.25} />
          <mesh position={[0, 1.0, -0.02]}><coneGeometry args={[0.5, 0.75, 14, 1, true]} /><meshStandardMaterial color="#6a4a2e" side={THREE.DoubleSide} flatShading /></mesh>
        </group>
        <Person {...MAN} pos={[1.7, 0, 0.6]} rotY={-0.45} t={t} prop="spear" armRFwd={0.4} look={[-0.6, 0]} />
        <Crowd positions={tribe} visible={16} color="#3a1e26" head="#1a0e12" s={0.85} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0.6, 0]} spread={0.75}
          anchors={{YOU: head([0, 0.7, 0], 1, true), N: head([0, 0.7, 0], 1, true), MAN: head([1.7, 0, 0.6])}} faces={{YOU: 0, N: 0, MAN: -0.45}} />
      </Scene>
    );
  }) as SetFn,

  /* the coldest winter: starving Neanderthals at the edge of camp */
  neanderArrive: (({t, d, who, cam, v}) => {
    const share = has(v, 'share');
    const YP: [number, number] = share ? [-1.75, 0.4] : [-0.2, 0.5];
    const NC: [number, number] = [-2.55, 0.5];
    return (
      <Scene bg="linear-gradient(#1a1e3a, #4a4a6a 55%, #8a6a7a)" fog={['#5a5a7a', 8, 40]}>
        <AmberLights key1="#ffd0a0" rim={1.8} fill={0.8} ambI={0.6} amb="#6a70a0" />
        <Stars n={300} />
        <Ground color="#c8cce0" />
        {[[-7, -6], [-9, -10], [8, -9]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.6} color="#232c3c" />)}
        <Fire pos={[2.8, 0, -1.4]} t={t} light={9} s={0.9} />
        {[[-3.6, -0.6], [-3.3, 0.9], [-4.3, 0.2]].map(([x, z], i) => <Person key={i} {...BRO} pos={[x, 0, z]} rotY={1.45} t={t + i} look={[0, -0.3]} mouth={share ? 'line' : 'line'} />)}
        <Person {...NCH} pos={[NC[0], 0, NC[1]]} rotY={1.5} t={t} look={[0, share ? 0.3 : -0.2]} armLFwd={share ? 1.1 : 0} mouth={share ? 'smile' : 'line'} />
        <Person {...YOU} pos={[YP[0], 0, YP[1]]} rotY={share ? -1.6 : -1.15} t={t} walk={share && t < 1.5 ? t * 4 : undefined} prop={share ? 'food' : null} armRFwd={share ? 1.15 : 0} look={[share ? 0 : -0.5, 0]} />
        <Person {...MAN} pos={[1.6, 0, -0.2]} rotY={-1.3} t={t} prop="spear" armRFwd={share ? 0.4 : 1.2} look={[-1, 0]} />
        <Person {...AMA} pos={[2.2, 0, 0.9]} rotY={-1.25} t={t} look={[-1, 0]} />
        <Person {...ELDER} pos={[2.9, 0, 0.1]} rotY={-1.3} t={t} prop="staff" look={[-1, 0]} />
        <Person {...KID} pos={share ? [-0.9, 0, 1.0] : [1.9, 0, 1.6]} rotY={share ? -1.5 : -1.2} t={t} prop={share ? 'food' : null} armRFwd={share ? 1.0 : 0} walk={share ? t * 4 : undefined} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[-0.6, 0, 0.2]} spread={0.8}
          anchors={{YOU: head([YP[0], 0, YP[1]]), N: head([YP[0], 0, YP[1]]), MAN: head([1.6, 0, -0.2]), AMA: head([2.2, 0, 0.9]), ELDER: head([2.9, 0, 0.1]), NCH: head([NC[0], 0, NC[1]], 0.6)}}
          faces={{YOU: share ? -1.0 : -0.6, N: share ? -1.0 : -0.6, MAN: -0.9, AMA: -0.9, ELDER: -0.9}} />
      </Scene>
    );
  }) as SetFn,

  /* Monday morning: your bedroom */
  bedroom: (({t, d, who, cam, v}) => {
    const phone = has(v, 'phone');
    return (
      <Scene bg="#2a2430" vig={0.45}>
        <ambientLight intensity={0.55} color="#c8b8d8" />
        <directionalLight position={[-3, 4, 3]} intensity={1.5} color="#ffe2c0" />
        <pointLight position={[1.6, 1.4, 0.6]} intensity={5} color="#ffc890" distance={6} decay={1.4} />
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#6a5048" /></mesh>
        <mesh position={[0, 2.5, -2]}><planeGeometry args={[12, 5]} /><meshStandardMaterial color="#5a6a8a" /></mesh>
        <mesh position={[-3, 2.5, 1]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[8, 5]} /><meshStandardMaterial color="#4e5a78" /></mesh>
        <mesh position={[-1.2, 2.2, -1.98]}><planeGeometry args={[1.4, 1.1]} /><meshBasicMaterial color="#ffd8a8" /></mesh>
        {[-1.2].map((x) => <mesh key={x} position={[x, 2.2, -1.97]}><planeGeometry args={[0.05, 1.1]} /><meshBasicMaterial color="#3a3040" /></mesh>)}
        <mesh position={[0.2, 0.3, -0.6]}><boxGeometry args={[2.2, 0.6, 2.0]} /><meshStandardMaterial color="#e8e4f0" /></mesh>
        <mesh position={[0.2, 0.65, -1.35]}><boxGeometry args={[1.2, 0.2, 0.45]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0.6, 0.62, -0.4]}><boxGeometry args={[1.5, 0.06, 1.4]} /><meshStandardMaterial color="#7a9ad0" /></mesh>
        <mesh position={[1.75, 0.35, -1.3]}><boxGeometry args={[0.6, 0.7, 0.6]} /><meshStandardMaterial color="#8a6a50" /></mesh>
        <mesh position={[1.75, 0.95, -1.3]}><coneGeometry args={[0.2, 0.3, 12]} /><meshBasicMaterial color="#ffe0a0" /></mesh>
        <Person {...YOU} pos={[-0.3, 0.2, 0.25]} rotY={0.25} sit t={t} prop={phone ? 'phone' : null} armRFwd={phone ? 1.15 : 0} armR={phone ? -0.15 : 0} look={phone ? [0, -0.8] : [0.2, 0.1]} mouth={phone ? 'o' : 'line'} brows={phone} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0.4, -0.3]} spread={0.55}
          anchors={{YOU: head([-0.3, 0.2, 0.25], 1, true), N: head([-0.3, 0.2, 0.25], 1, true), MOM: head([-0.3, 0.2, 0.25], 1, true)}} faces={{YOU: 0.25, N: 0.25, MOM: 0.25}} />
      </Scene>
    );
  }) as SetFn,
});

/* ================= 30 days: nights by the fire, and the rain ================= */
Object.assign(SETS, {
  fireNight: (({t, d, who, cam, v}) => {
    const flute = has(v, 'flute'), dance = has(v, 'dance'), story = has(v, 'story');
    const ring = useMemo(() => Array.from({length: 9}, (_, i) => {const a = (i / 9) * Math.PI * 2 + 0.35; return [Math.cos(a) * 2.6, Math.sin(a) * 2.6, a] as [number, number, number];}), []);
    const who2: (PersonProps | null)[] = [YOU, AMA, MAN, KID, ELDER, BOY, GRAN, MAN, AMA];
    const key = ['YOU', 'AMA', 'MAN', 'KID', 'ELDER', 'BOY', 'GRAN', '', ''];
    const anchors: Record<string, V3> = {}, faces: Record<string, number> = {};
    ring.forEach(([x, z], i) => {
      const k = key[i]; if (!k) return;
      const standing = dance ? i % 2 === 0 || k === 'YOU' || k === 'MAN' : story && k === 'ELDER';
      const p = who2[i]!; anchors[k] = head([x, 0, z], (p.s as number) ?? 1, !standing); faces[k] = Math.atan2(-x, -z) + 0.35;
    });
    anchors.N = anchors.YOU; faces.N = faces.YOU;
    return (
      <Scene bg="linear-gradient(#070818, #1c1838 60%, #3a2440)">
        <AmberLights rim={1.4} fill={0.6} ambI={0.5} />
        <Stars n={500} />
        <Ground color="#241c22" />
        {[[-5, -6], [5, -7], [-8, -9], [8, -10], [0, -11]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.6} color="#161c2a" />)}
        <Fire pos={[0, 0, 0]} t={t} light={14} s={dance ? 1.3 : 1.1} />
        {ring.map(([x, z], i) => {
          const p = who2[i]!; const k = key[i];
          const standing = dance ? i % 2 === 0 || k === 'YOU' || k === 'MAN' : story && k === 'ELDER';
          const sway = dance ? Math.sin(t * 5 + i) * 0.25 : 0;
          return <Person key={i} {...p} pos={[x, 0, z]} rotY={Math.atan2(-x, -z) + sway} sit={!standing} t={t + i}
            armL={dance && standing ? 2.3 + Math.sin(t * 6 + i) * 0.3 : 0} armR={dance && standing ? 2.3 + Math.cos(t * 6 + i) * 0.3 : 0}
            armRFwd={(story && k === 'ELDER') || (flute && k === 'AMA') ? 1.3 : 0} armLFwd={flute && k === 'AMA' ? 1.2 : 0}
            prop={story && k === 'ELDER' ? 'staff' : null} mouth={dance || story ? 'smile' : 'line'} />;
        })}
        {flute && (() => {const [x, z] = ring[1]; const a = Math.atan2(-x, -z); return <mesh position={[x + Math.sin(a) * 0.32, 1.72, z + Math.cos(a) * 0.32]} rotation={[0, a, Math.PI / 2 - 0.3]}><cylinderGeometry args={[0.025, 0.025, 0.42, 8]} /><meshStandardMaterial color="#f2ead8" /></mesh>;})()}
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0]} spread={0.7} anchors={anchors} faces={faces} />
      </Scene>
    );
  }) as SetFn,

  rainCamp: (({t, d, who, cam}) => {
    const huddle: [PersonProps, [number, number], string, number][] = [[YOU, [-0.6, 0.2], 'YOU', 0.5], [AMA, [0.6, 0.1], 'AMA', -0.5], [KID, [0.05, 0.9], 'KID', 0], [MAN, [-1.6, -0.6], 'MAN', 0.9], [ELDER, [1.6, -0.5], 'ELDER', -0.9]];
    const anchors: Record<string, V3> = {}, faces: Record<string, number> = {};
    huddle.forEach(([p, [x, z], k, r]) => {anchors[k] = head([x, 0, z], (p.s as number) ?? 1, true); faces[k] = r;});
    anchors.N = anchors.YOU; faces.N = faces.YOU;
    return (
      <Scene bg="linear-gradient(#3a4250, #5a6070 60%, #7a7a80)" fog={['#5a6070', 6, 30]}>
        <ambientLight intensity={0.85} color="#a8b0c0" />
        <directionalLight position={[2, 6, 3]} intensity={0.9} color="#d0d8e8" />
        <pointLight position={[0, 1.2, 0.6]} intensity={4} color="#ffb070" distance={5} decay={1.4} />
        <Ground color="#3a3a38" />
        <mesh position={[0, 2.3, -0.2]} rotation={[0.25, 0, 0]}><boxGeometry args={[5.4, 0.08, 3.4]} /><meshStandardMaterial color="#6a4a32" flatShading /></mesh>
        {[[-2.5, -1.6], [2.5, -1.6], [-2.5, 1.3], [2.5, 1.3]].map(([x, z], i) => <mesh key={i} position={[x, 1.1, z]}><cylinderGeometry args={[0.06, 0.07, 2.4, 6]} /><meshStandardMaterial color="#4a3020" /></mesh>)}
        <Fire pos={[0, 0, 0.5]} t={t} light={0} s={0.45} />
        {huddle.map(([p, [x, z], k, r]) => <Person key={k} {...p} pos={[x, 0, z]} rotY={r} sit t={t} look={[0, -0.2]} />)}
        <Rain t={t} n={420} area={18} />
        <Camera cam={cam} t={t} d={d} who={who} focus={[0, 0, 0.2]} spread={0.6} anchors={anchors} faces={faces} />
      </Scene>
    );
  }) as SetFn,
});
