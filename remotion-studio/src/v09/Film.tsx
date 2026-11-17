import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import TL from './timeline.json';
import {SETS} from './sets';

const {fontFamily: ANTON} = loadAnton();
const {fontFamily: MONT} = loadMont('normal', {weights: ['900']});
const FPS = 24;
const POP = [0.92, 1.04, 1.01, 1.0];
const popAt = (f: number) => (f < 0 ? 0 : f < POP.length ? POP[f] : 1);
const outline = (px: number) => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill' as const});

const Captions: React.FC = () => {
  const frame = useCurrentFrame(); const T = frame / FPS;
  const cue = TL.cues.find((c) => T >= c.s - 0.02 && T < c.e + 0.08);
  if (!cue) return null;
  const words = TL.words.slice(cue.w0, cue.w0 + cue.n);
  let active = -1; words.forEach((w, i) => {if (T >= w.s - 0.02) active = i;});
  const sc = popAt(frame - Math.round(cue.s * FPS));
  const dialogue = cue.who !== 'N';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 1500, textAlign: 'center', transform: `scale(${sc})`, fontFamily: ANTON, fontSize: 78, lineHeight: 1.08, letterSpacing: 1,
        textShadow: '4px 4px 0 rgba(0,0,0,.55)', fontStyle: dialogue ? 'italic' : 'normal', ...outline(7)}}>
        {words.map((w, i) => <span key={i} style={{color: i === active ? '#ffb02e' : dialogue ? '#cfe6ff' : '#fff6e6'}}>{w.w} </span>)}
      </div>
    </div>
  );
};

const Facts: React.FC = () => {
  const frame = useCurrentFrame(); const T = frame / FPS;
  const f = TL.facts.find((x) => T >= x.s && T < x.e);
  if (!f) return null;
  const k = frame - Math.round(f.s * FPS);
  const sc = k < 6 ? [0.6, 0.9, 1.12, 1.05, 1.0, 1.0][k] : 1;
  const op = Math.min(1, (f.e - T) / 0.25);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', opacity: op}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: f.t.length > 14 ? 92 : 120, color: '#ffd21f', transform: `scale(${sc})`, letterSpacing: -1,
        filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.55))', WebkitTextStroke: '4px #0b0612', paintOrder: 'stroke fill'}}>{f.t}</div>
    </div>
  );
};

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 6, 150, 170], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 70, top: 60, opacity: op, display: 'flex', gap: 22}}>
      <div style={{width: 8, height: 150, background: '#fff'}} />
      <div style={{fontFamily: MONT, fontWeight: 900, color: '#fff', lineHeight: 1.0, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.6))'}}>
        <div style={{fontSize: 58}}>WHAT IF YOU WOKE UP</div>
        <div style={{fontSize: 82, color: '#ffd21f'}}>AS A NEANDERTHAL?</div>
      </div>
    </div>
  );
};


