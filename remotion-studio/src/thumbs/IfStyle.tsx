import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {AmberLights, Cam, Crowd, Fire, Ground, Helix, Person, Stars, V3} from '../v01/kit';
import {Rhino} from '../v07/sets';

const {fontFamily: MONT} = loadMont('normal', {weights: ['900']});
const {fontFamily: HAND} = loadCaveat('normal', {weights: ['700']});

/* ---- Ifverse-formula building blocks ---- */
const Headline: React.FC<{l1: string; l2: string; c2?: string; size?: number}> = ({l1, l2, c2 = '#ffd21f', size = 132}) => (
  <div style={{position: 'absolute', left: 40, top: 26, lineHeight: 0.98, fontFamily: MONT, fontWeight: 900, letterSpacing: -2,
    filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.55)) drop-shadow(0 0 18px rgba(0,0,0,.6))'}}>
    <div style={{fontSize: size, color: '#ffffff', WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill'}}>{l1}</div>
    <div style={{fontSize: size, color: c2, WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill'}}>{l2}</div>
  </div>
);
const Pill: React.FC<{text: string; x: number; y: number; bg?: string}> = ({text, x, y, bg = '#e5322d'}) => (
  <div style={{position: 'absolute', left: x, top: y, background: bg, color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 34,
    padding: '6px 18px', borderRadius: 10, boxShadow: '0 4px 0 rgba(0,0,0,.5)'}}>{text}</div>
);
const RimGlow: React.FC<{x: number; y: number; r: number; color: string}> = ({x, y, r, color}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 62%)`, opacity: 0.85}} />
);
const Bokeh: React.FC<{seed?: number; color?: string}> = ({seed = 1, color = '#ffb45a'}) => {
  const dots = Array.from({length: 22}, (_, i) => {
    const r = Math.sin(seed * 99 + i * 12.9898) * 43758.5453; const f = r - Math.floor(r);
    const g = Math.sin(seed * 7 + i * 78.233) * 12345.678; const h = g - Math.floor(g);
    return {x: f * 1280, y: h * 720, s: 6 + ((f * 37) % 18)};
  });
  return <>{dots.map((d, i) => <div key={i} style={{position: 'absolute', left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: '50%', background: color, opacity: 0.35, filter: 'blur(1.5px)'}} />)}</>;
};

const Mammoth: React.FC<{pos: V3; s?: number; rotY?: number}> = ({pos, s = 1, rotY = 0}) => (
  <group position={pos} scale={s} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.7, 0]} scale={[1.1, 1, 1.5]}><sphereGeometry args={[1.1, 18, 14]} /><meshStandardMaterial color="#3a2420" flatShading /></mesh>
    <mesh position={[0, 2.5, -0.3]} scale={[0.9, 0.5, 1.2]}><sphereGeometry args={[0.8, 14, 10]} /><meshStandardMaterial color="#3a2420" flatShading /></mesh>
    <mesh position={[0, 2.1, 1.55]}><sphereGeometry args={[0.7, 16, 12]} /><meshStandardMaterial color="#3a2420" flatShading /></mesh>
    <mesh position={[0, 1.2, 2.0]} rotation={[0.25, 0, 0]}><cylinderGeometry args={[0.16, 0.26, 1.6, 10]} /><meshStandardMaterial color="#3a2420" /></mesh>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[sd * 0.35, 1.5, 2.0]} rotation={[Math.PI / 2, sd * 0.4, 0]}><torusGeometry args={[0.7, 0.07, 8, 20, Math.PI * 0.8]} /><meshStandardMaterial color="#efe3c6" /></mesh>
    ))}
    {[[-0.5, 0.8], [0.5, 0.8], [-0.5, -0.8], [0.5, -0.8]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.55, z]}><cylinderGeometry args={[0.28, 0.3, 1.1, 10]} /><meshStandardMaterial color="#2e1c18" /></mesh>
    ))}
    <mesh position={[0.45, 2.3, 1.95]}><circleGeometry args={[0.08, 12]} /><meshBasicMaterial color="#ffcf6b" /></mesh>
  </group>
);

/* glowing chalk "genius" doodles on the cave wall */
const Doodles: React.FC = () => (
  <svg width="1280" height="720" style={{position: 'absolute', left: 0, top: 0}}>
    <defs><filter id="gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    <g filter="url(#gl)" stroke="#ffcf7a" fill="none" strokeWidth="5" strokeLinecap="round" opacity="0.95">
      <circle cx="150" cy="520" r="70" /><circle cx="150" cy="520" r="10" />
      {Array.from({length: 8}).map((_, i) => {const a = (i * Math.PI) / 4; return <line key={i} x1={150} y1={520} x2={150 + Math.cos(a) * 70} y2={520 + Math.sin(a) * 70} />;})}
      <path d="M300 640 Q340 520 300 420" /><line x1="300" y1="420" x2="300" y2="640" strokeWidth="2.5" /><line x1="270" y1="530" x2="420" y2="530" /><path d="M420 530 l-18 -10 m18 10 l-18 10" />
      <path d="M470 640 q30 -60 90 -50 q60 10 70 50 m-150 0 l0 30 m40 -30 l0 30 m60 -30 l0 30 m40 -30 l0 30 M630 590 q30 10 25 50" />
    </g>
    <g filter="url(#gl)" fill="#ffcf7a" fontFamily={HAND} fontWeight={700}>
      <text x="60" y="400" fontSize="64">E = mc²</text>
      <text x="380" y="380" fontSize="54">∫ f(x) dx</text>
      <text x="470" y="470" fontSize="44">F = ma</text>
    </g>
  </svg>
);

const caveBg = 'linear-gradient(#0d0716 0%, #23122a 60%, #3a1e24 100%)';
const CaveSet: React.FC = () => (
  <>
    <mesh position={[0, 0, -1]}><sphereGeometry args={[9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#3a2430" side={THREE.BackSide} roughness={1} /></mesh>
    <Ground color="#2a1a1e" size={30} />
  </>
);

/* ★2 · variant A: "500 IQ. / NO TOOLS." */
export const IQ_A: React.FC = () => (
  <AbsoluteFill style={{background: caveBg}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 30, position: [0, 2, 3]}}>
      <AmberLights rimPos={[3, 3, -3]} rim={3.6} fill={0.7} key1="#ffb460" />
      <pointLight position={[-1.5, 1, 1.5]} intensity={8} color="#ff8a3c" distance={8} decay={1.3} />
      <CaveSet />
      <Person outfit="#b0562a" trim="#5a2e14" pos={[0, 0, 0]} rotY={-0.25} t={0} look={[-0.6, 0]} smug glint outline="#ffb45a" />
      <Cam p={0} from={[-0.72, 2.0, 2.05]} to={[-0.72, 2.0, 2.05]} look={[-0.72, 1.98, 0]} fov={36} />
    </ThreeCanvas>
    <RimGlow x={900} y={330} r={330} color="rgba(255,170,80,.35)" />
    <Doodles />
    <Bokeh seed={3} />
    <Headline l1="500 IQ." l2="NO TOOLS." />
    <Pill text="50,000 BC" x={1020} y={630} />
  </AbsoluteFill>
);

/* ★2 · variant B: "TOO / EASY?" with a mammoth charging behind */
export const IQ_B: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#0a0c22 0%, #2a1a3e 55%, #6a2e2a 100%)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
      <AmberLights rimPos={[-4, 4, -5]} rim={3.4} fill={0.6} />
      <Stars n={300} />
      <Ground color="#1e1626" />
      <Mammoth pos={[-2.4, 0, -6.5]} s={1.15} rotY={1.35} />
      <Fire pos={[-3.6, 0, -3.5]} t={0.2} light={7} s={0.7} />
      <Person outfit="#b0562a" trim="#5a2e14" pos={[0.9, 0, 0]} rotY={-0.35} t={0} look={[-0.5, 0]} smug glint outline="#8fb0ff" prop="spear" armRFwd={0.15} />
      <Cam p={0} from={[0.25, 2.0, 2.2]} to={[0.25, 2.0, 2.2]} look={[-0.15, 1.75, -1]} fov={40} />
    </ThreeCanvas>
    <RimGlow x={960} y={300} r={300} color="rgba(120,160,255,.28)" />
    <Bokeh seed={8} color="#9ab4ff" />
    <Headline l1="TOO" l2="EASY?" size={150} />
    <Pill text="500 IQ" x={40} y={630} />
  </AbsoluteFill>
);

/* ★1 · variant C (Ifverse formula): "WE / SURVIVED." */
export const H1280_C: React.FC = () => {
  const band: V3[] = Array.from({length: 12}, (_, i) => {const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 1.2 - 2.4, 0, Math.sin(a) * 1.2 - 8];});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#070818 0%, #1c1638 55%, #4a2448 100%)'}}>
      <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
        <AmberLights rimPos={[-4, 3, -6]} rim={3.6} fill={0.55} ambI={0.35} />
        <Stars n={400} />
        <Ground color="#1a1226" />
        <Fire pos={[-2.4, 0, -8]} t={0.3} light={10} s={0.9} />
        <Crowd positions={band} visible={12} color="#6a3e26" s={0.9} />
        <Person outfit="#b0562a" trim="#5a2e14" pos={[0.9, 0, 0]} rotY={-0.3} t={0} look={[-0.5, 0.1]} smug glint outline="#ffb45a" prop="spear" />
        <Cam p={0} from={[0.3, 2.05, 2.05]} to={[0.3, 2.05, 2.05]} look={[-0.2, 1.8, -1]} fov={40} />
      </ThreeCanvas>
      <RimGlow x={960} y={300} r={300} color="rgba(255,170,80,.3)" />
      <Bokeh seed={5} />
      <Headline l1="WE" l2="SURVIVED." size={140} />
      <Pill text="ONLY 1,280 LEFT" x={40} y={630} />
    </AbsoluteFill>
  );
};

/* ★7 The Last Neanderthal · A: "I'M THE / LAST." lonely-determined face, glowing handprint wall */
const HandWall: React.FC = () => (
  <svg width="1280" height="720" style={{position: 'absolute', left: 0, top: 0}}>
    <defs><filter id="hw"><feGaussianBlur stdDeviation="10" /></filter></defs>
    {[[150, 470, 1.1, -0.2], [330, 560, 0.85, 0.2], [480, 430, 0.95, -0.05]].map(([x, y, s, a], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${(a as number) * 57}) scale(${s})`}>
        <circle r="95" fill="#d2452a" opacity="0.55" filter="url(#hw)" />
        <g fill="#2a1418">
          <ellipse cx="0" cy="14" rx="34" ry="42" />
          {[[-30, -52, -20], [-11, -68, -6], [9, -70, 4], [28, -60, 15]].map(([fx, fy, fa], j) => <rect key={j} x={(fx as number) - 8} y={(fy as number) - 22} width="16" height="52" rx="8" transform={`rotate(${fa} ${fx} ${fy})`} />)}
          <rect x="34" y="-6" width="16" height="42" rx="8" transform="rotate(50 42 10)" />
        </g>
      </g>
    ))}
  </svg>
);
export const NEA_A: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#1a0c12 0%, #3a1a1e 60%, #4a2418 100%)'}}>
    <HandWall />
    <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
      <AmberLights rimPos={[3, 3, -3]} rim={3.4} fill={0.6} key1="#ffae5a" />
      <pointLight position={[-1.5, 1.2, 1.6]} intensity={7} color="#ff7a3c" distance={8} decay={1.3} />
      <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[0.9, 0, 0]} rotY={-0.25} t={0} look={[-0.6, 0.15]} brows outline="#ffb45a" />
      <Cam p={0} from={[0.3, 2.05, 2.1]} to={[0.3, 2.05, 2.1]} look={[0.05, 1.98, -1]} fov={40} />
    </ThreeCanvas>
    <RimGlow x={930} y={330} r={320} color="rgba(255,150,70,.32)" />
    <Bokeh seed={11} />
    <Headline l1="I'M THE" l2="LAST." size={150} />
    <Pill text="40,000 YEARS AGO" x={40} y={630} />
  </AbsoluteFill>
);
/* ★7 · B: "STILL / HERE." smug glint + glowing DNA (the twist) */
export const NEA_B: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #2a1c4a, #07050f 70%)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
      <ambientLight intensity={0.5} color="#6a5a9a" />
      <AmberLights rimPos={[3, 3, -3]} rim={3.2} fill={0.6} key1="#ffb460" />
      <pointLight position={[-1, 2, 2]} intensity={14} color="#ffb070" decay={1.5} />
      <group position={[-1.9, 1.0, -1.6]} scale={0.55}><Helix t={0.6} hot={1} /></group>
      <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[0.9, 0, 0]} rotY={-0.25} t={0} look={[-0.6, 0.1]} smug glint outline="#ffb45a" />
      <Cam p={0} from={[0.3, 2.05, 2.1]} to={[0.3, 2.05, 2.1]} look={[0.05, 1.98, -1]} fov={40} />
    </ThreeCanvas>
    <RimGlow x={930} y={330} r={320} color="rgba(160,120,255,.3)" />
    <Bokeh seed={13} color="#c8a8ff" />
    <Headline l1="STILL" l2="HERE." size={160} />
    <Pill text="IN YOUR DNA" x={40} y={630} />
  </AbsoluteFill>
);

