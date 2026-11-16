import json, sys, subprocess, numpy as np, soundfile as sf
from kokoro import KPipeline
exec(open('script.py').read())
NARR = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
CAST = {'N': (NARR, 0.86, 1.0), 'YOU': ('am_fenrir', 0.95, 1.0), 'GRAN': ('bf_isabella', 0.88, 0.96), 'KID': ('af_sky', 1.0, 1.08),
        'AMA': ('af_heart', 0.98, 1.0), 'MAN': ('am_liam', 1.0, 1.0), 'BOY': ('af_nicole', 1.02, 1.12), 'ELDER': ('bm_lewis', 0.92, 0.97), 'SCI': ('bm_george', 0.95, 1.0), 'MOM': ('af_bella', 1.0, 1.0)}
pa = KPipeline(lang_code='a'); pb = KPipeline(lang_code='b')
D = []
for i, x in enumerate(S):
    v, sp, pitch = CAST[x['who']]
    p = pb if v.startswith('b') else pa
    a = np.concatenate([c.numpy() if hasattr(c, 'numpy') else c for _, _, c in p(x['text'], voice=v, speed=sp)])
    raw = f'audio/raw{i:03d}.wav'; out = f'audio/l{i:03d}.wav'
    sf.write(raw, a, 24000)
    af = f'asetrate={int(24000*pitch)},aresample=48000,atempo={1/pitch:.4f}' if pitch != 1.0 else 'aresample=48000'
    af += ',highpass=f=70,silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ac', '1', out], check=True)
    D.append(sf.info(out).duration)
json.dump(D, open('durations.json', 'w'))
print('speech', round(sum(D), 1), 's with narrator', NARR)
