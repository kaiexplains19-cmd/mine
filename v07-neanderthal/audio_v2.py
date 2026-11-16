"""Original score + event SFX + dialogue mix for 'The Last Neanderthal'. Everything is synthesized here (no third-party audio)."""
import json, wave, subprocess, numpy as np, scipy.signal as ss

TL = json.load(open('/home/user/remotion-studio/src/v07/timeline.json'))
SR = 48000; T = TL['total']; N = int(T * SR); rng = np.random.default_rng(11)
tt = lambda n: np.arange(n) / SR

def rd(f):
    w = wave.open(f); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if w.getframerate() != SR: a = ss.resample_poly(a, SR, w.getframerate())
    return a
def lowp(x, f, o=2): b, a = ss.butter(o, f / (SR / 2)); return ss.lfilter(b, a, x)
def hip(x, f, o=2): b, a = ss.butter(o, f / (SR / 2), 'high'); return ss.lfilter(b, a, x)
def bp(x, lo, hi): b, a = ss.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return ss.lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def env(n, a=0.01, r=0.3):
    e = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR))
    e[:min(A, n)] = np.linspace(0, 1, min(A, n)); e[-min(R, n):] *= np.linspace(1, 0, min(R, n)); return e
def put(buf, x, at, g=1.0):
    s = int(at * SR)
    if s >= len(buf) or s + len(x) <= 0: return
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x)); buf[s:e] += x[:e - s] * g
def reverb(x, secs=1.6, mix=0.35):
    n = int(secs * SR); ir = noise(n) * np.exp(-np.arange(n) / SR * (6.9 / secs)); ir = lowp(ir, 4000); ir /= np.sqrt(np.sum(ir ** 2))
    wet = ss.fftconvolve(x, ir)[:len(x)]; return x * (1 - mix) + wet * mix
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- SFX ----------------
def s_wind(d=4): n = int(d * SR); return lowp(noise(n), 450) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tt(n))) * env(n, 0.8, 1.0) * 1.4
def s_fire(d=4):
    n = int(d * SR); x = lowp(noise(n), 900) * 0.3; c = np.zeros(n); k = rng.random(n) < 0.001; c[k] = rng.uniform(0.3, 1, k.sum())
    return (x + hip(np.convolve(c, np.exp(-np.arange(300) / 40), 'same'), 1500)) * env(n, 0.5, 0.8)
def s_drip(d=1.2):
    n = int(d * SR); y = np.zeros(n)
    for at in (0.05, 0.6):
        L = int(0.12 * SR); f = np.linspace(1800, 900, L); s0 = int(at * SR); y[s0:s0 + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.arange(L) / SR * 30)
    return y * 0.6
def s_blow(d=1.4): n = int(d * SR); return bp(noise(n), 300, 3000) * env(n, 0.15, 0.9) * 0.8
def s_sting(d=3.0):
    n = int(d * SR); x = sum(np.sin(2 * np.pi * NOTE(m) * tt(n)) for m in (45, 52, 57)) * np.exp(-tt(n) * 1.6)
    return (x + lowp(noise(n), 200) * np.exp(-tt(n) * 4) * 2) * 0.35
def s_whoosh(d=0.9): n = int(d * SR); return bp(noise(n), 500, 4000) * np.hanning(n) * 0.9
def s_boom(d=2.5): n = int(d * SR); f = np.linspace(60, 30, n); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 2.2) * 1.2 + lowp(noise(n), 150) * np.exp(-tt(n) * 5)
def s_hooves(d=2.5):
    n = int(d * SR); y = np.zeros(n)
    for b in np.arange(0.05, d, 0.13): L = int(0.06 * SR); put(y, lowp(noise(L), 600) * np.exp(-np.arange(L) / SR * 50), b, 1.3)
    return y * np.linspace(1, 0.4, n)
