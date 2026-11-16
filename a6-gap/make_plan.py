import json
STYLE=("Vertical 9:16 two-dimensional A6 Amber Noir illustration: compact matte-black round heads connected to the torso by short black necks, "
 "small cream-white eye marks and a compact cream line mouth, simplified black mitten-like hands and black limbs with a readable silhouette, "
 "angular illustrated contours and restrained cel shading. Warm amber illumination and amber rim light fall into deep plum shadows in a layered full-color setting. "
 "Not glossy 3D toys, not photoreal people.")
CAST={
'tala':"Tala, a young ancestral woman: rust-ochre animal-hide wrap tied over one shoulder, a braided plant-fibre belt with a small bone toggle, bare black feet, holding a fire-hardened wooden spear.",
'oro':"Oro, an elder: a greyed antelope-hide cloak over the shoulders, a woven grass shawl, a long gnarled wooden walking staff; posture slightly stooped and deliberate.",
'pip':"Pip, a small child: a short tan hide tunic, holding a carved wooden bird toy in one hand.",
'viewer':"A modern young adult viewer: mustard-yellow bomber jacket over a white T-shirt, dark blue jeans, white sneakers, empty hands.",
'brak':"Brak, a Neanderthal man: broader, heavier build and a wider head silhouette than the others, a thick dark-brown fur cape, a stone hand-axe tied at the belt.",
'blue':"Old Blue, a small all-black New Zealand black robin with a thin coloured band on one leg.",
'band':"A small band of about twelve ancestral people in plain brown and ochre hide wraps, same drawing grammar, seated, varied heights."}
CONSTR=("No text, letters, numbers, captions, logos or watermark. No speech bubbles. Two arms and two legs per person, grounded feet, no extra limbs, "
 "no floating heads, no realistic fingers. Do not copy the reference's red hoodie, apartment, cafe or shop.")
def cast(*k): return ' '.join(CAST[x] for x in k)
images=[]
for k,label in [('tala','Tala'),('oro','Oro'),('pip','Pip'),('viewer','modern viewer'),('brak','Brak')]:
    images.append({"id":f"cast-{k}","purpose":"character_reference",
      "reference_inputs":[{"source":"package","asset_id":"shop-body","role":"style"}],
      "image_prompt":{"style":STYLE,"cast":CAST[k]+" Both arms hang naturally; preserve two distinct legs and grounded feet.",
        "world":"A plain deep-plum studio backdrop with one warm amber side light; no environment props.",
        "composition":f"An identity sheet showing separated front and three-quarter full-body views of {label} at consistent scale, clear gaps between views. Identity reference only, not a video opening frame.",
        "constraints":CONSTR}})