/* ★7 · C (Ifverse "EVERYONE FLIES. …EXCEPT ME." format): empty land, dead fires, one survivor */
export const NEA_C: React.FC = () => {
  const ghosts: V3[] = Array.from({length: 9}, (_, i) => [-5.5 + i * 1.0, 0, -7 - (i % 3) * 1.2]);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a0c22 0%, #2a2448 50%, #7a4a5a 82%, #e09a6a 100%)'}}>
      <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
        <AmberLights rimPos={[-3, 3, -5]} rim={3.4} fill={0.55} ambI={0.4} />
        <Stars n={400} />
        <Ground color="#1e1626" />
        <Crowd positions={ghosts} visible={9} color="#3a3450" head="#3a3450" s={1} opacity={0.35} />
        {[-3.6, -1.2, 1.6].map((x, i) => <Fire key={i} pos={[x, 0, -5]} t={0} light={0} out={0} s={0.8} />)}
        <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[1.05, 0, 0]} rotY={-0.3} t={0} look={[-0.7, 0.2]} brows mouth="o" outline="#ffb45a" />
        <Cam p={0} from={[0.35, 2.0, 2.3]} to={[0.35, 2.0, 2.3]} look={[0.0, 1.85, -1]} fov={40} />
      </ThreeCanvas>
      <RimGlow x={950} y={320} r={320} color="rgba(255,160,80,.3)" />
      <Bokeh seed={17} />
      <div style={{position: 'absolute', left: 40, top: 40, fontFamily: MONT, fontWeight: 900, fontSize: 120, lineHeight: 0.98, letterSpacing: -2,
        filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.55))', color: '#fff', WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill'}}>EVERYONE'S<br />GONE.</div>
      <div style={{position: 'absolute', left: 40, bottom: 40, fontFamily: MONT, fontWeight: 900, fontSize: 92, letterSpacing: -1,
        filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.55))', color: '#ffd21f', WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill'}}>…EXCEPT ME.</div>
    </AbsoluteFill>
  );
};

