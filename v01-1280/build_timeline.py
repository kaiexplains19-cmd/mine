import json,re
L=json.load(open('lines.json')); D=json.load(open('durations.json')); WS=json.load(open('words.json'))
FPS=24; LEAD=0.35; GAP=0.4
# line -> list of (shotId, split-before-script-word-index)
SPLIT={0:[('gymEmpty',0),('gymPacked',8)],1:[('climb',0),('torchesOut',13)],2:[('camp',0)],3:[('seasons',0)],
 4:[('drought',0),('herd',10)],5:[('flood',0)],6:[('shelter',0)],7:[('coast',0),('flight',17)],
 8:[('ridge',0),('clearing',16)],9:[('sharedFire',0),('dna',13)],10:[('gymFade',0)],11:[('viewerClose',0)],12:[('question',0)]}
def norm(w): return re.sub(r"[^a-z0-9']","",w.lower())
shots=[];cues=[];words_out=[];t=LEAD
for i,line in enumerate(L):
    sw=line.split(); ws=WS[i]
    s0=ws[0][1] if ws else 0; e0=ws[-1][2] if ws else D[i]
    # per-script-word timing: positional if counts match, else proportional by characters
    if len(ws)==len(sw):
        times=[(t+a,t+b) for _,a,b in ws]
    else:
        tot=sum(len(w) for w in sw); acc=0; times=[]
        for w in sw:
            a=s0+(e0-s0)*acc/tot; acc+=len(w); b=s0+(e0-s0)*acc/tot; times.append((t+a,t+b))
    for w,(a,b) in zip(sw,times): words_out.append({'w':w.upper(),'s':round(a,3),'e':round(b,3)})
    # semantic cues: break at punctuation, max 4 words
    cur=[]
    for k,w in enumerate(sw):
        cur.append(k)
        if re.search(r'[.,?!]$',w) or len(cur)==4 or k==len(sw)-1:
            cues.append({'s':round(times[cur[0]][0],3),'e':round(times[cur[-1]][1],3),'w0':len(words_out)-len(sw)+cur[0],'n':len(cur)}); cur=[]
    # shots
    parts=SPLIT[i]
    for j,(sid,widx) in enumerate(parts):
        st=t if j==0 else times[widx][0]-0.15
        shots.append({'id':sid,'s':round(st,3)})
    t+=D[i]+GAP
total=t+1.6
for j,s in enumerate(shots): s['e']=shots[j+1]['s'] if j+1<len(shots) else round(total,3)
# extend cue end to next cue start if short pause (hold last word)
for j in range(len(cues)-1):
    if cues[j+1]['s']-cues[j]['e']<0.6: cues[j]['e']=cues[j+1]['s']
facts=[('1,280','twelve',2),('100,000+ YEARS','hundred',3),('1980','1980,',7),('1 PAIR','one',7),('1–2%','one',9),('8,000,000,000','eight',10)]
fx=[]
for label,word,line in facts:
    base=sum(len(l.split()) for l in L[:line]); sw=L[line].split()
    k=next(k for k,w in enumerate(sw) if norm(w)==norm(word) and (label!='1 PAIR' or sw[k+1].startswith('breeding')) and (label!='1–2%' or sw[k+1]=='to'))
    s=words_out[base+k]['s']; fx.append({'t':label,'s':round(s,3),'e':round(s+2.2,3)})
json.dump({'fps':FPS,'total':round(total,3),'shots':shots,'cues':cues,'words':words_out,'facts':fx,
  'vo':[{'file':f'v01/l{i:02d}.wav'} for i in range(len(L))]},open('/home/user/remotion-studio/src/v01/timeline.json','w'),indent=1)
print('total',round(total,2))
for s in shots: print(f"{s['id']:12s} {s['s']:7.2f} {s['e']-s['s']:5.2f}s")
print(fx)