def s_thud(d=0.8): n = int(d * SR); f = np.linspace(90, 40, n); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 9) * 1.4 + lowp(noise(n), 400) * np.exp(-tt(n) * 18)
def s_crack(d=0.4): n = int(d * SR); return hip(noise(n), 1200) * np.exp(-tt(n) * 35) * 1.5
def s_roar(d=1.8):
    n = int(d * SR); f = 90 + 30 * np.sin(2 * np.pi * 3 * tt(n)); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + bp(noise(n), 150, 900)
    return lowp(x, 900) * env(n, 0.15, 0.7) * 1.1
def s_growl(d=2.4): n = int(d * SR); return lowp(bp(noise(n), 60, 400) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt(n))), 500) * env(n, 0.4, 0.8) * 1.6
def s_drums(d=4.0):
    n = int(d * SR); y = np.zeros(n)
    for j, b in enumerate(np.arange(0, d, 0.5)):
        L = int(0.35 * SR); f = np.linspace(110, 45, L); put(y, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.arange(L) / SR * 9), b, 1.0 if j % 2 == 0 else 0.6)
    return y * np.linspace(0.4, 1, n)
def s_crowd(d=4): n = int(d * SR); return bp(noise(n), 300, 1800) * lowp(np.abs(noise(n)), 8) * 4 * env(n, 0.6, 0.8)
def s_twig(d=0.3): n = int(d * SR); return hip(noise(n), 2000) * np.exp(-tt(n) * 60) * 2
def s_heartbeat(d=3.2):
    n = int(d * SR); y = np.zeros(n)
    for b in np.arange(0.1, d, 0.85):
        for off, a in ((0, 1), (0.22, 0.7)): L = int(0.15 * SR); put(y, np.sin(2 * np.pi * 50 * np.arange(L) / SR) * np.exp(-np.arange(L) / SR * 25), b + off, a)
    return y * 1.3
def s_waves(d=5): n = int(d * SR); return lowp(noise(n), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * tt(n)) ** 2) * env(n, 1, 1.2) * 1.2
def s_swell(d=3.5):
    n = int(d * SR); x = sum(np.sin(2 * np.pi * NOTE(m) * tt(n)) for m in (57, 60, 64, 69)) * np.linspace(0, 1, n) ** 2
    return (x * 0.25 + bp(noise(n), 2000, 8000) * np.linspace(0, 0.3, n) ** 2) * env(n, 0.05, 0.3)
def s_lab(d=2.5):
    n = int(d * SR); y = np.zeros(n)
    for j, b in enumerate(np.arange(0.1, d, 0.4)): L = int(0.08 * SR); put(y, np.sin(2 * np.pi * (1200 + 300 * (j % 3)) * np.arange(L) / SR) * np.hanning(L), b, 0.3)
    return y + np.sin(2 * np.pi * 60 * tt(n)) * 0.04
def s_steps(d=2.0):
    n = int(d * SR); y = np.zeros(n)
    for b in np.arange(0.1, d, 0.55): L = int(0.07 * SR); put(y, lowp(noise(L), 500) * np.exp(-np.arange(L) / SR * 45), b, 1.0)
    return y
SFX = {k[2:]: v for k, v in globals().items() if k.startswith('s_')}
GAIN = {'wind': 0.25, 'fire': 0.3, 'drip': 0.35, 'blow': 0.3, 'sting': 0.55, 'whoosh': 0.3, 'boom': 0.6, 'hooves': 0.45, 'thud': 0.7, 'crack': 0.5,
        'roar': 0.5, 'growl': 0.45, 'steps': 0.35, 'drums': 0.45, 'crowd': 0.25, 'twig': 0.5, 'heartbeat': 0.55, 'waves': 0.3, 'swell': 0.5, 'lab': 0.4}

# ---------------- SCORE ----------------
MOOD = {'caveArt': 'melancholy', 'hillsNight': 'melancholy', 'timeline': 'wonder', 'caveHome': 'warm', 'steppeHunt': 'wonder', 'strangers': 'mystery',
        'sapiensCamp': 'warm', 'meeting': 'mystery', 'sharedFire': 'warm', 'burial': 'sad', 'coast': 'melancholy', 'mixedFamily': 'hope', 'lab': 'mystery', 'worldDNA': 'hope'}