/* ===== Symbol-metaphor thumbnails (Ifverse psychology: one universally understood object carries the premise) ===== */
/* D · museum case "EXTINCT" + "I NEVER LEFT." */
export const NEA_D: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 62% 30%, #3a2a3a, #0b0810 70%)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
      <ambientLight intensity={0.35} color="#6a5a8a" />
      <spotLight position={[0.9, 6, 1.5]} angle={0.42} penumbra={0.6} intensity={60} color="#ffe2b0" decay={1.5} target-position={[0.9, 1, 0]} />
      <directionalLight position={[-3, 3, -3]} intensity={2.2} color="#ffb460" />
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#1a141c" /></mesh>
      <mesh position={[0.9, 0.2, 0]}><boxGeometry args={[1.9, 0.4, 1.5]} /><meshStandardMaterial color="#2a2228" /></mesh>
      <group position={[0.9, 0.4, 0]}>
        <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[0, 0, 0]} rotY={-0.2} t={0} look={[-0.5, 0.1]} smug glint outline="#ffb45a" armLFwd={1.45} armL={-0.25} />
      </group>
      <mesh position={[0.9, 1.75, 0]}><boxGeometry args={[1.8, 2.7, 1.4]} /><meshPhysicalMaterial color="#cfe6ff" transparent opacity={0.12} roughness={0.05} metalness={0} /></mesh>
      {[[-0.9, 0.7], [0.9, 0.7], [-0.9, -0.7], [0.9, -0.7]].map(([x, z], i) => <mesh key={i} position={[0.9 + x, 1.75, z]}><boxGeometry args={[0.03, 2.7, 0.03]} /><meshStandardMaterial color="#d8d0c0" metalness={0.6} roughness={0.3} /></mesh>)}
      <mesh position={[0.9, 3.11, 0]}><boxGeometry args={[1.84, 0.04, 1.44]} /><meshStandardMaterial color="#d8d0c0" metalness={0.6} roughness={0.3} /></mesh>
      <Cam p={0} from={[-0.15, 1.95, 4.6]} to={[-0.15, 1.95, 4.6]} look={[-0.35, 1.7, 0]} fov={40} />
    </ThreeCanvas>
    {/* plaque */}
    <div style={{position: 'absolute', left: 820, top: 590, width: 380, padding: '10px 14px', background: '#e8e0cc', border: '3px solid #8a7a5a', borderRadius: 4,
      fontFamily: MONT, fontWeight: 900, color: '#2a1e14', textAlign: 'center', boxShadow: '0 6px 0 rgba(0,0,0,.5)'}}>
      <div style={{fontSize: 20, letterSpacing: 1}}>HOMO NEANDERTHALENSIS</div>
      <div style={{fontSize: 40, color: '#b0281e', letterSpacing: 1, lineHeight: 1.1}}>EXTINCT</div>
    </div>
    <Bokeh seed={21} />
    <Headline l1="I NEVER" l2="LEFT." size={140} />
  </AbsoluteFill>
);

