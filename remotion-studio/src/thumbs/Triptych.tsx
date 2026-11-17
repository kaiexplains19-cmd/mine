import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import {AmberLights, Cam, Crowd, Fire, Ground, Person, Stars, V3} from '../v01/kit';

const {fontFamily: MONT} = loadMont('normal', {weights: ['900']});
const PW = 427, PH = 720;
const HOODIE = {kind: 'modern' as const, outfit: '#f07a2a', sleeve: '#e06a20'};

const Label: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 84, letterSpacing: -1,
    color, WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.6))'}}>{text}</div>
);
const Panel: React.FC<{x: number; bg: string; children: React.ReactNode}> = ({x, bg, children}) => (
  <div style={{position: 'absolute', left: x, top: 0, width: PW, height: PH, overflow: 'hidden', background: bg}}>{children}</div>
);

/* DAY 1: lost, scared, phone with no signal, cold cave */
const Day1: React.FC = () => (
  <>
    <ThreeCanvas width={PW} height={PH} camera={{fov: 40, position: [0, 2, 5]}}>
      <AmberLights key1="#ffc8a0" rim={1.6} fill={1.0} ambI={0.7} amb="#a07a7a" />
      <mesh position={[0, 0, -1]}><sphereGeometry args={[7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#b07a5e" side={THREE.BackSide} roughness={1} flatShading /></mesh>
      <Ground color="#8a5a44" size={30} />
      <mesh position={[0.1, 0.25, 0]} scale={[1.2, 0.5, 0.9]}><dodecahedronGeometry args={[0.6, 0]} /><meshStandardMaterial color="#6a4a3e" flatShading /></mesh>
      <Person {...HOODIE} pos={[0.1, 0.25, 0.1]} sit t={0} look={[0.2, -0.7]} brows mouth="o" prop="phone" armRFwd={1.1} armR={-0.15} s={0.9} />
      <Cam p={0} from={[0.15, 1.7, 4.4]} to={[0.15, 1.7, 4.4]} look={[0.1, 1.15, 0]} fov={40} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 250, top: 300, width: 120, padding: '6px 8px', borderRadius: 10, background: '#0e0e14', color: '#ff6a55',
      fontFamily: MONT, fontWeight: 900, fontSize: 18, textAlign: 'center', boxShadow: '0 0 18px rgba(127,208,255,.6)'}}>NO SERVICE</div>
  </>
);

