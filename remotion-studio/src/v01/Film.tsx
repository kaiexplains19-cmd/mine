import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import TL from './timeline.json';
import {SHOTS} from './shots';

const {fontFamily: ANTON} = loadAnton();
const {fontFamily: OSWALD} = loadOswald('normal', {weights: ['600']});
const FPS = 24;
const POP = [0.92, 1.04, 1.01, 1.0];
const popAt = (frame: number) => (frame < 0 ? 0 : frame < POP.length ? POP[frame] : 1);

const outline = (px: number) => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill' as const});

const Title: React.FC = () => (
  <div style={{position: 'absolute', left: 68, top: 132, display: 'flex', gap: 22}}>
    <div style={{width: 6, height: 150, background: '#fff', boxShadow: '0 0 4px rgba(0,0,0,.8)'}} />
    <div style={{color: '#fff', lineHeight: 1.0, textShadow: '0 0 3px rgba(0,0,0,.9), 2px 2px 0 rgba(0,0,0,.6)'}}>
      <div style={{fontFamily: OSWALD, fontWeight: 600, fontSize: 52, letterSpacing: 1}}>HUMANITY ALMOST</div>
      <div style={{fontFamily: ANTON, fontSize: 70, letterSpacing: 1, marginTop: 6}}>ENDED AT 1,280</div>
    </div>
  </div>
);

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const cue = TL.cues.find((c) => T >= c.s - 0.02 && T < c.e + 0.08);
  if (!cue) return null;
  const words = TL.words.slice(cue.w0, cue.w0 + cue.n);
  let active = -1;
  words.forEach((w, i) => {if (T >= w.s - 0.02) active = i;});
  // two semantic lines max, ~16 chars per line
  const lines: number[][] = [[]];
  let len = 0;
  words.forEach((w, i) => {
    if (len + w.w.length > 16 && lines[lines.length - 1].length) {lines.push([]); len = 0;}
    lines[lines.length - 1].push(i); len += w.w.length + 1;
  });
  const sc = popAt(frame - Math.round(cue.s * FPS));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 930, textAlign: 'center', transform: `scale(${sc})`, transformOrigin: '50% 50%'}}>
        {lines.map((ln, li) => (
          <div key={li} style={{fontFamily: ANTON, fontSize: 112, lineHeight: 1.05, letterSpacing: 1, textShadow: '5px 5px 0 rgba(0,0,0,.55)', ...outline(8)}}>
            {ln.map((i) => (
              <span key={i} style={{color: i === active ? '#ffb02e' : '#fff6e6'}}>{words[i].w}{' '}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Facts: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const f = TL.facts.find((x) => T >= x.s && T < x.e);
  if (!f) return null;
  const k = frame - Math.round(f.s * FPS);
  const sc = k < 6 ? [0.6, 0.9, 1.12, 1.05, 1.0, 1.0][k] : 1;
  const out = Math.min(1, (f.e - T) / 0.25);
  const size = f.t.length > 10 ? 118 : f.t.length > 5 ? 150 : 210;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', opacity: out}}>
      <div style={{fontFamily: ANTON, fontSize: size, color: '#ffb02e', transform: `scale(${sc})`, letterSpacing: 2, textShadow: '6px 6px 0 rgba(0,0,0,.5)', ...outline(10)}}>{f.t}</div>
    </div>
  );
};

const EndQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const q = TL.shots.find((s) => s.id === 'question')!;
  const k = frame - Math.round(q.s * FPS);
  if (k < 0) return null;
  const p1 = popAt(k - 4), p2 = popAt(k - 30), p3 = popAt(k - 36);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
      <div style={{fontFamily: ANTON, fontSize: 104, color: '#fff', textAlign: 'center', lineHeight: 1.05, transform: `scale(${p1})`, ...outline(8)}}>
        WOULD <span style={{color: '#ffb02e'}}>YOU</span><br />HAVE MADE IT?
      </div>
      <div style={{display: 'flex', gap: 50}}>
        {[['YES', '#2fbf71', p2], ['NO', '#e5484d', p3]].map(([txt, c, p]) => (
          <div key={txt as string} style={{transform: `scale(${p})`, fontFamily: ANTON, fontSize: 88, color: '#fff', background: c as string, padding: '10px 56px', borderRadius: 60, border: '6px solid #000'}}>{txt}</div>
        ))}
      </div>
    </div>
  );
};

export const Film: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TL.shots.map((s) => {
        const Shot = SHOTS[s.id];
        const from = Math.round(s.s * fps), dur = Math.max(1, Math.round(s.e * fps) - from);
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur}>
            <ShotFrame Shot={Shot} dur={dur / fps} />
          </Sequence>
        );
      })}
      <Facts />
      <EndQuestion />
      <Title />
      <Captions />
      <Audio src={staticFile('v01/mix.wav')} />
    </AbsoluteFill>
  );
};

const ShotFrame: React.FC<{Shot: React.FC<{t: number; d: number}>; dur: number}> = ({Shot, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <Shot t={frame / fps} d={dur} />;
};

export const FILM_FRAMES = Math.round(TL.total * FPS);
