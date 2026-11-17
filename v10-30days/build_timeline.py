import json, re, sys
exec(open('script.py').read())
D = json.load(open('durations.json')); WS = json.load(open('words.json'))
FPS = 24
# Ifverse rhythm (measured): talking ~160 wpm, a pause of ~0.6-1.7 s between sentences, quick back-and-forth
# dialogue, longer holds only on story beats. GAP scales everything to land the runtime.
GAP = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
def hold_for(i, x):
    nxt = S[i + 1] if i + 1 < len(S) else None
    h = 0.75 if x['who'] == 'N' else 0.5
    if nxt and nxt['who'] != x['who']: h += 0.15          # speaker change
    if nxt and nxt['set'] != x['set']: h += 0.35          # scene change
    if nxt and nxt.get('mus'): h += 0.4                   # section change
    h *= GAP
    h += x.get('beat', 0) + x.get('drop', 0)
    return h
t = 0.6; lines = []; words = []; cues = []; facts = []; occ = {}
for i, x in enumerate(S):
    k = occ.get(x['set'], 0); occ[x['set']] = k + 1
    sw = x['text'].split(); ws = WS[i]
    s0 = ws[0][1] if ws else 0; e0 = ws[-1][2] if ws else D[i]
    if len(ws) == len(sw): times = [(t + a, t + b) for _, a, b in ws]
    else:
        tot = sum(len(w) for w in sw); acc = 0; times = []
        for w in sw: a = s0 + (e0 - s0) * acc / tot; acc += len(w); times.append((t + a, t + s0 + (e0 - s0) * acc / tot))
    w0 = len(words)
    for w, (a, b) in zip(sw, times): words.append({'w': w.upper(), 's': round(a, 3), 'e': round(b, 3)})
    cur = []
    for j, w in enumerate(sw):
        cur.append(j)
        if re.search(r'[.,?!…]$', w) or len(cur) == 5 or j == len(sw) - 1:
            cues.append({'s': round(times[cur[0]][0], 3), 'e': round(times[cur[-1]][1], 3), 'w0': w0 + cur[0], 'n': len(cur), 'who': x['who']}); cur = []
    start = t - 0.2 if i else 0.0
    if x.get('fact'): facts.append({'t': x['fact'], 's': round(t + 0.3, 3), 'e': round(t + min(3.2, D[i] + 0.8), 3)})
    lines.append({'i': i, 'set': x['set'], 'cam': x['cam'], 'who': x['who'], 'k': k, 'v': x.get('v', ''), 's': round(start, 3), 'vo': round(t, 3),
                  'sfx': x.get('sfx', []), 'dur': round(D[i], 3), 'mus': x.get('mus'), 'drop': x.get('drop', 0)})
    t += D[i] + hold_for(i, x)
total = t + 4.0
for j, l in enumerate(lines): l['e'] = lines[j + 1]['s'] if j + 1 < len(lines) else round(total, 3)
for j in range(len(cues) - 1):
    if cues[j + 1]['s'] - cues[j]['e'] < 0.5: cues[j]['e'] = cues[j + 1]['s']
json.dump({'fps': FPS, 'total': round(total, 3), 'lines': lines, 'cues': cues, 'words': words, 'facts': facts},
          open('/home/user/remotion-studio/src/v10/timeline.json', 'w'))
sp = sum(D); nw = sum(len(x['text'].split()) for x in S)
print('total', round(total, 1), 's =', int(total // 60), 'min', int(total % 60), 's; speech', round(sp, 1), 's (', round(100 * sp / total), '%); talk rate',
      round(nw / sp * 60), 'wpm; overall', round(nw / total * 60), 'wpm; shots', len(lines))