/* DAY 100: focused mastery, fire sparks, glowing cave-wall diagrams */
const Diagram: React.FC<{x: number; y: number; w: number; h: number; kind: number}> = ({x, y, w, h, kind}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, filter: 'drop-shadow(0 0 8px #6fd6ff)'}}>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="6" fill="rgba(20,60,90,.35)" stroke="#8fe0ff" strokeWidth="3" />
    <g stroke="#bfefff" strokeWidth="3" fill="none" strokeLinecap="round">
      {kind === 0 && <><path d={`M${w * 0.2} ${h * 0.8} L${w * 0.5} ${h * 0.2} L${w * 0.8} ${h * 0.8} Z`} /><text x={w * 0.42} y={h * 0.68} fill="#bfefff" stroke="none" fontSize="22" fontFamily="sans-serif">🔥</text></>}
      {kind === 1 && <><line x1={w * 0.1} y1={h * 0.5} x2={w * 0.85} y2={h * 0.5} /><path d={`M${w * 0.85} ${h * 0.5} l-16 -10 l0 20 z`} fill="#bfefff" /><line x1={w * 0.3} y1={h * 0.3} x2={w * 0.3} y2={h * 0.7} strokeDasharray="4 5" /></>}
      {kind === 2 && <><ellipse cx={w * 0.5} cy={h * 0.55} rx={w * 0.25} ry={h * 0.18} /><path d={`M${w * 0.1} ${h * 0.2} q${w * 0.2} ${h * 0.1} ${w * 0.3} ${h * 0.3}`} /><path d={`M${w * 0.9} ${h * 0.2} q${-w * 0.2} ${h * 0.1} ${-w * 0.3} ${h * 0.3}`} /><text x={w * 0.12} y={h * 0.95} fill="#bfefff" stroke="none" fontSize="16" fontFamily="sans-serif">x  x  x</text></>}
      {kind === 3 && <>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={w * (0.15 + i * 0.17)} cy={h * (0.3 + (i % 2) * 0.3)} r="4" fill="#bfefff" />)}<path d={`M${w * 0.15} ${h * 0.3} L${w * 0.32} ${h * 0.6} L${w * 0.49} ${h * 0.3} L${w * 0.66} ${h * 0.6} L${w * 0.83} ${h * 0.3}`} strokeDasharray="5 5" /></>}
    </g>
  </svg>
);
const Day100: React.FC = () => (
  <>
    <ThreeCanvas width={PW} height={PH} camera={{fov: 40, position: [0, 2, 5]}}>
      <ambientLight intensity={0.5} color="#4a6a9a" />
      <directionalLight position={[2, 4, 3]} intensity={1.2} color="#9fd0ff" />
      <pointLight position={[0, 0.6, 1.0]} intensity={9} color="#ffb060" distance={6} decay={1.3} />
      <Ground color="#14182a" size={30} />
      <Fire pos={[0, 0, 0.95]} t={0.4} light={0} s={0.75} />
      <Person {...HOODIE} pos={[0, 0, 0]} sit t={0} look={[0, -0.8]} focus armRFwd={1.25} armLFwd={1.25} armR={-0.2} armL={-0.2} s={0.95} />
      <Cam p={0} from={[0, 1.55, 4.3]} to={[0, 1.55, 4.3]} look={[0, 0.95, 0.3]} fov={40} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, background: 'radial-gradient(circle at 50% 70%, rgba(255,170,80,.25), rgba(0,0,0,0) 40%)'}} />
    <Diagram x={22} y={150} w={130} h={110} kind={0} />
    <Diagram x={275} y={150} w={130} h={110} kind={1} />
    <Diagram x={14} y={330} w={120} h={100} kind={2} />
    <Diagram x={290} y={330} w={120} h={100} kind={3} />
    <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 14}).map((_, i) => {const a = (i / 14) * Math.PI * 2; return <line key={i} x1={213} y1={596} x2={213 + Math.cos(a) * (26 + (i % 3) * 16)} y2={596 + Math.sin(a) * (26 + (i % 3) * 16)} stroke="#ffd36b" strokeWidth="4" strokeLinecap="round" />;})}
    </svg>
  </>
);

/* YEAR 10: leader on a mammoth-tusk throne, smug glint, tribe below */
const Year10: React.FC = () => {
  const tribe: V3[] = Array.from({length: 10}, (_, i) => [-2.2 + (i % 5) * 1.1, 0, 1.6 + Math.floor(i / 5) * 0.7]);
  return (
    <ThreeCanvas width={PW} height={PH} camera={{fov: 40, position: [0, 2, 5]}}>
      <AmberLights key1="#ff9a6a" rim={3.4} fill={0.8} ambI={0.5} amb="#7a3a4a" />
      <Ground color="#4a2430" size={30} />
      <mesh position={[0, 0.35, -0.2]}><boxGeometry args={[1.6, 0.7, 1.0]} /><meshStandardMaterial color="#5a3a2a" flatShading /></mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.75, 1.6, -0.5]} rotation={[0, 0, sd * -0.15]}><torusGeometry args={[1.1, 0.09, 10, 24, Math.PI * 0.85]} /><meshStandardMaterial color="#f2e6c8" roughness={0.5} /></mesh>
      ))}
      <group position={[0, 0.7, 0]}>
        <Person {...HOODIE} pos={[0, 0, 0]} sit t={0} look={[-0.3, 0.1]} smug glint outline="#ffd27a" prop="spear" armRFwd={0.25} />
        <mesh position={[0, 1.0, -0.02]}><coneGeometry args={[0.5, 0.75, 14, 1, true]} /><meshStandardMaterial color="#6a4a2e" side={THREE.DoubleSide} flatShading /></mesh>
      </group>
      <Crowd positions={tribe} visible={10} color="#3a1e26" head="#1a0e12" s={0.85} />
      <Cam p={0} from={[0, 2.3, 5.4]} to={[0, 2.3, 5.4]} look={[0, 1.85, 0]} fov={40} />
    </ThreeCanvas>
  );
};

