import json,wave,numpy as np,subprocess
from faster_whisper import WhisperModel
exec(open('script.py').read())
m=WhisperModel('small.en',device='cpu',compute_type='int8'); out=[]
for i in range(len(S)):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'audio/l{i:03d}.wav','-ar','16000','-ac','1','audio/w16.wav'],check=True)
    w=wave.open('audio/w16.wav'); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    segs,_=m.transcribe(a,word_timestamps=True,language='en')
    out.append([(x.word.strip(),round(x.start,2),round(x.end,2)) for s in segs for x in s.words])
json.dump(out,open('words.json','w')); print('words ok',len(out))
