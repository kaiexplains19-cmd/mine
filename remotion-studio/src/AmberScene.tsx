import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

// A matte-black "bean" character lit with amber rim light and plum shadows, rendered with three.js.
const Bean: React.FC<{frame: number}> = ({frame}) => {
  const bob = Math.sin(frame / 8) * 0.05;
  const turn = interpolate(frame, [0, 90], [-0.5, 0.5]);
  return (
    <group position={[0, bob, 0]} rotation={[0, turn, 0]}>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial color="#111116" roughness={0.9} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 1.18, 0.5]}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial color="#f3e8d2" emissive="#f3e8d2" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.38, 0.8, 8, 32]} />
        <meshStandardMaterial color="#b5652e" roughness={0.8} />
      </mesh>
    </group>
  );
};

export const AmberScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const glow = interpolate(frame, [0, 45, 90], [0.6, 1.4, 0.6]);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1b1030, #3a1f3f 60%, #6a3a2a)'}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 0.9, 7.5], fov: 40}}>
        <ambientLight intensity={0.25} color="#5a3a7a" />
        <directionalLight position={[3, 2, -2]} intensity={2.5 * glow} color="#ffb04a" />
        <pointLight position={[-2, 1, 2]} intensity={1.2} color="#ff8a3c" />
        <Bean frame={frame} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
          <circleGeometry args={[3, 64]} />
          <meshStandardMaterial color="#2a1830" roughness={1} />
        </mesh>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 180}}>
        <div style={{width: '100%', textAlign: 'center', fontFamily: 'Impact, Anton, sans-serif', fontWeight: 900, fontSize: 84, color: '#fff', textShadow: '0 0 12px #000'}}>
          REMOTION + THREE.JS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
