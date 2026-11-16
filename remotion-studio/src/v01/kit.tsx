import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

export type V3 = [number, number, number];
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x: number) => {x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const lerp3 = (a: V3, b: V3, x: number): V3 => [lerp(a[0], b[0], x), lerp(a[1], b[1], x), lerp(a[2], b[2], x)];
export const rand = (seed: number) => {let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647;};

const INK = '#0d0d13';
const CREAM = '#f2e6cc';

/* ---------- camera ---------- */
export const Cam: React.FC<{from: V3; to: V3; look: V3; look2?: V3; fov?: number; p: number; shake?: number; t?: number}> = ({from, to, look, look2, fov = 42, p, shake = 0, t = 0}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const e = ease(p);
  const pos = lerp3(from, to, e);
  const lk = lerp3(look, look2 ?? look, e);
  camera.position.set(pos[0] + Math.sin(t * 23) * shake, pos[1] + Math.cos(t * 19) * shake, pos[2]);
  camera.fov = fov;
  camera.lookAt(lk[0], lk[1], lk[2]);
  camera.updateProjectionMatrix();
  return null;
};

/* ---------- lighting presets ---------- */
export const AmberLights: React.FC<{key1?: string; rimPos?: V3; rim?: number; fill?: number; amb?: string; ambI?: number}> = ({key1 = '#ffae52', rimPos = [-5, 6, -6], rim = 3.2, fill = 0.9, amb = '#4a2f5e', ambI = 0.55}) => (
  <>
    <ambientLight intensity={ambI} color={amb} />
    <hemisphereLight args={['#7a5a9a', '#1a0f1a', 0.55]} />
    <directionalLight position={rimPos} intensity={rim} color={key1} />
    <directionalLight position={[3, 4, 6]} intensity={fill} color="#ffd2a0" />
  </>
);

/* ---------- people ---------- */
export type Kind = 'adult' | 'elder' | 'child' | 'modern' | 'neander';
export type PersonProps = {
  pos?: V3; rotY?: number; s?: number; kind?: Kind; outfit?: string; trim?: string; t?: number;
  walk?: number; sit?: boolean; kneel?: boolean; armL?: number; armR?: number; armLFwd?: number; armRFwd?: number;
  look?: [number, number]; lean?: number; brows?: boolean; smug?: boolean; glint?: boolean; outline?: string; focus?: boolean; sleeve?: string; prop?: 'spear' | 'staff' | 'toy' | 'food' | 'axe' | 'phone' | null; mouth?: 'line' | 'o' | 'smile';
  dim?: number;
};

const Limb: React.FC<{len: number; r: number; color: string; children?: React.ReactNode}> = ({len, r, color, children}) => (
  <>
    <mesh position={[0, -len / 2, 0]}>
      <cylinderGeometry args={[r, r * 0.92, len, 10]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    <group position={[0, -len, 0]}>{children}</group>
  </>
);

export const Person: React.FC<PersonProps> = ({
  pos = [0, 0, 0], rotY = 0, s = 1, kind = 'adult', outfit = '#b5652e', trim = '#6e3a1c', t = 0, walk, sit, kneel,
  armL = 0, armR = 0, armLFwd = 0, armRFwd = 0, look = [0, 0], lean = 0, prop = null, mouth = 'line', brows = false, smug = false, glint = false, outline, focus = false, sleeve,
}) => {
  const neander = kind === 'neander';
  const modern = kind === 'modern';
  const headS = kind === 'child' ? 1.25 : 1;
  const hipY = sit ? 0.42 : kneel ? 0.55 : 0.95;
  const bob = walk !== undefined ? Math.abs(Math.sin(walk)) * 0.04 : Math.sin(t * 2.1) * 0.012;
  const sw = walk !== undefined ? Math.sin(walk) * 0.55 : 0;
  const legC = modern ? '#22304a' : INK;
  const torsoR = neander ? 1.32 : 1;
  const legRot = (side: number) => (sit ? -1.42 : kneel ? (side < 0 ? -1.5 : 0.1) : sw * side);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <group position={[0, bob, 0]} rotation={[lean, 0, 0]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.11 * torsoR, hipY, 0]} rotation={[legRot(side), 0, 0]}>
            <Limb len={kneel && side < 0 ? 0.5 : 0.92} r={0.062} color={legC}>
              <mesh position={[0, 0, 0.05]} scale={[1, 0.6, 1.5]}>
                <sphereGeometry args={[0.075, 10, 10]} />
                <meshStandardMaterial color={modern ? '#f4f1ea' : INK} roughness={0.9} />
              </mesh>
            </Limb>
          </group>
        ))}
        {/* torso */}
        <mesh position={[0, hipY + 0.38, 0]}>
          <cylinderGeometry args={[0.21 * torsoR, 0.27 * torsoR, 0.8, 14]} />
          <meshStandardMaterial color={outfit} roughness={0.85} flatShading />
        </mesh>
        {modern ? (
          <mesh position={[0, hipY + 0.5, 0.215]}>
            <boxGeometry args={[0.13, 0.5, 0.02]} />
            <meshStandardMaterial color="#f4f1ea" roughness={0.9} />
          </mesh>
        ) : (
          <mesh position={[0, hipY + 0.42, 0]} rotation={[0, 0, 0.75]}>
            <boxGeometry args={[0.07, 0.9 * torsoR, 0.5 * torsoR]} />
            <meshStandardMaterial color={trim} roughness={0.9} />
          </mesh>
        )}
        {(kind === 'elder' || neander) && (
          <mesh position={[0, hipY + 0.52, -0.02]}>
            <coneGeometry args={[neander ? 0.48 : 0.42, 0.78, 14, 1, true]} />
            <meshStandardMaterial color={neander ? '#3d2716' : '#8c8578'} roughness={1} side={THREE.DoubleSide} flatShading />
          </mesh>
        )}
        {/* neck + head */}
        <mesh position={[0, hipY + 0.86, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.22, 10]} />
          <meshStandardMaterial color={INK} roughness={0.9} />
        </mesh>
        <group position={[0, hipY + 1.18, 0]} scale={[headS * (neander ? 1.16 : 1), headS, headS]}>
          <mesh>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color={INK} roughness={0.75} />
          </mesh>
          {outline && <mesh scale={1.045}><sphereGeometry args={[0.3, 32, 32]} /><meshBasicMaterial color={outline} side={THREE.BackSide} /></mesh>}
          {neander && (
            <mesh position={[0, 0.11, 0.2]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.42, 0.06, 0.12]} />
              <meshStandardMaterial color={INK} roughness={0.9} />
            </mesh>
          )}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.105, 0.04, 0.283]}>
              <mesh><circleGeometry args={[0.062, 24]} /><meshBasicMaterial color={CREAM} /></mesh>
              <mesh position={[look[0] * 0.013, look[1] * 0.013, 0.002]}><circleGeometry args={[0.027, 16]} /><meshBasicMaterial color={INK} /></mesh>
              {smug && <mesh position={[0, 0.004, 0.004]} rotation={[0, 0, side * 0.18]}><circleGeometry args={[0.07, 24, 0, Math.PI]} /><meshBasicMaterial color={INK} /></mesh>}
              {smug && <mesh position={[0, 0.006, 0.005]} rotation={[0, 0, side * 0.18]}><boxGeometry args={[0.13, 0.012, 0.002]} /><meshBasicMaterial color={CREAM} /></mesh>}
              {glint && side < 0 && (
                <group position={[look[0] * 0.013, look[1] * 0.013 - 0.005, 0.008]}>
                  <mesh><boxGeometry args={[0.105, 0.009, 0.001]} /><meshBasicMaterial color="#fff6d8" /></mesh>
                  <mesh><boxGeometry args={[0.009, 0.105, 0.001]} /><meshBasicMaterial color="#fff6d8" /></mesh>
                  <mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.04, 0.006, 0.001]} /><meshBasicMaterial color="#fff6d8" /></mesh>
                  <mesh rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.04, 0.006, 0.001]} /><meshBasicMaterial color="#fff6d8" /></mesh>
                  <mesh><circleGeometry args={[0.024, 20]} /><meshBasicMaterial color="#fff2c0" /></mesh>
                </group>
              )}
            </group>
          ))}
          {focus && [-1, 1].map((side) => (
            <mesh key={'f' + side} position={[side * 0.11, 0.125, 0.274]} rotation={[0, 0, side * 0.42]}><boxGeometry args={[0.11, 0.022, 0.004]} /><meshBasicMaterial color="#f2e6cc" /></mesh>
          ))}
          {brows && [-1, 1].map((side) => (
            <mesh key={'b' + side} position={[side * 0.11, 0.135, 0.272]} rotation={[0, 0, side * -0.38]}><boxGeometry args={[0.1, 0.018, 0.004]} /><meshBasicMaterial color="#f2e6cc" /></mesh>
          ))}
          {smug ? (
            <mesh position={[0.025, -0.095, 0.285]} rotation={[0, 0, Math.PI + 0.35]}><torusGeometry args={[0.07, 0.011, 8, 20, Math.PI * 0.55]} /><meshBasicMaterial color={CREAM} /></mesh>
          ) : mouth === 'o' ? (
            <mesh position={[0, -0.1, 0.29]}><circleGeometry args={[0.03, 16]} /><meshBasicMaterial color={CREAM} /></mesh>
          ) : (
            <mesh position={[0, -0.1, 0.288]} rotation={[0, 0, 0]}>
              <boxGeometry args={[mouth === 'smile' ? 0.11 : 0.085, 0.014, 0.004]} />
              <meshBasicMaterial color={CREAM} />
            </mesh>
          )}
        </group>
        {/* arms */}
        {[-1, 1].map((side) => {
          const raise = side > 0 ? armR : armL;
          const fwd = (side > 0 ? armRFwd : armLFwd) + (walk !== undefined ? -sw * side * 0.8 : 0);
          return (
            <group key={side} position={[side * 0.25 * torsoR, hipY + 0.7, 0]} rotation={[-fwd, 0, side * (0.12 + raise)]}>
              <Limb len={0.68} r={0.055} color={sleeve ?? (modern ? '#d9a531' : INK)}>
                <mesh><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color={INK} roughness={0.9} /></mesh>
                {side > 0 && prop && <Prop kind={prop} />}
              </Limb>
            </group>
          );
        })}
      </group>
    </group>
  );
};

