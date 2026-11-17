import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import {Cam, Person} from '../v01/kit';

/* BRIGHT system — fixes the 1.6% CTR: dark thumbnails vanish in the dark-mode feed.
   Rules: saturated high-key background · one HUGE face (~50% of frame) · max 2 short lines · one symbol prop. */
const {fontFamily: MONT} = loadMont('normal', {weights: ['900']});
const INK = '#0b0612';

const Head: React.FC<{l1: string; l2: string; c1?: string; c2?: string; size?: number}> = ({l1, l2, c1 = '#fff', c2 = '#ffd21f', size = 150}) => (
  <div style={{position: 'absolute', left: 38, top: 30, lineHeight: 0.95, fontFamily: MONT, fontWeight: 900, letterSpacing: -3,
    filter: `drop-shadow(0 8px 0 ${INK})`}}>
    <div style={{fontSize: size, color: c1, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{l1}</div>
    <div style={{fontSize: size, color: c2, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{l2}</div>
  </div>
);
const Tag: React.FC<{text: string; x: number; y: number; bg?: string; rot?: number; size?: number}> = ({text, x, y, bg = '#e5322d', rot = -4, size = 46}) => (
  <div style={{position: 'absolute', left: x, top: y, background: bg, color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: size,
    padding: '8px 22px', borderRadius: 14, border: `6px solid ${INK}`, transform: `rotate(${rot}deg)`, boxShadow: `0 8px 0 ${INK}`}}>{text}</div>
);
/* sunburst rays behind the face: the classic high-CTR "pop" */
const Rays: React.FC<{cx: number; cy: number; color: string}> = ({cx, cy, color}) => (
  <svg width="1280" height="720" style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 18}).map((_, i) => {
      const a = (i / 18) * Math.PI * 2, b = a + Math.PI / 30, R = 1600;
      return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R} L${cx + Math.cos(b) * R} ${cy + Math.sin(b) * R}Z`} fill={color} />;
    })}
  </svg>
);

type Face = {kind?: 'adult' | 'neander' | 'modern'; outfit?: string; trim?: string; mouth?: 'line' | 'o' | 'smile'; brows?: boolean; smug?: boolean; glint?: boolean; look?: [number, number]; rotY?: number};
const BigFace: React.FC<{f: Face; x?: number; extra3d?: React.ReactNode}> = ({f, x = -0.42, extra3d}) => (
  <ThreeCanvas width={1280} height={720} camera={{fov: 30, position: [0, 1.7, 2]}}>
    <ambientLight intensity={1.1} />
    <directionalLight position={[2, 3, 4]} intensity={2.6} color="#fff4e6" />
    <directionalLight position={[-3, 2, -2]} intensity={2.4} color="#ffffff" />
    <Person kind={f.kind ?? 'neander'} outfit={f.outfit ?? '#c0602a'} trim={f.trim ?? '#6e3a1c'} pos={[0, 0, 0]} rotY={f.rotY ?? -0.25} t={0}
      look={f.look ?? [-0.3, 0]} mouth={f.mouth ?? 'line'} brows={f.brows} smug={f.smug} glint={f.glint} outline="#ffffff" />
    {extra3d}
    <Cam p={0} from={[x, 2.1, 1.95]} to={[x, 2.1, 1.95]} look={[x, 1.98, 0]} fov={34} />
  </ThreeCanvas>
);
const Frame: React.FC<{bg: string; ray: string; children: React.ReactNode}> = ({bg, ray, children}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <Rays cx={900} cy={330} color={ray} />
    {children}
  </AbsoluteFill>
);
const Card: React.FC<{x: number; y: number; w: number; rot?: number; children: React.ReactNode; bg?: string}> = ({x, y, w, rot = 6, children, bg = '#fff'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, background: bg, border: `7px solid ${INK}`, borderRadius: 22, transform: `rotate(${rot}deg)`,
    boxShadow: `0 10px 0 ${INK}`, fontFamily: MONT, fontWeight: 900, textAlign: 'center', padding: '16px 10px', boxSizing: 'border-box', color: INK}}>{children}</div>
);

/* — uploaded: What If You Were the Last Neanderthal? — */
export const B_LAST: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #8fe0ff, #2a8ad8 75%)" ray="rgba(255,255,255,.16)">
    <BigFace f={{brows: true, mouth: 'o', look: [-0.35, 0.05]}} />
    <Head l1="LAST" l2="ONE." />
    <Card x={70} y={430} w={420} rot={-5}>
      <div style={{fontSize: 30}}>NEANDERTHALS LEFT</div>
      <div style={{fontSize: 120, color: '#e5322d', lineHeight: 1}}>1</div>
    </Card>
  </Frame>
);
/* — uploaded: Could You Survive Waking Up 50,000 Years in the Past? — */
export const B_50K: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #ffd86a, #ff7a2a 75%)" ray="rgba(255,255,255,.18)">
    <BigFace f={{kind: 'modern', outfit: '#2a6ad8', trim: '#173e86', brows: true, mouth: 'o', look: [-0.3, 0]}} />
    <Head l1="NO" l2="WIFI." c2="#ffffff" />
    <Card x={80} y={400} w={360} rot={-6} bg="#14141c">
      <div style={{fontSize: 30, color: '#fff'}}>YEAR</div>
      <div style={{fontSize: 74, color: '#ffd21f', lineHeight: 1.05}}>50,000 BC</div>
      <div style={{fontSize: 26, color: '#ff5a4a'}}>✕ NO SIGNAL</div>
    </Card>
  </Frame>
);
/* — 30 Days — */
export const B_30D: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #fff07a, #ffb000 75%)" ray="rgba(255,255,255,.22)">
    <BigFace f={{kind: 'modern', outfit: '#2a6ad8', trim: '#173e86', brows: true, mouth: 'line', look: [-0.4, -0.15]}} />
    <Head l1="DAY" l2="29." c2="#e5322d" />
    <Tag text="$1,000,000" x={70} y={420} bg="#1ea84a" rot={-5} size={64} />
    <div style={{position: 'absolute', left: 150, top: 540, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #ff6a5a, #c01e1e)',
      border: `8px solid ${INK}`, boxShadow: `0 10px 0 ${INK}`}} />
    <Tag text="OR" x={330} y={580} bg={INK} rot={0} size={40} />
  </Frame>
);
/* — Brought Back — */
export const B_BACK: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #8affd8, #12b08a 75%)" ray="rgba(255,255,255,.18)">
    <BigFace f={{smug: true, glint: true, mouth: 'smile', look: [-0.3, 0.05]}} />
    <Head l1="I'M" l2="BACK." />
    <Card x={60} y={440} w={460} rot={-5} bg="#fff6e0">
      <div style={{fontSize: 26}}>NEANDERTHAL</div>
      <div style={{fontSize: 64, color: '#7a6a5a', lineHeight: 1.05, position: 'relative'}}>EXTINCT
        <div style={{position: 'absolute', left: 30, right: 30, top: '48%', height: 14, background: '#e5322d', transform: 'rotate(-6deg)', borderRadius: 7}} /></div>
      <div style={{fontSize: 44, color: '#e5322d'}}>BORN 2026</div>
    </Card>
  </Frame>
);
/* — 50% DNA — */
export const B_HALF: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(90deg, #3a8aff 0 50%, #ff4a3a 50% 100%)', overflow: 'hidden'}}>
    <Rays cx={900} cy={330} color="rgba(255,255,255,.14)" />
    <BigFace x={-0.6} f={{kind: 'adult', outfit: '#ff8a1a', trim: '#a04a10', smug: true, glint: true, mouth: 'smile', look: [-0.3, 0]}} />
    <Head l1="HALF" l2="CAVEMAN." size={112} />
    <div style={{position: 'absolute', left: 120, top: 400, width: 260, height: 260, borderRadius: '50%', border: `9px solid ${INK}`,
      background: 'conic-gradient(from 180deg, #ffd21f 0 50%, #ffffff 50% 100%)', boxShadow: `0 10px 0 ${INK}`}} />
    <Tag text="50%" x={170} y={490} bg={INK} rot={-4} size={72} />
  </AbsoluteFill>
);
/* — Never Left Africa — */
export const B_AFRICA: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #ffe08a, #f08a1a 75%)" ray="rgba(255,255,255,.2)">
    <BigFace x={-0.55} f={{kind: 'adult', outfit: '#b5652e', trim: '#6e3a1c', brows: true, mouth: 'line', look: [-0.45, 0]}} />
    <Head l1="WE" l2="STAYED." c2="#ffffff" size={128} />
    <Card x={70} y={420} w={430} rot={-5}>
      <div style={{fontSize: 30}}>HUMANS OUTSIDE AFRICA</div>
      <div style={{fontSize: 120, color: '#e5322d', lineHeight: 1}}>0</div>
    </Card>
  </Frame>
);
/* — Every Ice Age — */
export const B_ICE: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #e8fbff, #4ac0ff 75%)" ray="rgba(255,255,255,.3)">
    <BigFace f={{kind: 'modern', outfit: '#e5322d', trim: '#8a1a14', brows: true, mouth: 'o', look: [-0.3, 0]}} />
    <Head l1="5 ICE" l2="AGES." c2="#ffffff" />
    <Tag text="SURVIVE ALL?" x={70} y={430} bg="#1a5ad8" rot={-5} size={58} />
    <div style={{position: 'absolute', left: 90, top: 560, display: 'flex', gap: 14}}>
      {['#e8f6ff', '#e8f6ff', '#e8f6ff', '#e8f6ff', '#e8f6ff'].map((c, i) => (
        <div key={i} style={{width: 66, height: 66, borderRadius: '50%', background: c, border: `6px solid ${INK}`, boxShadow: `0 6px 0 ${INK}`}} />
      ))}
    </div>
  </Frame>
);