/* E · ancestry DNA result "NEANDERTHAL 2%" + "HI, COUSIN." */
export const NEA_E: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 35%, #3a2448, #0b0712 70%)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 34, position: [0, 2, 4]}}>
      <AmberLights rimPos={[3, 3, -3]} rim={3.4} fill={0.6} key1="#ffb460" />
      <pointLight position={[-0.5, 1.6, 2]} intensity={10} color="#9fd8ff" decay={1.5} />
      <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[1.2, 0, -0.6]} rotY={-0.35} t={0} look={[-0.7, -0.2]} smug glint outline="#ffb45a" armR={0.9} armRFwd={1.2} />
      <Cam p={0} from={[0.5, 2.05, 2.4]} to={[0.5, 2.05, 2.4]} look={[0.3, 1.8, -1]} fov={40} />
    </ThreeCanvas>
    <RimGlow x={950} y={300} r={300} color="rgba(255,160,80,.28)" />
    {/* phone with ancestry result */}
    <div style={{position: 'absolute', left: 470, top: 330, width: 300, height: 400, borderRadius: 40, background: '#0e0e14', border: '6px solid #2a2a34',
      transform: 'rotate(-7deg)', boxShadow: '0 0 70px rgba(120,200,255,.35), 0 14px 0 rgba(0,0,0,.5)', padding: 20, boxSizing: 'border-box'}}>
      <div style={{background: '#f4f2ee', borderRadius: 28, height: '100%', padding: '30px 22px', boxSizing: 'border-box', fontFamily: MONT, fontWeight: 900, textAlign: 'center'}}>
        <div style={{fontSize: 17, color: '#6a6a7a', letterSpacing: 1}}>YOUR DNA RESULTS</div>
        <div style={{fontSize: 27, color: '#2a2a34', marginTop: 22}}>NEANDERTHAL</div>
        <div style={{fontSize: 112, color: '#e5322d', lineHeight: 1}}>2%</div>
        <div style={{height: 22, background: '#ddd', borderRadius: 11, marginTop: 18}}><div style={{width: '22%', height: '100%', background: '#e5322d', borderRadius: 11}} /></div>
      </div>
    </div>
    <Bokeh seed={23} color="#c8a8ff" />
    <Headline l1="HI," l2="COUSIN." size={150} />
  </AbsoluteFill>
);

