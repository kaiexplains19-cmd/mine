import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {
  AmberLights, Acacia, Antelope, Cam, Crowd, Fire, Ground, Gym, Helix, Person, Pine, Rain, Robin, Rock, Shelter, Stars, Torch,
  V3, clamp, ease, lerp, rand,
} from './kit';

type ShotP = {t: number; d: number};
const TALA = {outfit: '#b0562a', trim: '#5a2e14'};
const ORO = {kind: 'elder' as const, outfit: '#6e655a', trim: '#a89a6a'};
const PIP = {kind: 'child' as const, outfit: '#c49a62', trim: '#7a5a34', s: 0.6};
const VIEWER = {kind: 'modern' as const, outfit: '#d9a531'};
const BRAK = {kind: 'neander' as const, outfit: '#5a3a22', trim: '#2e1c10'};

const Scene: React.FC<{bg: string; children: React.ReactNode; fog?: [string, number, number]; vignette?: number}> = ({bg, children, fog, vignette = 0.55}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: bg}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 42, near: 0.1, far: 200, position: [0, 2, 8]}}>
        {fog && <fog attach="fog" args={fog} />}
        {children}
      </ThreeCanvas>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,4,16,${vignette}) 100%)`}} />
    </AbsoluteFill>
  );
};

const NIGHT = 'linear-gradient(#0a0b22 0%, #1f1a44 55%, #3a2448 100%)';
const DUSK = 'linear-gradient(#24163e 0%, #6a3550 45%, #e0783a 80%, #ffb45a 100%)';
const GYMBG = 'linear-gradient(#1a1230, #2a1d3a)';

const bandSeats = (n: number, r: number, seed: number) => {
  const R = rand(seed);
  return Array.from({length: n}, (_, i) => {const a = (i / n) * Math.PI * 2 + R() * 0.2; return [Math.cos(a) * r, 0, Math.sin(a) * r, a] as [number, number, number, number];});
};

export const SHOTS: Record<string, React.FC<ShotP>> = {
  gymEmpty: ({t, d}) => (
    <Scene bg={GYMBG}>
      <AmberLights rimPos={[0, 9, -11]} rim={2.6} fill={0.8} />
      <Gym t={t} />
      <Person {...VIEWER} pos={[0, 0, 0]} t={t} look={[0, 1]} />
      <Cam p={t / d} t={t} from={[0, 1.5, 7.5]} to={[0, 1.7, 5.6]} look={[0, 1.9, -2]} fov={44} />
    </Scene>
  ),
  gymPacked: ({t, d}) => (
    <Scene bg={GYMBG}>
      <AmberLights rimPos={[0, 9, -11]} rim={2.6} fill={0.9} />
      <Gym t={t} crowd={ease(t / 0.9) * 306} />
      <Person {...VIEWER} pos={[0, 0, 0]} rotY={lerp(-0.4, 0.5, ease(t / d))} t={t} look={[0.6, 1]} mouth="o" />
      <Cam p={t / d} t={t} from={[7, 6.5, 8]} to={[5.2, 5.6, 7]} look={[0, 1.5, -4]} fov={46} />
    </Scene>
  ),
  climb: ({t, d}) => {
    const z = lerp(4, 0.5, ease(t / d));
    return (
      <Scene bg={NIGHT}>
        <AmberLights rim={1.2} fill={0.35} ambI={0.35} />
        <Stars />
        <Ground color="#1e1630" />
        <mesh rotation={[-Math.PI / 2 + 0.18, 0, 0]} position={[0, 0.6, -6]}><planeGeometry args={[2.4, 30]} /><meshStandardMaterial color="#4a3324" /></mesh>
        {Array.from({length: 7}).map((_, i) => [-1, 1].map((sd) => <Torch key={i + '_' + sd} pos={[sd * 1.5, 0.15 + i * 0.75, 3 - i * 4]} t={t} on={1} light={i < 3 && sd > 0} />))}
        {[[-3, -6], [3.2, -10], [-3.5, -15], [3.4, -19]].map(([x, zz], i) => <Person key={i} pos={[x, 0.8 + i * 0.6, zz]} s={0.9} outfit="#6a4030" t={t + i} rotY={0.3} />)}
        <Person {...TALA} pos={[0, (4 - z) * 0.18, z]} rotY={Math.PI} t={t} walk={t * 6} prop="spear" />
        <Cam p={t / d} t={t} from={[4.5, 2.2, 7]} to={[3.5, 2.6, 4.2]} look={[0, 1.4, z - 2]} fov={46} />
      </Scene>
    );
  },
  torchesOut: ({t, d}) => (
    <Scene bg={NIGHT}>
      <AmberLights rim={0.9} fill={0.3} ambI={0.3} />
      <Stars />
      <Ground color="#1a1328" />
      <mesh rotation={[-Math.PI / 2 + 0.18, 0, 0]} position={[0, 0.6, -6]}><planeGeometry args={[2.4, 30]} /><meshStandardMaterial color="#3e2b1f" /></mesh>
      {Array.from({length: 7}).map((_, i) => [-1, 1].map((sd) => {
        const off = i < 2 ? 1 : 1 - clamp((t - 0.3 - (i - 2) * 0.35) / 0.25);
        return <Torch key={i + '_' + sd} pos={[sd * 1.5, 0.15 + i * 0.75, 3 - i * 4]} t={t} on={off} light={i < 2 && sd > 0} />;
      }))}
      <Person {...TALA} pos={[0, 0.6, 0.5]} rotY={Math.PI} t={t} prop="spear" armRFwd={lerp(0, 1.3, ease((t - 1.2) / 0.6))} />
      <Cam p={t / d} t={t} from={[3, 2.2, 5.5]} to={[2.4, 2.1, 4.4]} look={[0, 1.6, -5]} fov={44} />
    </Scene>
  ),
  camp: ({t, d}) => {
    const seats = bandSeats(10, 1.9, 4);
    return (
      <Scene bg={DUSK}>
        <AmberLights key1="#ff9a4a" rimPos={[-6, 3, -8]} rim={2.6} fill={0.6} />
        <Ground color="#5a3a2a" />
        <Shelter pos={[-3, 0, -3]} rotY={0.6} /><Shelter pos={[3.2, 0, -3.6]} rotY={-0.5} s={1.1} /><Shelter pos={[0.4, 0, -5]} s={0.9} />
        <Acacia pos={[-6, 0, -9]} s={1.3} /><Acacia pos={[6.5, 0, -11]} s={1.1} />
        <Fire pos={[0, 0, 0]} t={t} light={9} />
        {seats.map(([x, , z, a], i) => <Person key={i} pos={[x, 0, z]} rotY={-a - Math.PI / 2} sit outfit={i % 3 ? '#7a4a2e' : '#9a6a3a'} t={t + i} s={i === 3 ? 0.65 : 0.95} kind={i === 3 ? 'child' : 'adult'} />)}
        <Person {...ORO} pos={[0.6, 0, 2.6]} rotY={Math.PI * 0.9} t={t} armRFwd={1.25} armR={0.1 + 0.25 * Math.sin(t * 2.2)} prop={null} />
        <Cam p={t / d} t={t} from={[0, 4.5, 7]} to={[0, 6.5, 10.5]} look={[0, 0.6, -0.5]} fov={44} />
      </Scene>
    );
  },
  seasons: ({t, d}) => {
    const p = t / d; const cool = Math.sin(p * Math.PI * 2) * 0.5 + 0.5;
    const key1 = `hsl(${lerp(32, 220, cool)}, 70%, ${lerp(62, 70, cool)}%)`;
    const bg = cool > 0.5 ? 'linear-gradient(#141c3a, #2a3a5e 60%, #6a7aa0)' : DUSK;
    return (
      <Scene bg={bg}>
        <AmberLights key1={key1} rim={2.4} fill={0.6} />
        <Ground color={cool > 0.5 ? '#4a4a5a' : '#5a3a2a'} />
        <Shelter pos={[-2.4, 0, -2.5]} rotY={0.6} color={cool > 0.5 ? '#7a6a6a' : '#9a6a42'} /><Shelter pos={[2.6, 0, -3]} rotY={-0.5} />
        <Acacia pos={[5, 0, -8]} />
        <Fire pos={[0.2, 0, -0.6]} t={t} light={6} />
        <Person {...ORO} pos={[0.9, 0, -1.2]} rotY={-0.5} sit t={t} />
        <Person {...PIP} s={lerp(0.52, 0.85, ease(p))} pos={[-0.8, 0, 1.2]} rotY={0.2} t={t} prop="toy" armRFwd={0.6} look={[0.3, 0.3]} />
        <Cam p={p} t={t} from={[0, 1.8, 6.2]} to={[0, 1.9, 5.4]} look={[0, 1, 0]} fov={44} />
      </Scene>
    );
  },
  drought: ({t, d}) => {
    const cracks = useMemo(() => {const R = rand(21); return Array.from({length: 46}, () => [R() * 12 - 6, R() * 12 - 9, R() * Math.PI, 0.4 + R() * 1.6]);}, []);
    return (
      <Scene bg="linear-gradient(#5a2e3a, #c0683a 60%, #f0a050)">
        <AmberLights key1="#ffb060" rim={2.4} fill={0.9} />
        <Ground color="#8a5a3a" />
        {cracks.map(([x, z, r, l], i) => <mesh key={i} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, r]}><planeGeometry args={[l, 0.035]} /><meshBasicMaterial color="#3a2018" /></mesh>)}
        {[-4, 3.5, 5].map((x, i) => <mesh key={i} position={[x, 0.5, -6 - i]}><cylinderGeometry args={[0.02, 0.03, 1, 4]} /><meshStandardMaterial color="#3a2a1a" /></mesh>)}
        <Person {...TALA} pos={[0, 0, 0]} kneel rotY={0.3} t={t} armRFwd={1.0} armR={-0.1} look={[0.2, -1]} />
        <mesh position={[0.8, 0.05, 0.4]} rotation={[0, 0.4, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.03, 2.2, 6]} /><meshStandardMaterial color="#8a5a30" /></mesh>
        {Array.from({length: 18}).map((_, i) => {const x = ((i * 1.7 + t * 2.2) % 12) - 6; return <mesh key={i} position={[x, 0.3 + (i % 5) * 0.25, -1 + (i % 4)]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color="#e8b88a" transparent opacity={0.5} /></mesh>;})}
        <Cam p={t / d} t={t} from={[2.4, 1.3, 5.2]} to={[2.0, 1.25, 4.5]} look={[0, 0.8, 0]} fov={46} />
      </Scene>
    );
  },
  herd: ({t, d}) => (
    <Scene bg="linear-gradient(#3a2448, #a0503a 65%, #e88a4a)" fog={['#a05a4a', 8, 40]}>
      <AmberLights rim={2} fill={0.6} />
      <Ground color="#4a3326" />
      {[[-4, -8], [-6, -14], [5, -10], [7, -16], [-2, -20], [3, -24]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.2} color="#2a2236" />)}
      {Array.from({length: 7}).map((_, i) => <Antelope key={i} t={t + i * 0.3} pos={[-2 + (i % 4) * 1.3, 0, -6 - t * 6 - (i % 3) * 1.4]} rotY={Math.PI} s={0.9} />)}
      <Person {...TALA} pos={[1.3, 0, 1.0]} rotY={Math.PI} t={t} prop="spear" armRFwd={lerp(1.1, 0.1, ease(t / d))} />
      <Cam p={t / d} t={t} from={[2.8, 2.9, 6.4]} to={[2.5, 2.8, 5.8]} look={[-0.5, 1.0, -8]} fov={46} />
    </Scene>
  ),
  flood: ({t, d}) => {
    const p = t / d; const wy = lerp(-0.2, 0.55, ease(p));
    return (
      <Scene bg="linear-gradient(#06081a, #141a3a 60%, #22294a)">
        <AmberLights key1="#8aa0ff" rim={1.4} fill={0.45} amb="#2a2a5e" />
        <Ground color="#1c1a2a" />
        <Rock pos={[1.6, 0.4, -0.6]} s={[1.6, 1.5, 1.4]} color="#3a3550" />
        <Shelter pos={[-3, 0, -3]} rotY={0.4} color="#5a4a3a" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wy, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#2c3a6a" emissive="#0a1230" transparent opacity={0.9} roughness={0.3} /></mesh>
        {[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-3 + i * 2, wy + 0.01, ((t * 1.5 + i) % 4) - 2]}><planeGeometry args={[1.6, 0.06]} /><meshBasicMaterial color="#8aa0d0" transparent opacity={0.5} /></mesh>)}
        <Rain t={t} />
        <Person {...PIP} pos={[1.5, lerp(0.6, 1.25, ease(t / 1.6)), -0.6]} rotY={0.3} t={t} prop="toy" look={[0, -0.5]} mouth="o" />
        <Person {...ORO} pos={[0.7, wy * 0.2, 0.3]} rotY={0.9} t={t} armRFwd={1.3} armLFwd={1.3} armR={0.2} armL={0.2} />
        <Person {...TALA} pos={[-1, wy - 0.25, 1.2]} rotY={0.4} t={t} prop="spear" lean={0.15} armRFwd={0.3} look={[0.5, 0.5]} />
        <Cam p={p} t={t} shake={0.03} from={[0.5, 1.7, 6]} to={[0.4, 1.8, 5.2]} look={[0.3, 1, 0]} fov={46} />
      </Scene>
    );
  },
  shelter: ({t, d}) => {
    const lean = 0.12 * ease(t / (d * 0.7));
    return (
      <Scene bg="#140a14" vignette={0.75}>
        <AmberLights rim={0.6} fill={0.2} ambI={0.25} />
        <mesh position={[0, 0, -0.5]}><sphereGeometry args={[4.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#6a3e24" side={THREE.BackSide} roughness={1} /></mesh>
        <Ground color="#2a1a14" size={12} />
        <Fire pos={[0, 0, 0.9]} t={t} s={0.6} light={7} />
        <Person {...TALA} pos={[-0.7, 0, 0]} rotY={Math.PI / 2 - 0.3} sit t={t} lean={lean} look={[1, 0]} />
        <Person {...ORO} pos={[0.7, 0, 0]} rotY={-Math.PI / 2 + 0.3} sit t={t} lean={lean} look={[-1, 0]} />
        <Cam p={t / d} t={t} from={[0, 1.6, 4.2]} to={[0, 1.55, 3.3]} look={[0, 1.15, 0]} fov={42} />
      </Scene>
    );
  },
  coast: ({t, d}) => {
    const hop = Math.max(0, Math.sin(Math.max(0, t - 1.5) * 5)) * (t > 1.5 && t < 2.2 ? 0.25 : 0);
    return (
      <Scene bg="linear-gradient(#3a3a5a, #7a6a7a 55%, #e0a070)">
        <AmberLights key1="#ffc080" rim={2.2} fill={0.9} amb="#4a4a6a" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -10]}><planeGeometry args={[80, 60]} /><meshStandardMaterial color="#3a4a6a" roughness={0.5} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4 + i * 2.2, -0.18, -3 - ((t * 0.8 + i * 0.9) % 8)]}><planeGeometry args={[1.8, 0.07]} /><meshBasicMaterial color="#cfd6e8" transparent opacity={0.45} /></mesh>)}
        <Rock pos={[0, -0.1, 0]} s={[1.6, 0.9, 1.3]} color="#5a5a62" />
        <Rock pos={[-2.5, -0.2, -2]} s={[1.4, 1, 1.2]} color="#4a4a55" />
        <mesh position={[0.2, 0.42, 0.2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 12]} /><meshStandardMaterial color="#8a9a5a" /></mesh>
        <Robin pos={[-0.25, 0.7 + hop, 0.15]} t={t} rotY={0.5} band />
        <Robin pos={[0.35, 0.68, 0.0]} t={t} rotY={-0.5} />
        <Cam p={t / d} t={t} from={[0, 1.1, 3.2]} to={[0, 1.0, 2.4]} look={[0, 0.7, 0]} fov={40} />
      </Scene>
    );
  },
  flight: ({t, d}) => (
    <Scene bg="linear-gradient(#4a3a6a, #c07a5a 55%, #ffc070)">
      <AmberLights key1="#ffd090" rim={2.4} fill={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -10]}><planeGeometry args={[80, 60]} /><meshStandardMaterial color="#4a5a7a" roughness={0.5} /></mesh>
      <Rock pos={[0, -0.1, 0]} s={[1.6, 0.9, 1.3]} color="#5a5a62" />
      <Robin pos={[0, 0.7 + ease(t / 1.5) * 3.2, -ease(t / 2) * 1.5]} t={t} flap={1} band rotY={Math.PI} />
      {Array.from({length: 9}).map((_, i) => {
        const st = 0.6 + i * 0.35; const k = clamp((t - st) / 2.5);
        return k > 0 ? <Robin key={i} s={0.8} pos={[(i % 3 - 1) * 1.2 + Math.sin(i) * 0.5, 0.5 + k * (3 + i * 0.25), -1 - i * 0.6 - k * 2]} t={t + i} flap={1} rotY={Math.PI} /> : null;
      })}
      <Cam p={t / d} t={t} from={[0, 1.2, 4.8]} to={[0, 2.4, 5.2]} look={[0, 2, -1]} look2={[0, 3.2, -2]} fov={50} />
    </Scene>
  ),
  ridge: ({t, d}) => {
    const fires = useMemo(() => {const R = rand(31); return Array.from({length: 70}, () => [R() * 40 - 20, -6, -8 - R() * 40] as [number, number, number]);}, []);
    const p = t / d;
    return (
      <Scene bg="linear-gradient(#1a1838, #6a3a5a 50%, #ff9a5a 85%, #ffd08a)">
        <AmberLights key1="#ffb070" rimPos={[0, 3, -10]} rim={3} fill={0.4} />
        <mesh position={[0, -6.2, -20]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[120, 80]} /><meshStandardMaterial color="#2a1a2a" /></mesh>
        {fires.map((f, i) => <mesh key={i} position={f}><sphereGeometry args={[0.12 + (i % 3) * 0.05, 8, 8]} /><meshBasicMaterial color={i % 2 ? '#ffb040' : '#ff7a2a'} /></mesh>)}
        <mesh position={[0, -3.2, 0]}><sphereGeometry args={[4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#1e1420" /></mesh>
        {[[-0.9, 0], [0, 0.3], [0.8, 0.1]].map(([x, dz], i) => (
          <Person key={i} {...(i === 0 ? ORO : i === 1 ? TALA : PIP)} pos={[x, 0.75, 1.6 - ease(p) * 1.2 + dz]} rotY={Math.PI} t={t} walk={t * 5 + i} prop={i === 1 ? 'spear' : i === 2 ? 'toy' : 'staff'} />
        ))}
        <Cam p={p} t={t} from={[0, 1.2, 6]} to={[0, 2.2, 6.4]} look={[0, 1.6, 0]} look2={[0, 0.2, -10]} fov={46} />
      </Scene>
    );
  },
  clearing: ({t, d}) => {
    const p = t / d;
    return (
      <Scene bg="linear-gradient(#2a3a4a, #6a6a7a 55%, #d0a07a)" fog={['#7a7480', 3, 16]}>
        <AmberLights key1="#ffc080" rim={2.4} fill={0.6} />
        <Ground color="#3a4038" />
        {[[-3, -3], [3.5, -4], [-5, -7], [5, -8], [-1.5, -9], [1.8, -12], [-4, -12]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.5} color="#24323a" />)}
        <Person {...BRAK} pos={[1.1, 0, lerp(-6, -1.2, ease(p * 1.3))]} rotY={-0.4} t={t} walk={p < 0.75 ? t * 5 : undefined} prop="axe" look={[-0.5, 0]} />
        <Person {...TALA} pos={[-1, 0, 1]} rotY={0.6} t={t} prop="food" armRFwd={lerp(0.1, 1.2, ease((t - 1.6) / 0.8))} look={[0.6, 0]} />
        <Cam p={p} t={t} from={[-0.3, 1.8, 7.4]} to={[0, 1.8, 6.6]} look={[0.1, 1.3, -1]} fov={46} />
      </Scene>
    );
  },
  sharedFire: ({t, d}) => {
    const a = lerp(-0.25, 0.25, ease(t / d));
    return (
      <Scene bg="linear-gradient(#141030, #2a1c3a)">
        <AmberLights rim={1.2} fill={0.35} ambI={0.35} />
        <Stars />
        <Ground color="#2a2220" />
        {[[-4, -4], [4, -5], [-6, -8]].map(([x, z], i) => <Pine key={i} pos={[x, 0, z]} s={1.4} color="#1a2230" />)}
        <Fire pos={[0, 0, 0]} t={t} light={10} />
        <Person {...BRAK} pos={[1.3, 0, -0.3]} rotY={-1.3} sit t={t} look={[-1, 0]} mouth="smile" />
        <Person {...TALA} pos={[-1.3, 0, -0.3]} rotY={1.3} sit t={t} look={[1, 0]} mouth="smile" />
        <Person kind="child" outfit="#9a6a3a" trim="#5a3a20" s={0.55} pos={[0, 0, -1.2]} sit t={t} look={[Math.sin(t * 1.2), 0]} />
        <Person {...PIP} s={0.75} pos={[-0.9, 0, 1.0]} rotY={2.6} sit t={t} prop="toy" />
        <Cam p={t / d} t={t} from={[Math.sin(a) * 7, 2.6, Math.cos(a) * 7]} to={[Math.sin(a) * 6.2, 2.4, Math.cos(a) * 6.2]} look={[0, 0.8, -0.3]} fov={44} />
      </Scene>
    );
  },
  dna: ({t, d}) => (
    <Scene bg="radial-gradient(#2a1a4a, #0c0820)">
      <ambientLight intensity={0.6} color="#6a4a9a" />
      <pointLight position={[3, 2, 4]} intensity={30} color="#ffb070" decay={1.5} />
      <Helix t={t} hot={clamp((t - 2.6) / 0.5)} />
      <Person {...BRAK} pos={[2.1, -1.6, -1]} rotY={-0.5} t={t} s={0.9} look={[-1, 0]} />
      <Person {...TALA} pos={[-2.1, -1.6, -1]} rotY={0.5} t={t} s={0.9} look={[1, 0]} />
      <Cam p={t / d} t={t} from={[0, 0.5, 9]} to={[0, 0.3, 7.6]} look={[0, 0.2, 0]} fov={50} />
    </Scene>
  ),
  gymFade: ({t, d}) => (
    <Scene bg={GYMBG}>
      <AmberLights rimPos={[0, 9, -11]} rim={2.4} fill={0.8} />
      <Gym t={t} crowd={306 * (1 - ease(t / (d * 0.85)))} />
      <Person {...VIEWER} pos={[0, 0, 0]} t={t} look={[0, 1]} />
      <Cam p={t / d} t={t} from={[-6, 7, 9]} to={[-4.8, 6.2, 8]} look={[0, 1, -3]} fov={46} />
    </Scene>
  ),
  viewerClose: ({t, d}) => {
    const lookUp = t < d * 0.55;
    return (
      <Scene bg={GYMBG}>
        <AmberLights rimPos={[0, 9, -11]} rim={2.6} fill={1.0} />
        <Gym t={t} />
        <Person {...VIEWER} pos={[0, 0, 0]} t={t} armRFwd={lerp(0, 1.45, ease(t / 1.2))} armR={-0.25} look={lookUp ? [0.6, -0.6] : [0, 0]} />
        <Cam p={t / d} t={t} from={[0.4, 1.95, 3.0]} to={[0.15, 2.0, 2.2]} look={[0.05, 1.95, 0]} fov={40} />
      </Scene>
    );
  },
  question: ({t, d}) => {
    const seats = bandSeats(12, 2.1, 8);
    return (
      <Scene bg={NIGHT}>
        <AmberLights rim={1.1} fill={0.3} ambI={0.35} />
        <Stars />
        <Ground color="#221a2a" />
        <Fire pos={[0, 0, 0]} t={t} light={10} />
        {seats.map(([x, , z, a], i) => <Person key={i} pos={[x, 0, z]} rotY={-a - Math.PI / 2} sit outfit={i % 2 ? '#7a4a2e' : '#9a6a3a'} t={t + i} s={0.95} />)}
        <Cam p={t / d} t={t} from={[0, 3.5, 8.5]} to={[0, 3, 7]} look={[0, 0.6, 0]} fov={44} />
      </Scene>
    );
  },
};