/* phone overlays: NO SERVICE (day 1) and the news alert (ending) */
const PhoneOverlay: React.FC = () => {
  const frame = useCurrentFrame(); const T = frame / FPS;
  const l = (TL.lines as any[]).find((x) => T >= x.s && T < x.e && x.ov);
  if (!l) return null;
  const k = frame - Math.round(l.s * FPS);
  const sc = k < 6 ? [0.5, 0.85, 1.08, 1.03, 1.0, 1.0][k] : 1;
  const card: React.CSSProperties = {position: 'absolute', right: 120, top: 170, width: 360, height: 640, borderRadius: 48, background: '#0e0e14', border: '7px solid #2a2a34',
    transform: `scale(${sc}) rotate(4deg)`, boxShadow: '0 0 80px rgba(120,200,255,.35), 0 16px 0 rgba(0,0,0,.5)', padding: 22, boxSizing: 'border-box'};
  const scr = (bg: string, kids: React.ReactNode) => <div style={card}><div style={{height: '100%', borderRadius: 32, background: bg, fontFamily: MONT, fontWeight: 900, textAlign: 'center', padding: '40px 20px', boxSizing: 'border-box'}}>{kids}</div></div>;
  if (l.ov === 'faceid') return scr('linear-gradient(#1a2a4a, #0a1020)', <>
    <div style={{fontSize: 92, color: '#fff'}}>6:58</div><div style={{fontSize: 22, color: '#fff', opacity: 0.7}}>MONDAY</div>
    <svg width="150" height="150" style={{marginTop: 60}}><rect x="10" y="10" width="130" height="130" rx="30" fill="none" stroke="#ff5a4a" strokeWidth="8" /><circle cx="55" cy="60" r="7" fill="#ff5a4a" /><circle cx="95" cy="60" r="7" fill="#ff5a4a" /><path d="M50 108 q25 -20 50 0" stroke="#ff5a4a" strokeWidth="7" fill="none" /></svg>
    <div style={{fontSize: 30, color: '#ff6a55', marginTop: 24}}>FACE NOT<br />RECOGNISED</div></>);
  if (l.ov === 'viral') return scr('#0e0e14', <>
    <div style={{height: 300, borderRadius: 20, background: 'linear-gradient(#4a5060, #22262e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110}}>🏋️</div>
    <div style={{fontSize: 22, color: '#fff', marginTop: 20, textAlign: 'left'}}>CAVEMAN LIFTS ENTIRE GYM 😳</div>
    <div style={{fontSize: 64, color: '#ffd21f', marginTop: 18}}>40.2M</div><div style={{fontSize: 22, color: '#aaa'}}>VIEWS</div></>);
  return scr('#f4f2ee', <>
    <div style={{fontSize: 18, color: '#6a6a7a', letterSpacing: 1}}>YOUR DNA RESULTS</div>
    <div style={{fontSize: 30, color: '#2a2a34', marginTop: 50}}>NEANDERTHAL</div>
    <div style={{fontSize: 120, color: '#e5322d', lineHeight: 1}}>100%</div>
    <div style={{height: 26, background: '#ddd', borderRadius: 13, marginTop: 24}}><div style={{width: '100%', height: '100%', background: '#e5322d', borderRadius: 13}} /></div>
    <div style={{fontSize: 18, color: '#6a6a7a', marginTop: 30}}>Average person outside Africa: ~2%</div></>);
};

/* lift night/cave scenes so faces and action read on phones */
const EXPO: Record<string, number> = {bedroom: 1.15, mirror: 1.05, kitchen: 1.05, gym: 1.15, hillsNight: 1.55, caveHome: 1.3, burial: 1.5, caveArt: 1.35, sharedFire: 1.4, mixedFamily: 1.25, strangers: 1.1, lab: 1.15};
const Shot: React.FC<{set: string; dur: number; k: number; who: string; cam: string; v?: string}> = ({set, dur, k, who, cam, v}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const S = SETS[set];
  const ex = EXPO[set] ?? 1;
  return <AbsoluteFill style={{filter: ex !== 1 ? `brightness(${ex}) saturate(1.06)` : undefined}}><S t={frame / fps} d={dur} k={k} who={who} cam={cam} v={v} /></AbsoluteFill>;
};

export const Film09: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TL.lines.map((l) => {
        const from = Math.round(l.s * fps), dur = Math.max(1, Math.round(l.e * fps) - from);
        return (
          <Sequence key={l.i} from={from} durationInFrames={dur}>
            <Shot set={l.set} dur={dur / fps} k={l.k} who={l.who} cam={l.cam} v={(l as any).v} />
          </Sequence>
        );
      })}
      <Facts />
      <PhoneOverlay />
      <Opening />
      <Captions />
      <Audio src={staticFile('v09/mix.wav')} />
    </AbsoluteFill>
  );
};
export const FILM09_FRAMES = Math.round(TL.total * FPS);