/* F · symbol of impossible strength: a charging woolly rhino stopped dead by one calm palm (the "caught bullet" of strength) */
const CX = 618, CY = 316;
export const NEA_F: React.FC<{armA?: number; armB?: number}> = ({armA = 1.5, armB = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#5a6a9a 0%, #c8b0b8 52%, #f0d0b0 100%)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 36, position: [0, 2, 6]}}>
      <AmberLights key1="#ffe0c0" rim={3.2} fill={1.0} ambI={0.6} amb="#7a7aa8" rimPos={[3, 3, -3]} />
      <directionalLight position={[-4, 5, 4]} intensity={1.4} color="#fff0e0" />
      <Ground color="#e8e6f0" size={60} />
      <Rhino pos={[-2.72, 0, 0.2]} t={0} s={1.25} rotY={Math.PI / 2 - 0.1} run />
      {Array.from({length: 14}).map((_, i) => <mesh key={i} position={[-1.2 + Math.cos(i * 1.7) * 0.6, 0.12 + (i % 4) * 0.1, 0.5 + Math.sin(i * 2.3) * 0.5]}><sphereGeometry args={[0.12 + (i % 3) * 0.06, 8, 8]} /><meshStandardMaterial color="#f4f2fa" transparent opacity={0.85} /></mesh>)}
      <Person kind="neander" outfit="#6b4a2e" trim="#3a2414" pos={[0.75, 0, 0.3]} rotY={-0.35} t={0} look={[-0.15, 0.05]} smug glint outline="#ffb45a" armL={armA} armLFwd={armB} />
      <Cam p={0} from={[0.1, 1.85, 5.6]} to={[0.1, 1.85, 5.6]} look={[-0.2, 1.45, 0]} fov={36} />
    </ThreeCanvas>
    <RimGlow x={880} y={300} r={300} color="rgba(255,190,110,.32)" />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={40} y1={430 + i * 38} x2={250 - (i % 2) * 70} y2={430 + i * 38} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" />)}
    </svg>
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 12}).map((_, i) => {const a = (i / 12) * Math.PI * 2; const r1 = 30, r2 = 62 + (i % 3) * 18; return <line key={i} x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1} x2={CX + Math.cos(a) * r2} y2={CY + Math.sin(a) * r2} stroke="#ffe07a" strokeWidth={6} strokeLinecap="round" />;})}
    </svg>
    <Pill text="2 TONS" x={250} y={640} />
    <Headline l1="I DIDN'T" l2="MOVE." size={140} />
  </AbsoluteFill>
);