export const Woke50k: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Panel x={0} bg="linear-gradient(#d89a7a, #b0705a)"><Day1 /><Label text="DAY 1" color="#ffffff" /></Panel>
    <Panel x={427} bg="radial-gradient(circle at 50% 45%, #1e3a5e, #070b18 75%)"><Day100 /><Label text="DAY 100" color="#ffd21f" /></Panel>
    <Panel x={854} bg="linear-gradient(#ff9a6a 0%, #c0504a 45%, #4a1e2e 100%)"><Year10 /><Label text="YEAR 10" color="#ff6a55" /></Panel>
    <div style={{position: 'absolute', left: 425, top: 0, width: 4, height: PH, background: '#0b0612'}} />
    <div style={{position: 'absolute', left: 852, top: 0, width: 4, height: PH, background: '#0b0612'}} />
  </AbsoluteFill>
);

/* EVERY ICE AGE · three eras graded by how long you'd last */
const IcePanel: React.FC<{x: number; bg: string; era: string; time: string; tc: string; ground: string; mood: 'gasp' | 'cold' | 'smug'; extra?: React.ReactNode}> = ({x, bg, era, time, tc, ground, mood, extra}) => (
  <Panel x={x} bg={bg}>
    <ThreeCanvas width={PW} height={PH} camera={{fov: 40, position: [0, 2, 5]}}>
      <AmberLights key1="#fff0e0" rim={2.2} fill={1.0} ambI={0.7} />
      <Ground color={ground} size={30} />
      {extra}
      <Person {...HOODIE} pos={[0, 0, 0]} t={0} look={[0, mood === 'smug' ? 0.05 : 0]} mouth={mood === 'smug' ? 'smile' : 'o'} brows={mood !== 'smug'} smug={mood === 'smug'} glint={mood === 'smug'} lean={mood === 'gasp' ? 0.25 : 0} armLFwd={mood === 'cold' ? 1.0 : 0} armRFwd={mood === 'cold' ? 1.0 : 0} outline={mood === 'smug' ? '#ffd27a' : undefined} />
      <Cam p={0} from={[0, 1.6, 4.4]} to={[0, 1.6, 4.4]} look={[0, 1.25, 0]} fov={40} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 30, color: '#fff', WebkitTextStroke: '2px #0b0612', paintOrder: 'stroke fill', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.6))'}}>{era}</div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: time.length > 8 ? 56 : 70, color: tc, WebkitTextStroke: '3px #0b0612', paintOrder: 'stroke fill', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.6))', lineHeight: 1}}>{time}</div>
  </Panel>
);
export const IceAges: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <IcePanel x={0} bg="linear-gradient(#b05a3a, #f0c890)" era="2.4 BILLION YRS AGO" time="1 MINUTE" tc="#ff4a3a" ground="#6a4a3a" mood="gasp" />
    <IcePanel x={427} bg="linear-gradient(#8aa0c8, #f4f6fa)" era="700 MILLION YRS AGO" time="3 DAYS" tc="#ffb02e" ground="#eef4ff" mood="cold" />
    <IcePanel x={854} bg="linear-gradient(#ff9a6a, #c0504a 60%, #4a1e2e)" era="20,000 YRS AGO" time="A LIFETIME" tc="#7aff7a" ground="#d8dce8" mood="smug"
      extra={<><Fire pos={[1.0, 0, 0.6]} t={0.4} light={6} s={0.7} /><Crowd positions={[[-1.4, 0, -1.2], [1.6, 0, -1.6], [-0.6, 0, -2.2]]} visible={3} color="#5a3a2a" s={0.9} /></>} />
    <div style={{position: 'absolute', left: 425, top: 0, width: 4, height: PH, background: '#0b0612'}} />
    <div style={{position: 'absolute', left: 852, top: 0, width: 4, height: PH, background: '#0b0612'}} />
  </AbsoluteFill>
);