const Prop: React.FC<{kind: string}> = ({kind}) => {
  if (kind === 'spear' || kind === 'staff')
    return (
      <group>
        <mesh><cylinderGeometry args={[0.025, 0.03, kind === 'spear' ? 2.3 : 2.0, 8]} /><meshStandardMaterial color={kind === 'spear' ? '#8a5a30' : '#6b4a2e'} roughness={1} /></mesh>
        {kind === 'spear' && <mesh position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.05, 0.22, 8]} /><meshStandardMaterial color="#cfc3a6" /></mesh>}
      </group>
    );
  if (kind === 'toy')
    return (
      <group position={[0, -0.05, 0.06]}>
        <mesh scale={[1, 0.8, 1.3]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#c9935a" /></mesh>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.025, 0.06, 8]} /><meshStandardMaterial color="#8a5a30" /></mesh>
      </group>
    );
  if (kind === 'food') return <mesh position={[0, -0.06, 0.05]}><boxGeometry args={[0.16, 0.08, 0.1]} /><meshStandardMaterial color="#8a4a2a" /></mesh>;
  if (kind === 'phone')
    return (
      <group position={[0, -0.04, 0.06]} rotation={[0.4, 0, 0]}>
        <mesh><boxGeometry args={[0.1, 0.18, 0.015]} /><meshStandardMaterial color="#15151c" /></mesh>
        <mesh position={[0, 0, 0.009]}><planeGeometry args={[0.085, 0.16]} /><meshBasicMaterial color="#7fd0ff" /></mesh>
      </group>
    );
  if (kind === 'axe') return <mesh position={[0, -0.08, 0]}><dodecahedronGeometry args={[0.08]} /><meshStandardMaterial color="#8a8a88" flatShading /></mesh>;
  return null;
};

