import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {AmberLights, Cam, Crowd, Fire, Ground, Gym, Person, Stars, V3, rand} from './kit';

const {fontFamily: ANTON} = loadAnton();
const stroke = (px: number) => ({WebkitTextStroke: `${px}px #0b0612`, paintOrder: 'stroke fill' as const});

/* A: "ONLY 1,280 LEFT": one anxious survivor in a vast dark world, tiny band at a fire */
export const ThumbA: React.FC = () => {
  const R = rand(5);
  const band: V3[] = Array.from({length: 14}, (_, i) => {const a = (i / 14) * Math.PI * 2; return [Math.cos(a) * 1.3 + 0, 0, Math.sin(a) * 1.3 - 9];});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#070818 0%, #1c1638 55%, #4a2448 100%)'}}>
      <ThreeCanvas width={1280} height={720} camera={{fov: 40, position: [0, 2, 8]}}>
        <AmberLights rimPos={[-4, 3, -6]} rim={3.4} fill={0.55} ambI={0.35} />
        <Stars n={500} />
        <Ground color="#1a1226" />
        <Fire pos={[0, 0, -9]} t={0.3} light={10} s={0.9} />
        <Crowd positions={band} visible={14} color="#6a3e26" s={0.9} />
        <Person kind="adult" outfit="#b0562a" trim="#5a2e14" pos={[1.55, 0, 4.1]} rotY={-0.6} t={0} look={[-0.9, 0.3]} prop="spear" armRFwd={0.2} brows mouth="o" />
        <Cam p={0} from={[0.8, 2.3, 6.6]} to={[0.8, 2.3, 6.6]} look={[0.5, 1.2, -2]} fov={40} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 70%, rgba(255,150,60,0.18), rgba(0,0,0,0) 45%)'}} />
      <div style={{position: 'absolute', left: 48, top: 40, lineHeight: 0.92, fontFamily: ANTON, textShadow: '6px 7px 0 rgba(0,0,0,.55)'}}>
        <div style={{fontSize: 118, color: '#fff8ec', ...stroke(10)}}>ONLY</div>
        <div style={{fontSize: 200, color: '#ffb02e', ...stroke(12)}}>1,280</div>
        <div style={{fontSize: 118, color: '#fff8ec', ...stroke(10)}}>LEFT</div>
      </div>
    </AbsoluteFill>
  );
};

/* B: "ALL OF US?": the whole of humanity packed into one gym, one person staring up */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#1a1230, #2a1d3a)'}}>
    <ThreeCanvas width={1280} height={720} camera={{fov: 40, position: [0, 2, 8]}}>
      <AmberLights rimPos={[0, 9, -11]} rim={3} fill={1.0} />
      <Gym t={0.5} crowd={306} />
      <Person kind="modern" outfit="#d9a531" pos={[1.5, 0, 4.6]} rotY={-0.3} t={0} look={[-0.6, 1]} mouth="o" brows />
      <Cam p={0} from={[1.6, 2.2, 7.2]} to={[1.6, 2.2, 7.2]} look={[0.6, 2.6, -4]} fov={48} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 48, top: 36, lineHeight: 0.95, fontFamily: ANTON, textShadow: '6px 7px 0 rgba(0,0,0,.55)'}}>
      <div style={{fontSize: 150, color: '#fff8ec', ...stroke(11)}}>ALL OF</div>
      <div style={{fontSize: 150, color: '#ffb02e', ...stroke(11)}}>US?</div>
    </div>
  </AbsoluteFill>
);