P = {  # chords (MIDI roots for triads), bpm, layer gains: pad, pluck, piano, drum
 'mystery':   ([(45, 'm'), (41, 'M'), (43, 'M'), (40, 'm')], 70, (0.9, 0.5, 0.0, 0.0)),
 'melancholy':([(45, 'm'), (40, 'm'), (41, 'M'), (36, 'M')], 64, (0.8, 0.0, 0.7, 0.0)),
 'epic':      ([(45, 'm'), (41, 'M'), (36, 'M'), (43, 'M')], 84, (1.0, 0.6, 0.0, 0.7)),
 'warm':      ([(48, 'M'), (43, 'M'), (45, 'm'), (41, 'M')], 76, (0.7, 0.6, 0.4, 0.0)),
 'tense':     ([(45, 'm'), (46, 'M'), (45, 'm'), (44, 'M')], 96, (0.6, 0.8, 0.0, 0.8)),
 'drums':     ([(40, 'm'), (41, 'M'), (40, 'm'), (38, 'm')], 90, (0.6, 0.3, 0.0, 1.0)),
 'wonder':    ([(48, 'M'), (45, 'm'), (41, 'M'), (43, 'M')], 80, (0.8, 0.7, 0.3, 0.3)),
 'sad':       ([(45, 'm'), (41, 'M'), (48, 'M'), (43, 'M')], 60, (0.7, 0.0, 0.9, 0.0)),
 'haunting':  ([(40, 'm'), (36, 'M'), (43, 'M'), (38, 'm')], 66, (0.9, 0.4, 0.4, 0.0)),
 'hope':      ([(48, 'M'), (43, 'M'), (45, 'm'), (41, 'M')], 82, (0.9, 0.6, 0.6, 0.35)),
 'pulse':     ([(45, 'm'), (41, 'M'), (48, 'M'), (43, 'M')], 100, (0.6, 0.9, 0.0, 0.5)),
}
def triad(root, q): return [root, root + (3 if q == 'm' else 4), root + 7]
def ks_pluck(f, d=0.9):
    n = int(d * SR); L = max(2, int(SR / f)); buf = rng.uniform(-1, 1, L); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % L]; buf[i % L] = 0.5 * (buf[i % L] + buf[(i + 1) % L]) * 0.996
    return out
PL = {}
def pluck(m):
    if m not in PL: PL[m] = ks_pluck(NOTE(m))
    return PL[m]
def piano(m, d=2.2):
    n = int(d * SR); f = NOTE(m); x = sum(a * np.sin(2 * np.pi * f * h * tt(n)) for h, a in ((1, 1), (2, 0.45), (3, 0.2), (4, 0.1)))
    return x * np.exp(-tt(n) * 2.2) * env(n, 0.005, 0.2)
def kick(): n = int(0.35 * SR); f = np.linspace(120, 45, n); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 10)
def shaker(): n = int(0.06 * SR); return hip(noise(n), 5000) * np.hanning(n) * 0.25
KICK, SHK = kick(), shaker()

def render_segment(mood, d):
    chords, bpm, (gpad, gpl, gpi, gdr) = P[mood]; n = int(d * SR); y = np.zeros(n)
    beat = 60 / bpm; bar = beat * 4
    for b in range(int(np.ceil(d / bar))):
        root, q = chords[b % len(chords)]; notes = triad(root, q); t0 = b * bar
        L = int(bar * SR) + int(0.6 * SR)
        if gpad:
            pad = sum(np.sin(2 * np.pi * NOTE(m + 12) * tt(L) + k) + 0.5 * np.sin(2 * np.pi * NOTE(m + 12) * 1.003 * tt(L)) for k, m in enumerate(notes))
            put(y, lowp(pad, 1400) * env(L, 0.6, 0.7) * 0.05 * gpad, t0)
        if gpl:
            arp = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[1] + 24]
            for s8 in range(8): put(y, pluck(arp[s8 % 4]) * 0.12 * gpl, t0 + s8 * beat / 2)
        if gpi:
            put(y, piano(notes[0] + 12) * 0.09 * gpi, t0); put(y, piano(notes[2] + 24, 1.6) * 0.06 * gpi, t0 + beat * 2); put(y, piano(notes[1] + 24, 1.6) * 0.05 * gpi, t0 + beat * 3)
        if gdr:
            for s4 in range(4): put(y, KICK * 0.35 * gdr, t0 + s4 * beat); put(y, SHK * gdr, t0 + s4 * beat + beat / 2)
    return y * env(n, 1.2, 1.5)