/* ---------- environment pieces ---------- */
export const Ground: React.FC<{color: string; size?: number; y?: number}> = ({color, size = 120, y = 0}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

export const Fire: React.FC<{pos: V3; s?: number; t: number; light?: number; out?: number}> = ({pos, s = 1, t, light = 7, out = 1}) => {
  const f = (1 + 0.16 * Math.sin(t * 17 + pos[0]) + 0.1 * Math.sin(t * 11.3 + pos[2])) * out;
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0.6, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.8, 8]} /><meshStandardMaterial color="#3a2414" /></mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, -0.6, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.8, 8]} /><meshStandardMaterial color="#4a2c17" /></mesh>
      {f > 0.02 && (
        <>
          <mesh position={[0, 0.36 * f, 0]} scale={[1, f, 1]}><coneGeometry args={[0.26, 0.75, 9]} /><meshBasicMaterial color="#ff7a1a" /></mesh>
          <mesh position={[0, 0.28 * f, 0.02]} scale={[1, f, 1]}><coneGeometry args={[0.15, 0.5, 9]} /><meshBasicMaterial color="#ffc84a" /></mesh>
        </>
      )}
      {light > 0 && f > 0.02 && <pointLight position={[0, 0.7, 0]} color="#ff9440" intensity={light * f} distance={10} decay={1.4} />}
    </group>
  );
};

