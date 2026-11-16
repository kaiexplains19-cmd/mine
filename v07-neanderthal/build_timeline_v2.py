import json,re
exec(open('script.py').read())
D=json.load(open('durations.json')); WS=json.load(open('words.json'))
FPS=24
# Ifverse-style breathing room: base gap, extra after dialogue exchanges, long holds on story beats
HOLD={1:3.0,3:1.5,6:2.0,12:1.0,  # cold open, premise
}
BEATS=["stay standing","the last one","Two.","Spears rise","Take it.","Do it again","Every single one of them sees spring","Not anymore","you were here","or the boy?",
 "You jump","Your arm is broken","You saved my son","He's family","Our species and yours had children","isn't the same as being the end",
 "They're in us","Your daughter's","We were here","watching the snow fall"]
def hold_for(i,x):
    h=1.75 if x['who']=='N' else 0.95
    if any(b in x['text'] for b in BEATS): h+=3.6
    if i+1<len(S) and S[i+1]['set']!=x['set']: h+=0.6
    return h
t=0.8; lines=[]; words=[]; cues=[]; facts=[]; occ={}
for i,x in enumerate(S):
    k=occ.get(x['set'],0); occ[x['set']]=k+1
    sw=x['text'].split(); ws=WS[i]
    s0=ws[0][1] if ws else 0; e0=ws[-1][2] if ws else D[i]
    if len(ws)==len(sw): times=[(t+a,t+b) for _,a,b in ws]
    else:
        tot=sum(len(w) for w in sw); acc=0; times=[]
        for w in sw: a=s0+(e0-s0)*acc/tot; acc+=len(w); times.append((t+a,t+s0+(e0-s0)*acc/tot))
    w0=len(words)
    for w,(a,b) in zip(sw,times): words.append({'w':w.upper(),'s':round(a,3),'e':round(b,3)})
    cur=[]
    for j,w in enumerate(sw):
        cur.append(j)
        if re.search(r'[.,?!]$',w) or len(cur)==5 or j==len(sw)-1:
            cues.append({'s':round(times[cur[0]][0],3),'e':round(times[cur[-1]][1],3),'w0':w0+cur[0],'n':len(cur),'who':x['who']}); cur=[]
    start=t-0.25 if i else 0.0
    if x.get('fact'): facts.append({'t':x['fact'],'s':round(t+0.4,3),'e':round(t+min(3.2,D[i]+0.8),3)})
    lines.append({'i':i,'set':x['set'],'cam':x['cam'],'who':x['who'],'k':k,'v':x.get('v',''),'s':round(start,3),'vo':round(t,3),'sfx':x.get('sfx',[]),'dur':round(D[i],3)})
    t+=D[i]+hold_for(i,x)
total=t+6.0
for j,l in enumerate(lines): l['e']=lines[j+1]['s'] if j+1<len(lines) else round(total,3)
for j in range(len(cues)-1):
    if cues[j+1]['s']-cues[j]['e']<0.5: cues[j]['e']=cues[j+1]['s']
json.dump({'fps':FPS,'total':round(total,3),'lines':lines,'cues':cues,'words':words,'facts':facts},open('/home/user/remotion-studio/src/v07/timeline.json','w'))
print('total',round(total,1),'s =',int(total//60),'min',int(total%60),'s; shots',len(lines),'avg shot',round(total/len(lines),1),'s')
