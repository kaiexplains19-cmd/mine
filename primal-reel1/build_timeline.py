"""Build the reel timeline (shots, VO placement, captions) from narration durations + word timings."""
import json, re

durs = json.load(open('durations.json'))
words = json.load(open('words.json'))
lines = json.load(open('lines.json'))

LEAD = 0.15  # VO starts this long after the cut
# shot id -> (line indices, extra hold seconds)
SHOTS = [
    ('pov',      [0], 0.20),
    ('phone',    [1], 0.15),
    ('year',     [2], 0.55),
    ('humans',   [3], 0.35),
    ('sticks',   [4], 0.55),
    ('flint',    [5], 0.45),
    ('interview',[6, 7], 0.80),
    ('brug',     [8], 0.30),
    ('dna',      [9], 0.40),
    ('grandpa',  [10], 0.50),
    ('dark',     [11], 0.60),
    ('outro',    [12], 1.30),
]
GAP_BETWEEN_LINES = 0.25

HILITE = {'50,000', 'fifty', 'thousand', 'four', 'fire', 'forty', 'blister', 'ten', 'crypto', 'neanderthal',
          'everything', 'two', 'percent', 'dna', 'grandpa', 'dark', 'empty', 'first', 'night', 'staring', 'signal'}

def chunk_line(text, w, t0):
    """Split script text into <=3-word caption chunks, timed against whisper word spans."""
    toks = text.replace('...', '…').split()
    start = (w[0][1] if w else 0) + t0
    end = (w[-1][2] if w else 1) + t0
    chunks, cur = [], []
    for tok in toks:
        cur.append(tok)
        if len(cur) == 3 or re.search(r'[.?!,…]$', tok):
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    total = sum(len(' '.join(c)) for c in chunks)
    out, acc = [], 0
    for c in chunks:
        s = start + (end - start) * acc / total
        acc += len(' '.join(c))
        e = start + (end - start) * acc / total
        out.append({'s': round(s, 3), 'e': round(e, 3),
                    'w': [{'t': x.upper(), 'h': re.sub(r'[^a-z0-9,]', '', x.lower()).strip(',') in HILITE} for x in c]})
    return out

t = 0.0
shots, vo, caps = [], [], []
for sid, li, hold in SHOTS:
    st = t
    cur = st + LEAD
    line_starts = []
    for k, i in enumerate(li):
        vo.append({'file': f'audio/l{i:02d}.wav', 'at': round(cur, 3)})
        line_starts.append(round(cur - st, 3))
        caps += chunk_line(lines[i][1], words[i], cur)
        cur += durs[i] + (GAP_BETWEEN_LINES if k < len(li) - 1 else 0)
    t = cur + hold
    shots.append({'id': sid, 's': round(st, 3), 'e': round(t, 3), 'lines': line_starts})

json.dump({'shots': shots, 'vo': vo, 'caps': caps, 'total': round(t, 3)}, open('timeline.json', 'w'), indent=1)
print('total', round(t, 2), 's')
for s in shots: print(f"{s['id']:10s} {s['s']:6.2f} -> {s['e']:6.2f}  ({s['e']-s['s']:.2f}s)")