export const Torch: React.FC<{pos: V3; t: number; on: number; light?: boolean}> = ({pos, t, on, light}) => {
  const f = on * (1 + 0.15 * Math.sin(t * 15 + pos[2] * 3));
  return (
    <group position={pos}>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.035, 0.045, 1.4, 6]} /><meshStandardMaterial color="#3a2414" /></mesh>
      {f > 0.02 && <mesh position={[0, 1.55, 0]} scale={[f, f, f]}><coneGeometry args={[0.12, 0.38, 8]} /><meshBasicMaterial color="#ffae3c" /></mesh>}
      {f > 0.02 && <mesh position={[0, 1.55, 0]} scale={[f * 2.4, f * 2.4, f * 2.4]}><sphereGeometry args={[0.13, 10, 10]} /><meshBasicMaterial color="#ff8a2a" transparent opacity={0.22} /></mesh>}
      {light && f > 0.02 && <pointLight position={[0, 1.7, 0]} color="#ffa04a" intensity={3.2 * f} distance={7} decay={1.5} />}
    </group>
  );
};

export const Shelter: React.FC<{pos: V3; rotY?: number; s?: number; color?: string}> = ({pos, rotY = 0, s = 1, color = '#9a6a42'}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={s}>
    <mesh position={[0, 0.7, 0]}><coneGeometry args={[0.95, 1.45, 7]} /><meshStandardMaterial color={color} roughness={1} flatShading /></mesh>
    <mesh position={[0, 0.45, 0.62]} rotation={[-0.35, 0, 0]}><planeGeometry args={[0.45, 0.8]} /><meshStandardMaterial color="#2a1a14" side={THREE.DoubleSide} /></mesh>
  </group>
);

export const Acacia: React.FC<{pos: V3; s?: number; color?: string}> = ({pos, s = 1, color = '#2a1a2e'}) => (
  <group position={pos} scale={s}>
    <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.12]}><cylinderGeometry args={[0.07, 0.12, 2.4, 6]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0.15, 2.45, 0]} scale={[1.9, 0.32, 1.2]}><sphereGeometry args={[0.9, 10, 8]} /><meshStandardMaterial color={color} flatShading /></mesh>
  </group>
);

export const Pine: React.FC<{pos: V3; s?: number; color?: string}> = ({pos, s = 1, color = '#1f2e3a'}) => (
  <group position={pos} scale={s}>
    <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.08, 0.1, 0.8, 6]} /><meshStandardMaterial color="#2a1a14" /></mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, 1.1 + i * 0.75, 0]}><coneGeometry args={[0.95 - i * 0.25, 1.3, 7]} /><meshStandardMaterial color={color} flatShading /></mesh>
    ))}
  </group>
);

export const Rock: React.FC<{pos: V3; s?: V3; color?: string; rot?: number}> = ({pos, s = [1, 1, 1], color = '#4a3d55', rot = 0}) => (
  <mesh position={pos} scale={s} rotation={[0, rot, 0.2]}>
    <dodecahedronGeometry args={[0.6, 0]} />
    <meshStandardMaterial color={color} flatShading roughness={1} />
  </mesh>
);

export const Stars: React.FC<{n?: number; seed?: number; r?: number; minY?: number}> = ({n = 400, seed = 3, r = 60, minY = 4}) => {
  const geo = useMemo(() => {
    const R = rand(seed); const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = R() * Math.PI * 2, ph = R() * 1.2;
      arr[i * 3] = Math.cos(th) * Math.cos(ph) * r; arr[i * 3 + 1] = minY + Math.sin(ph) * r; arr[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * r - 20;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3)); return g;
  }, [n, seed, r, minY]);
  return <points geometry={geo}><pointsMaterial color="#fff4e0" size={0.18} sizeAttenuation /></points>;
};

