"""Retime the English word timestamps onto the Egyptian Arabic recording (sentence by sentence) and build Arabic subtitle phrases.
Each English sentence k maps onto Arabic sentence k (segments_ar.json). Words are placed linearly inside the sentence, except the anchor words
listed in OV, which are pinned to the matching Arabic word (placed by character-weighted position inside the Arabic sentence)."""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, "..", "build"); O = os.path.join(HERE, "..", "build_ar")
ts = json.load(open(f"{B}/audio/timestamps.json")); en = json.load(open(f"{HERE}/sentences_en.json")); seg = json.load(open(f"{HERE}/segments_ar.json"))
def norm(s): return re.sub(r"[^a-z0-9'/]", "", s.lower())
# (section, english word, occurrence in section) -> Arabic word fragment inside the matching Arabic sentence
OV = {("c1","four",0):"أربعة",("c1","hatch",0):"باب",("c1","float",0):"يطفوا",("c1","Moon",0):"القمر",("c1","hundred",0):"ميتين",("c1","test",0):"تجريبية",
 ("c2","Randy",0):"راندي",("c2","Luca",0):"لوكا",("c2","Andre",0):"أندريه",("c2","Frank",0):"فرانك",("c2","plainly",0):"بوضوح",
 ("c2","reduce",0):"تقلل",("c2","validate",0):"وتتأكد",("c2","gain",0):"وتكسب",
 ("c3","Orion",0):"أوريون",("c3","Blue",0):"بلو",("c3","SpaceX's",0):"سبيس",
 ("c4","stretched",0):"ممدود",("c4","circle",0):"دائري",("c4","circle",1):"دائري",
 ("c5","handles",0):"بيتحكم",("c5","communicate",0):"بيتواصلوا",("c5","software",0):"البرمجيات",("c5","forces",0):"القوى",
 ("c8","heads",0):"بتتجه",("c8","drops",0):"بتنفصل",("c8","replace",0):"بتحلّوا",("c8","Sortie",0):"سورتي",("c8","transfer",0):"وبتنقل",("c8","fleet",0):"بأسطول",
 ("c6","Blue",0):"بلو"}
def aw_times(k):
    s = seg[k]; ws = s["ar"].split(); wt = []
    for w in ws: wt.append(len(re.sub(r"[\W_]", "", w)) + (6 if re.search(r"[،:]$", w) else 0) + 1)
    tot = sum(wt); acc = 0; out = []
    for w, x in zip(ws, wt): out.append((w, s["s"] + (s["e"] - s["s"]) * acc / tot)); acc += x
    return out
words = ts["words"]; new = []; occ = {}
for k, s in enumerate(en):
    a = seg[k]; AT = aw_times(k)
    for i in range(s["i0"], s["i1"] + 1):
        w = words[i]; key = (w["section"], norm(w["text"])); o = occ.get(key, 0); occ[key] = o + 1
        t = a["s"] + (w["start"] - s["start"]) / (s["end"] - s["start"]) * (a["e"] - a["s"])
        frag = OV.get((w["section"], w["text"].strip(".,:?!“”\""), o)) or OV.get((w["section"], norm(w["text"]), o))
        if frag:
            hit = [tt for ww, tt in AT if frag in ww]
            if hit: t = hit[0]
            else: print("override miss", k, w["text"], frag)
        new.append({"text": w["text"], "start": round(t, 3), "section": w["section"], "k": k})
# keep word times monotonic inside each sentence; end = next start (max 0.4 s)
for j, w in enumerate(new):
    nx = new[j + 1]["start"] if j + 1 < len(new) else w["start"] + 0.4
    w["end"] = round(max(w["start"] + 0.05, min(nx, w["start"] + 0.4)), 3)
secs = []
for c in sorted({w["section"] for w in new}):
    ks = [s["k"] for s in seg if s["sec"] == c]; secs.append({"id": c, "start": seg[ks[0]]["s"], "end": seg[ks[-1]]["e"], "first": seg[ks[0]]["s"], "last": seg[ks[-1]]["e"]})
dur = 503.406
json.dump({"source": "Egyptian Arabic recording", "method": "sentence-level pause alignment", "tempo": 1, "gap": 0, "duration": dur, "sections": secs,
           "words": [{k: v for k, v in w.items() if k != "k"} for w in new]}, open(f"{O}/audio/timestamps.json", "w"), ensure_ascii=False, indent=1)
# subtitles: split each Arabic sentence at commas/colons, then at ~34 characters; time by character weight
subs = []
for s in seg:
    phr = [p.strip() for p in re.split(r"(?<=[،:])\s+", s["ar"]) if p.strip()]
    outp = []
    for p in phr:
        ws = p.split(); cur = []
        for w in ws:
            if cur and len(" ".join(cur + [w])) > 38: outp.append(" ".join(cur)); cur = []
            cur.append(w)
        if cur: outp.append(" ".join(cur))
    wts = [len(p) + 4 for p in outp]; tot = sum(wts); acc = 0
    for p, wt in zip(outp, wts):
        a = s["s"] + (s["e"] - s["s"]) * acc / tot; acc += wt; b = s["s"] + (s["e"] - s["s"]) * acc / tot
        subs.append({"sec": s["sec"], "t0": round(a, 3), "t1": round(b, 3), "text": re.sub(r"[،:]$", "", p).rstrip(".؟") if False else p.rstrip("،:")})
json.dump(subs, open(f"{O}/audio/subs_ar.json", "w"), ensure_ascii=False, indent=1)
print(len(new), "words;", len(subs), "subtitle phrases; sections", [(x["id"], x["first"]) for x in secs])