music = np.zeros(N)
segs = []
for l in TL['lines']:
    m = MOOD[l['set']]
    if l['set'] == 'sharedFire' and any(f in l.get('v', '') for f in ('lion', 'fight')): m = 'tense'
    if segs and segs[-1][0] == m: segs[-1][2] = l['e']
    else: segs.append([m, l['s'], l['e']])
for m, s, e in segs:
    put(music, render_segment(m, (e - s) + 1.5), max(0, s - 0.75))
music = reverb(music, 2.2, 0.3)

# ---------------- VO + SFX (v2: continuous ambience per scene run + event SFX only) ----------------
vo = np.zeros(N); sfx = np.zeros(N); cave = {'caveArt', 'caveHome', 'burial'}
for l in TL['lines']:
    a = rd(f'audio/l{l["i"]:03d}.wav')
    if l['set'] in cave: a = reverb(a, 0.9, 0.12)
    put(vo, a, l['vo'])
    for j, name in enumerate(l['sfx']):
        if name not in SFX: continue
        x = SFX[name](); x = x / (np.max(np.abs(x)) + 1e-9)
        if l['set'] in cave: x = reverb(x, 1.2, 0.3)
        put(sfx, x * GAIN[name], l['vo'] + 0.35 + j * 0.3)
AMB = {'caveArt': 'drip', 'caveHome': 'fire', 'burial': 'wind', 'hillsNight': 'wind', 'steppeHunt': 'wind', 'coast': 'waves', 'sharedFire': 'fire',
       'mixedFamily': 'fire', 'meeting': 'wind', 'strangers': 'wind', 'sapiensCamp': 'crowd', 'timeline': None, 'lab': 'lab', 'worldDNA': None}
AMB_G = {'drip': 0.05, 'fire': 0.07, 'wind': 0.06, 'waves': 0.08, 'crowd': 0.035, 'lab': 0.05}
runs = []
for l in TL['lines']:
    if runs and runs[-1][0] == l['set']: runs[-1][2] = l['e']
    else: runs.append([l['set'], l['s'], l['e']])
for st, s0, e0 in runs:
    kind = AMB.get(st)
    if not kind: continue
    d = e0 - s0 + 1.0
    if kind == 'drip':
        x = np.zeros(int(d * SR))
        for b in np.arange(0.5, d, 2.7): put(x, s_drip(), b, 0.8)
        x = reverb(x, 1.6, 0.45) + lowp(noise(len(x)), 300) * 0.15
    elif kind == 'lab':
        x = np.sin(2 * np.pi * 60 * tt(int(d * SR))) * 0.3 + lowp(noise(int(d * SR)), 400) * 0.2
    else:
        x = SFX[kind](d)
    x = x / (np.max(np.abs(x)) + 1e-9) * AMB_G[kind] * env(len(x), 0.8, 0.8)
    put(sfx, x, s0 - 0.5)
v_env = lowp(np.abs(vo), 6); duck = 1 - 0.6 * np.clip(v_env / 0.06, 0, 1)
mix = vo + music * duck * 0.55 + sfx * (1 - 0.3 * np.clip(v_env / 0.06, 0, 1))
mix /= np.max(np.abs(mix)) * 1.1
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
w = wave.open('mix_raw.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2',
                '/home/user/remotion-studio/public/v07/mix.wav'], check=True)
print('mix ok', round(T, 1), 's; score segments:', len(segs))