/* instanced little people (heads + bodies) */
export const Crowd: React.FC<{positions: V3[]; visible: number; color?: string; head?: string; s?: number; opacity?: number}> = ({positions, visible, color = '#5a3a2a', head = INK, s = 1, opacity = 1}) => {
  const heads = useRef<THREE.InstancedMesh>(null);
  const bodies = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      m.makeTranslation(p[0], p[1] + 0.95 * s, p[2]); heads.current?.setMatrixAt(i, m);
      m.makeTranslation(p[0], p[1] + 0.45 * s, p[2]); bodies.current?.setMatrixAt(i, m);
    });
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
  }, [positions, s]);
  const n = Math.max(0, Math.min(positions.length, Math.round(visible)));
  return (
    <>
      <instancedMesh ref={heads} args={[undefined, undefined, positions.length]} count={n}>
        <sphereGeometry args={[0.2 * s, 12, 12]} />
        <meshStandardMaterial color={head} roughness={0.8} transparent={opacity < 1} opacity={opacity} />
      </instancedMesh>
      <instancedMesh ref={bodies} args={[undefined, undefined, positions.length]} count={n}>
        <cylinderGeometry args={[0.14 * s, 0.2 * s, 0.6 * s, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} transparent={opacity < 1} opacity={opacity} />
      </instancedMesh>
    </>
  );
};

export const Rain: React.FC<{t: number; n?: number; area?: number}> = ({t, n = 260, area = 14}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {const R = rand(9); return Array.from({length: n}, () => [R() * area - area / 2, R() * 10, R() * area - area / 2 - 2]);}, [n, area]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    seeds.forEach(([x, y0, z], i) => {const y = ((y0 - t * 14) % 10 + 10) % 10; m.makeTranslation(x, y, z); ref.current?.setMatrixAt(i, m);});
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [t, seeds]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <boxGeometry args={[0.012, 0.45, 0.012]} />
      <meshBasicMaterial color="#b8c6ff" transparent opacity={0.55} />
    </instancedMesh>
  );
};

export const Robin: React.FC<{pos: V3; t: number; flap?: number; rotY?: number; s?: number; band?: boolean}> = ({pos, t, flap = 0, rotY = 0, s = 1, band}) => {
  const w = flap > 0 ? Math.sin(t * 40) * 0.9 * flap : 0;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh scale={[1, 0.9, 1.35]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color="#121218" roughness={0.6} /></mesh>
      <mesh position={[0, 0.17, 0.16]}><sphereGeometry args={[0.11, 14, 14]} /><meshStandardMaterial color="#121218" roughness={0.6} /></mesh>
      <mesh position={[0.045, 0.2, 0.25]}><circleGeometry args={[0.022, 10]} /><meshBasicMaterial color={CREAM} /></mesh>
      <mesh position={[-0.045, 0.2, 0.25]}><circleGeometry args={[0.022, 10]} /><meshBasicMaterial color={CREAM} /></mesh>
      <mesh position={[0, 0.15, 0.3]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.025, 0.09, 8]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <mesh position={[0, 0.02, -0.28]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.1, 0.02, 0.22]} /><meshStandardMaterial color="#121218" /></mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.17, 0.04, 0]} rotation={[0, 0, sd * (0.2 + w)]}><boxGeometry args={[0.24, 0.02, 0.2]} /><meshStandardMaterial color="#1a1a22" /></mesh>
      ))}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.05, -0.2, 0]}><cylinderGeometry args={[0.01, 0.01, 0.14, 6]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      ))}
      {band && <mesh position={[0.05, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.018, 0.008, 6, 12]} /><meshBasicMaterial color="#4fa3ff" /></mesh>}
    </group>
  );
};