SH=[
(1,['viewer'],"An empty modern school gymnasium at dusk, polished wood floor with court lines, empty folding bleachers, amber light shafts through high windows.","Low centered view from the baseline; the viewer stands small at center court looking up at the empty bleachers; strong vertical negative space above."),
(2,['viewer'],"The same gymnasium; every bleacher row packed with hundreds of tiny dark silhouettes in the same drawing grammar, softly amber-lit.","High wide angle from the top corner; the viewer at center court mid-turn, head tilted up toward the crowded rows."),
(3,['tala'],"A dark hillside path rising toward the top of the frame, lined with burning torches, rows of distant ancestral figures along it, night sky.","Lateral three-quarter view; Tala walking upward mid-stride in the lower third, spear held loosely; the path climbs vertically."),
(4,['tala'],"The same hillside path; the torches ahead are extinguished and the upper path falls into plum darkness.","Same camera as the climb; Tala stopped, spear raised defensively, facing the dark upper path; only the torches behind her still glow."),
(5,['oro','band'],"A dry savanna camp at sunset: three small hide shelters, acacia silhouettes, one central fire.","Elevated wide view; the band seated around the fire in the middle third; Oro standing, one hand raised with a pointing finger as if counting heads."),
(6,['pip','oro'],"The same camp in a cooler later season light, shelters weathered and patched.","Medium-wide; Pip standing in the foreground clutching the wooden bird, Oro seated behind by the fire; space above for the seasons to change."),
(7,['tala'],"A cracked dry riverbed under a hazy amber sky, dead reeds, blowing dust.","Low angle close to the ground; Tala kneeling, one black hand pressed flat on the cracked mud, spear lying beside her."),
(8,['tala'],"A thinning forest edge with sparse trees; a herd of antelope silhouettes running away toward the far horizon.","Over-the-shoulder from behind Tala, standing in the foreground lowering her spear, the herd small in the distance."),
(9,['tala','oro','pip'],"A riverbank at night in heavy rain; dark water rising toward the hide shelters.","Medium shot; Oro lifting Pip onto a high rock at frame top, Tala braced knee-deep in the water below, spear planted."),
(10,['tala','oro'],"Inside a hide shelter lit by a small fire; the band's shadows on the curved hide wall.","Close two-shot; Tala and Oro seated face to face, foreheads almost touching; warm glow between them, overlapping shadows behind."),
(11,['blue'],"A rocky windswept island coast in New Zealand, grey sea, lichen-covered rocks, a low amber sun through cloud.","Close low view of a rock in the lower half; Old Blue perched on it beside one other black robin; sea and sky above."),
(12,['blue'],"The same coast in warmer golden light; open sky above the rocks.","Wide vertical view; Old Blue lifting off from the rock with wings spread, several small black robins rising behind her toward the top of the frame."),
(13,['tala','oro','pip'],"A dawn ridge above a wide savanna; many small campfires dotting the plain below.","Behind-and-below view; the three cresting the ridge in silhouette with amber dawn rim light, the glowing plain revealed beneath them."),
(14,['brak','tala'],"A foggy cold forest clearing at dawn, tall pines, amber light beams cutting through mist.","Medium-wide; Brak stepping out of the fog on one side, a sapiens woman dressed like Tala in the foreground holding out a piece of food toward him."),
(15,['brak','tala','pip'],"The same clearing later; one shared fire, hide bedding, two families together.","Warm medium shot; Brak and the sapiens woman seated on either side of the fire, a small child between them, Pip nearby holding the wooden bird."),
(16,['viewer'],"The modern gymnasium again; the bleachers half-filled with fading translucent silhouettes, most rows already empty.","Reverse high wide angle; the viewer alone at center court, small, looking up at the fading crowd."),
(17,['viewer'],"The empty modern gymnasium, soft amber dusk light from the high windows.","Vertical medium close-up; the viewer looking down at one raised open black hand, then toward the lens; head and hand in the upper-middle safe area."),
]
for n,c,world,comp in SH:
    images.append({"id":f"shot-{n:02d}","purpose":"shot_first_frame",
      "reference_inputs":[{"source":"package","asset_id":"apartment-style","role":"style"}],
      "image_prompt":{"style":STYLE,"cast":cast(*c),"world":world,
        "composition":comp+" Keep the lower quarter free of key action for captions and the upper-left corner clear for the title.",
        "constraints":CONSTR}})
plan={"schema":"a6-reference-plan-v1","status":"approved story v1; cast identity sheets and first frames not yet generated","ratio":"9:16","images":images}
json.dump(plan,open('/home/user/a6-gap/a6-gap.plan.json','w'),indent=1)
motion={f"shot-{n:02d}":m for n,m in enumerate([
"Slow push-in; the viewer slowly lifts their head toward the empty bleachers. Silent actor, mouth still.",
"The viewer turns slowly in place, looking across the packed rows; slight camera drift. Silent actor.",
"Tala walks steadily up the torch-lit path; lateral tracking. Silent actor.",
"The torches ahead go out one by one; Tala stops and raises her spear. Silent actor.",
"Slow pull-back; Oro counts the seated band with a pointing finger; fire flickers. Silent actors.",
"Time-lapse of light changing across seasons; Pip grows taller, still holding the wooden bird. Silent actors.",
"Tala presses her hand on cracked mud; dust blows past; slight push-in. Silent actor.",
"The herd runs away into the distance; Tala slowly lowers her spear. Silent actor.",
"Rain lashes; water rises; Oro lifts Pip onto the rock while Tala braces. Silent actors.",
"Gentle firelight flicker; Tala and Oro lean their foreheads together; shadows sway. Silent actors.",
"Slow push-in; Old Blue hops once on the rock beside the other robin; waves roll.",
"Old Blue takes off; more robins rise and follow her upward.",
"The three walk up and crest the ridge; dawn light rises over the plain of fires. Silent actors.",
"Brak emerges from the fog; the woman pauses, then extends the food. Silent actors.",
"Both families settle around the fire; the child looks from one adult to the other. Silent actors.",
"The silhouettes in the bleachers fade away row by row; the viewer stands still. Silent actor.",
"Slow push-in; the viewer lowers their gaze from their hand to the lens. Silent actor, mouth still."],start=1)}
json.dump(motion,open('/home/user/a6-gap/motion-prompts.json','w'),indent=1)
print(len(images),'images')