export const Antelope: React.FC<{pos: V3; t: number; s?: number; rotY?: number}> = ({pos, t, s = 1, rotY = 0}) => {
  const g = Math.sin(t * 14) * 0.6;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.9, 0]} scale={[0.35, 0.35, 1]}><sphereGeometry args={[0.6, 10, 8]} /><meshStandardMaterial color="#2a1a22" flatShading /></mesh>
      <mesh position={[0, 1.3, 0.55]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.06, 0.09, 0.6, 6]} /><meshStandardMaterial color="#2a1a22" /></mesh>
      <mesh position={[0, 1.55, 0.7]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#2a1a22" /></mesh>
      {[[-0.12, 0.4], [0.12, 0.4], [-0.12, -0.4], [0.12, -0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]} rotation={[(i % 2 ? g : -g), 0, 0]}><cylinderGeometry args={[0.03, 0.025, 0.9, 6]} /><meshStandardMaterial color="#2a1a22" /></mesh>
      ))}
    </group>
  );
};

/* simple gym set */
export const Gym: React.FC<{t: number; crowd?: number; crowdOpacity?: number}> = ({t, crowd = 0, crowdOpacity = 1}) => {
  const seats = useMemo(() => {
    const out: V3[] = [];
    for (let row = 0; row < 9; row++) for (let i = 0; i < 34; i++) out.push([-8.2 + i * 0.5 + (row % 2) * 0.25, 0.5 + row * 0.5, -6 - row * 0.62]);
    return out;
  }, []);
  return (
    <group>
      <Ground color="#7a4a2a" size={40} />
      {/* court lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[1.8, 1.9, 48]} /><meshBasicMaterial color="#e8d6b8" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><planeGeometry args={[0.1, 24]} /><meshBasicMaterial color="#e8d6b8" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}><planeGeometry args={[20, 0.1]} /><meshBasicMaterial color="#e8d6b8" /></mesh>
      {/* bleachers */}
      {Array.from({length: 9}).map((_, row) => (
        <mesh key={row} position={[0, 0.25 + row * 0.5, -6 - row * 0.62]}><boxGeometry args={[18, 0.5 + row * 0.0, 0.62]} /><meshStandardMaterial color={row % 2 ? '#3a2a48' : '#45325a'} roughness={0.9} /></mesh>
      ))}
      <mesh position={[0, 6, -12.5]}><planeGeometry args={[40, 14]} /><meshStandardMaterial color="#2a1d3a" /></mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 10, 5, -2]} rotation={[0, -sd * Math.PI / 2, 0]}><planeGeometry args={[30, 12]} /><meshStandardMaterial color="#33244a" /></mesh>
      ))}
      {/* high windows + light shafts */}
      {[-6, -2, 2, 6].map((x) => (
        <group key={x}>
          <mesh position={[x, 8.2, -12.4]}><planeGeometry args={[2.2, 1.6]} /><meshBasicMaterial color="#ffb45a" /></mesh>
          <mesh position={[x * 0.8, 4.5, -7]} rotation={[0.55, 0, 0]}><planeGeometry args={[2, 11]} /><meshBasicMaterial color="#ffb45a" transparent opacity={0.07 + 0.02 * Math.sin(t + x)} depthWrite={false} /></mesh>
        </group>
      ))}
      <Crowd positions={seats} visible={crowd} color="#6a4a3a" opacity={crowdOpacity} s={0.9} />
    </group>
  );
};

/* DNA helix */
export const Helix: React.FC<{t: number; hot?: number}> = ({t, hot = 0}) => {
  const items = [];
  for (let i = 0; i < 30; i++) {
    const y = i * 0.28, a = t * 0.9 + i * 0.45;
    const x1 = Math.cos(a) * 0.9, z1 = Math.sin(a) * 0.9;
    const isHot = hot > 0 && (i === 14 || i === 15);
    items.push(
      <group key={i} position={[0, y, 0]}>
        <mesh position={[x1, 0, z1]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color={isHot ? '#ffb02e' : '#ff9a4a'} emissive={isHot ? '#ffb02e' : '#7a3a1a'} emissiveIntensity={isHot ? 1.5 * hot : 0.6} /></mesh>
        <mesh position={[-x1, 0, -z1]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#c08fff" emissive="#4a2a7a" emissiveIntensity={0.7} /></mesh>
        <mesh rotation={[0, -a, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 1.8, 6]} /><meshStandardMaterial color={isHot ? '#ffb02e' : '#7a6a9a'} emissive={isHot ? '#ffb02e' : '#000'} emissiveIntensity={hot} /></mesh>
      </group>,
    );
  }
  return <group position={[0, -4.2, 0]}>{items}</group>;
};
