"""Create build_ar/tools/build_long_ar.mjs from the English builder: Arabic on-screen text, right-to-left layout, Arabic subtitles."""
import re, os
HERE = os.path.dirname(os.path.abspath(__file__)); src = open(f"{HERE}/../build/tools/build_long.mjs", encoding="utf-8").read()
def R(old, new, n=1):
    global src
    c = src.count(old); assert c == n, (c, n, old[:90]); src = src.replace(old, new)
# --- chapter titles (Arabic)
R('const html = [], js = [], fx = [];', 'const html = [], js = [], fx = [];\nconst AR_T = ["المقدمة", "أرتميس 3 بالظبط إيه", "تلات مركبات، تلات صواريخ", "التسلسل خطوة بخطوة", "التحامين، تصميمين", "لغز الجدول الزمني وسؤال لو", "السباق اللي محدش حسمه", "إزاي الهبوط المفروض يشتغل", "إيه اللي تتابعه"];')
R('"CHAPTER ${i + 1} · ${s.title.toUpperCase()}"', '"الفصل ${i + 1} · ${AR_T[i]}"')
# --- progress bar mirrored (fills right to left)
a = src.index("{ const X0 = 210, X1 = 1824"); b = src.index("S.sections.forEach((s, i) => { const t = sc(s.id).start;")
src = src[:a] + '''{ const X0 = 210, X1 = 1824, GAP = 8, tot = DUR, segs = order.map((id, i) => { const st = i === 0 ? 0 : sc(id).start, en = i + 1 < order.length ? sc(order[i + 1]).start : DUR; return { st, en }; });
  let x = X0; const usable = X1 - X0 - GAP * (order.length - 1), BW = X1 - X0;
  segs.forEach((g) => { g.x = x; g.w = usable * (g.en - g.st) / tot; x += g.w + GAP; });
  html.push(`<div id="plab"><b id="plabn">1</b><span>/ ${order.length}</span></div><div id="pbar">${segs.map((g, i) => `<div class="pseg" id="ps${i}" style="left:${(BW - (g.x - X0) - g.w).toFixed(1)}px;width:${g.w.toFixed(1)}px"><i id="pf${i}"></i></div>`).join("")}<div id="phead"></div></div>`);
  segs.forEach((g, i) => {
    const hx0 = BW - (g.x - X0), hx1 = hx0 - g.w;
    js.push(`tl.fromTo("#pf${i}",{width:"0%"},{width:"100%",duration:${(g.en - g.st).toFixed(3)},ease:"none"},${f3(g.st)});tl.fromTo("#phead",{left:${hx0.toFixed(1)}},{left:${hx1.toFixed(1)},duration:${(g.en - g.st).toFixed(3)},ease:"none",immediateRender:false},${f3(g.st)});`);
    js.push(`tl.set("#plabn",{textContent:"${i + 1}"},${f3(g.st)});tl.fromTo("#plab",{scale:1.35},{scale:1,duration:.45,ease:"back.out(2)",immediateRender:false},${f3(g.st)});tl.fromTo("#ps${i}",{scaleY:2.2},{scaleY:1,duration:.5,ease:"power2.out",immediateRender:false},${f3(g.st)});tl.to("#ps${i}",{borderColor:"rgba(255,181,71,.9)",duration:.2},${f3(g.st)});tl.to("#ps${i}",{borderColor:"rgba(92,200,255,.35)",duration:.4},${f3(g.en)});`);
  }); }
''' + src[b:]
# --- C1
R('text("c1y", 96, 120, 900, `2027`, "huge am");', 'text("c1y", 924, 120, 900, `2027`, "huge am");')
R('text("c1a", 100, 330, 900, `<span class="ppl"><i></i><i></i><i></i><i></i></span><span class="mono grey">FOUR ASTRONAUTS</span>`, "row");', 'text("c1a", 920, 330, 900, `<span class="ppl"><i></i><i></i><i></i><i></i></span><span class="mono grey">أربعة رواد فضاء</span>`, "row");')
R('<div>ARTEMIS III</div>', '<div>أرتميس 3</div>'); R('<div>NOT THE LANDING</div>', '<div>مش مهمة الهبوط</div>')
R('text("c1h", 520, 560, 400, tag("HATCH OPEN", "cy"), "r");', 'text("c1h", 1150, 560, 400, tag("الباب مفتوح", "cy"), "r");')
R('text("c1v", 1150, 560, 500, tag("TEST VERSION", "am"), "r");', 'text("c1v", 520, 560, 500, tag("نسخة تجريبية", "am"), "r");')
R('tag("ABOUT 273 MILES ABOVE EARTH", "am")', 'tag("على ارتفاع حوالي 273 ميل فوق الأرض", "am")')
# --- C2
R('<div class="mono">ARTEMIS III</div><div class="mono grey sm">Earth orbit · 14 days</div>', '<div class="mono">أرتميس 3</div><div class="mono grey sm">مدار الأرض · 14 يوم</div>')
R('<div class="mono">ARTEMIS IV</div><div class="mono grey sm">landing · south pole · target</div>', '<div class="mono">أرتميس 4</div><div class="mono grey sm">هبوط · القطب الجنوبي · الهدف</div>')
R('[["COMMANDER", "Randy Bresnik", "bresnik"], ["PILOT", "Luca Parmitano (ESA)", "parmitano"], ["MISSION SPECIALIST", "Andre Douglas", "douglas"], ["MISSION SPECIALIST", "Frank Rubio", "rubio"]]', '[["القائد", "راندي بريسنيك", "bresnik"], ["الطيار", "لوكا بارميتانو (ESA)", "parmitano"], ["أخصائي مهمة", "أندريه دوجلاس", "douglas"], ["أخصائي مهمة", "فرانك روبيو", "rubio"]]')
R('card(`c2c${i}`, 130 + i * 420, 640', 'card(`c2c${i}`, 130 + (3 - i) * 420, 640')
R('NASA: <b>Artemis III will not land on the Moon.</b> The landing is Artemis IV, targeted for 2028.', 'ناسا: <b>أرتميس 3 مش هتهبط على القمر.</b> الهبوط هيكون في أرتميس 4، والهدف سنة 2028.')
R('${tag("REDUCE RISK", "cy")}${tag("VALIDATE HARDWARE", "cy")}${tag("GAIN OPERATIONAL EXPERIENCE", "cy")}', '${tag("تقليل المخاطر", "cy")}${tag("التأكد من الأجهزة", "cy")}${tag("اكتساب خبرة تشغيلية", "cy")}')
# --- C3
R('[["Orion + SLS", "NASA", "c3on"], ["Blue Moon Mark 2", "test article", "c3bn"], ["Starship V3", "test article", "c3sn"]]', '[["أوريون + إس إل إس", "ناسا", "c3on"], ["بلو مون مارك 2", "نسخة تجريبية", "c3bn"], ["ستارشيب V3", "نسخة تجريبية", "c3sn"]]')
R('“We\'re launching <b>three spacecraft on three different rockets</b> and testing how they operate together, something NASA has never attempted.” <span class="grey">Jeremy Parsons, Artemis program manager</span>', '«إحنا بنطلّق <b>تلات مركبات فضاء على تلات صواريخ مختلفة</b> وبنختبر إزاي بتشتغل مع بعض، حاجة ناسا عمرها ما حاولتها.» <span class="grey">جيريمي بارسونز، مدير برنامج أرتميس</span>')
R('text("c3x", 96, 130, 1400, `<div class="mono grey">EARLIER ARTEMIS MISSIONS</div><div class="mid">NASA\'s rocket + NASA\'s capsule only</div>`, "l");', 'text("c3x", 424, 130, 1400, `<div class="mono grey">مهمات أرتميس السابقة</div><div class="mid">صاروخ ناسا + كبسولة ناسا بس</div>`, "l");')
R('tag("TEST VERSIONS, NOT FINISHED LANDERS", "am")', 'tag("نسخ تجريبية، مش مركبات هبوط جاهزة", "am")')
# --- C4
R('<text x="96" y="112" fill="#8FA0C0" font-family="JetBrains Mono" font-size="22">illustration, not to scale</text>', '<text x="96" y="112" fill="#8FA0C0" font-family="JetBrains Mono" font-size="22" direction="ltr">رسم توضيحي، مش بمقياس رسم</text>')
for o, n in [('"Blue Moon test article launches", "circular orbit ~273 miles up · can wait up to 30 days"', '"إطلاق نسخة بلو مون التجريبية", "مدار دائري ~273 ميل · تستنى لحد 30 يوم"'),
  ('"Days later: Orion launches on SLS", "Kennedy · ~345-mile circle · 2 days of checkout"', '"بعدها بأيام: أوريون تنطلق على SLS", "كينيدي · مدار ~345 ميل · يومين فحوصات"'),
  ('"Orion docks · crew goes inside", "about 2 days: cabin, controls, life support"', '"أوريون تلتحم · الطاقم يدخل جوّه", "حوالي يومين: الكابينة والتحكم ودعم الحياة"'),
  ('"Orion undocks and repositions", ""', '"أوريون تفك الالتحام وتغيّر مكانها", ""'),
  ('"Starship V3 test article launches", "from Florida · lower orbit · extra nose docking system"', '"إطلاق نسخة ستارشيب V3 التجريبية", "من فلوريدا · مدار أقل · نظام التحام إضافي"'),
  ('"Orion docks with Starship (up to 2 h)", "crew stays out · then up to 5 more days of tests"', '"أوريون تلتحم بستارشيب (لحد ساعتين)", "الطاقم بره · وبعدها لحد 5 أيام اختبارات"')]: R(o, n)
R('tag("FIRST COMMERCIAL LANDER EVALUATION WITH A CREW", "am")', 'tag("أول تقييم لمركبة هبوط تجارية وعليها طاقم", "am")')
R('tag("5 MORE DAYS: SUITS · SENSORS · NOISE · HEALTH-CHECK STUDY", "cy")', 'tag("5 أيام كمان: بدلات · حساسات · ضوضاء · دراسة فحص صحي", "cy")')
# --- C5
R('<div class="big3">SIDE PORT</div><div class="mono grey">beside Blue Moon\'s crew cabin</div>', '<div class="big3">فتحة جانبية</div><div class="mono grey">جنب كابينة الطاقم في بلو مون</div>')
R('<div class="big3">NOSE PORT</div><div class="mono grey">Orion\'s forward system meets Starship\'s nose</div>', '<div class="big3">فتحة أمامية</div><div class="mono grey">نظام أوريون الأمامي يقابل مقدمة ستارشيب</div>')
R('["CONTROLLABILITY", "COMMUNICATIONS", "SOFTWARE TOGETHER", "DOCKING & UNDOCKING FORCES"]', '["التحكم", "التواصل", "البرمجيات مع بعض", "قوى الالتحام وفك الالتحام"]')
R('text("c5h", 96, 150, 1300, `<div class="mid">Two landers. <span class="am">Two docking designs.</span> One mission.</div>`, "l");', 'text("c5h", 524, 150, 1300, `<div class="mid">مركبتين هبوط. <span class="am">تصميمين للالتحام.</span> مهمة واحدة.</div>`, "l");')
# --- C6
R('text("c6l0", x0 - 150, 250, 300, `<div class="mono">BLUE MOON TEST ARTICLE<br>launches into orbit</div>`, "ctr sm");', 'text("c6l0", x0 - 190, 250, 380, `<div class="mono">النسخة التجريبية من بلو مون<br>تنطلق للمدار</div>`, "ctr sm");')
R('<div class="mono am">UP TO 30 DAYS ON ORBIT<br>NASA\'s stated flexibility</div>', '<div class="mono am">لحد 30 يوم في المدار<br>المرونة اللي ذكرتها ناسا</div>')
R('<div class="mono am sm">ORION launches<br>“only days after”</div>', '<div class="mono am sm">أوريون تنطلق<br>«بعدها بأيام بس»</div>')
R('<div class="mono gr sm">STARSHIP launches later<br>shorter time on orbit</div>', '<div class="mono gr sm">ستارشيب تنطلق بعدين<br>وقت أقصر في المدار</div>')
R('<div class="big3 am">WHAT IF ONE PIECE IS LATE?</div><div class="quote" id="c6a" style="opacity:0">NASA\'s published plan <b>doesn\'t say</b> what a problem in orbit would do to the 2028 target.</div>', '<div class="big3 am">لو حتة واحدة اتأخرت؟</div><div class="quote" id="c6a" style="opacity:0">خطة ناسا المنشورة <b>مبتقولش</b> إيه تأثير أي مشكلة في المدار على هدف 2028.</div>')
R('tag("TREAT EVERY DATE AS A TARGET, NOT A PROMISE", "grey")', 'tag("اعتبر أي تاريخ هدف، مش وعد", "grey")')
# --- C7
R('card("c7a", 130, 190, 760, 330, `<div class="mono grey sm">ORIGINAL ASSIGNMENT</div><div class="rr"><span>Artemis III + IV</span>${tag("Starship", "grey")}</div><div class="rr"><span>Artemis V</span>${tag("Blue Moon Mark 2", "grey")}</div>`, "mock");',
  'card("c7a", 1030, 190, 760, 330, `<div class="mono grey sm">التخصيص الأصلي</div><div class="rr"><span>أرتميس 3 + 4</span>${tag("ستارشيب", "grey")}</div><div class="rr"><span>أرتميس 5</span>${tag("بلو مون مارك 2", "grey")}</div>`, "mock");')
R('card("c7b", 1030, 190, 760, 330, `<div class="mono am sm">NOW</div><div class="rr"><span>Artemis III (orbit)</span>${tag("both companies", "am")}</div><div class="rr"><span>A landing mission</span>${tag("neither assigned", "red")}</div>`, "mock hotc");',
  'card("c7b", 130, 190, 760, 330, `<div class="mono am sm">دلوقتي</div><div class="rr"><span>أرتميس 3 (مدار)</span>${tag("الشركتين", "am")}</div><div class="rr"><span>مهمة هبوط</span>${tag("ولا واحدة مخصصة", "red")}</div>`, "mock hotc");')
R('font-weight="900" font-size="90" opacity=".9">→</text>', 'font-weight="900" font-size="90" opacity=".9">←</text>')
R('Based on <b>lander readiness</b>, NASA will decide which company is first to deliver astronauts to the surface in 2028. A second crewed landing opportunity follows.', 'بناءً على <b>جاهزية مركبات الهبوط</b>، ناسا هتقرر أنهي شركة هتكون الأولى في توصيل رواد فضاء لسطح القمر في 2028. وبعدها بتيجي فرصة هبوط تانية بطاقم.')
R('${tag("BOTH FLY AN UNCREWED DEMO FIRST", "cy")}${tag("NASA CERTIFIES THE LANDERS BEFORE CREWS FLY", "cy")}', '${tag("الشركتين يطيّروا مهمة تجريبية من غير طاقم الأول", "cy")}${tag("ناسا تعتمد مركبات الهبوط قبل الطواقم", "cy")}')
# --- C8
R('On a landing mission, a commercial lander links up with Orion, then takes <b>two crew to the surface</b> while <b>two stay aboard</b> Orion.', 'في مهمة الهبوط، مركبة هبوط تجارية بتلتحم بأوريون، وبعدين بتنزل <b>اتنين من الطاقم للسطح</b> وبيفضل <b>اتنين على متن</b> أوريون.')
for o, n in [('"Several Starships launch as tankers"', '"كذا ستارشيب تنطلق كناقلات وقود"'), ('"Transfer propellant to a depot Starship"', '"نقل الوقود لستارشيب مخزن"'), ('"Lander waits in Earth orbit; Orion docks"', '"الهبوط يستنى في مدار الأرض؛ أوريون تلتحم"'),
  ('"Burn sends the pair to low lunar orbit"', '"إشعال محرك يبعت الاتنين لمدار قمري منخفض"'), ('"Two crew descend for several days"', '"اتنين من الطاقم ينزلوا لعدة أيام"'), ('"Three transfer stages launch to orbit"', '"تلات مراحل نقل تنطلق للمدار"'),
  ('"Blue Moon Mark 2 lander follows; they dock"', '"بلو مون مارك 2 تلحقها؛ بيلتحموا"'), ('"Stack heads to an elliptical polar orbit"', '"المجموعة تتجه لمدار قطبي بيضاوي"'), ('"Stages drop away as fuel runs out"', '"كل مرحلة بتنفصل لما وقودها يخلص"'),
  ('"Orion docks there · two crew descend to the south pole"', '"أوريون تلتحم هناك · اتنين ينزلوا للقطب الجنوبي"')]: R(o, n)
R('[[spX, 130, "STARSHIP PLAN", "c8x"], [bO, 990, "BLUE ORIGIN PLAN", "c8y"]]', '[[spX, 990, "خطة ستارشيب", "c8x"], [bO, 130, "خطة بلو أوريجن", "c8y"]]')
R('${tag("NASA: replaces the earlier near-rectilinear halo orbit meeting point", "grey")}${tag("NEW: lighter ‘Sortie suit’, about half the weight", "cy")}', '${tag("ناسا: الخطتين بتحلّوا محل الالتقاء في مدار هالو شبه خطي", "grey")}${tag("جديد: بدلة «سورتي» أخف، بنص الوزن تقريبًا", "cy")}')
# --- C9
R('[["1", "Hardware is on track", "NASA: processing times cut by about half", "One"], ["2", "Fuel-line part redesigned in 5 months", "NASA\'s own claim · about a tenth of an outside estimate", "Two"], ["3", "The docking tests", "Everything else depends on them", "Three"]]',
  '[["1", "الأجهزة ماشية في الميعاد", "ناسا: أوقات التجهيز اتقلّت بحوالي النص", "One"], ["2", "جزء خط الوقود اتصمّم من جديد في 5 شهور", "ادعاء ناسا نفسها · حوالي عُشر تقدير خارجي", "Two"], ["3", "اختبارات الالتحام", "كل حاجة تانية بتعتمد عليها", "Three"]]')
R('<div class="big3 cy">SUBSCRIBE</div><div class="mono grey">Next: how a Starship refuels in orbit, and why it matters for the landing</div>', '<div class="big3 cy">اشترك</div><div class="mono grey">الفيديو الجاي: إزاي ستارشيب بتتزوّد بالوقود في المدار، وليه ده مهم للهبوط</div>')
# --- subtitles from the Arabic recording
a = src.index("// ================= subtitles"); b = src.index('js.push(`tl.to("#eimg1"')
src = src[:a] + '''// ================= Arabic subtitles (timed from the recording)
{ const SUBS = JSON.parse(fs.readFileSync("audio/subs_ar.json", "utf8"));
  SUBS.forEach((c, i) => { const st = Math.max(0, c.t0 - 0.03), nxt = SUBS[i + 1] ? SUBS[i + 1].t0 - 0.03 : DUR, en = Math.min(c.t1 + 0.25, nxt);
    html.push(`<div class="sub" id="sb${i}"><span>${e(c.text)}</span></div>`);
    js.push(`tl.set("#sb${i}",{opacity:1},${f3(st)});tl.set("#sb${i}",{opacity:0},${f3(en)});`); }); }
''' + src[b:]
# --- CSS / page
faces = "".join(f'@font-face{{font-family:{fam};src:url(./fonts/Cairo-{w}.ttf);font-weight:{w}}}\n' for fam in ("Inter", '"JetBrains Mono"') for w in (400, 500, 600, 700, 800, 900))
R('@font-face{font-family:Inter;src:url(./fonts/Inter-400.woff2);font-weight:100 900}\n@font-face{font-family:"JetBrains Mono";src:url(./fonts/JetBrainsMono-400.woff2);font-weight:100 800}\n', faces)
R('*{margin:0;padding:0;box-sizing:border-box}html,body{width:1920px;', '*{margin:0;padding:0;box-sizing:border-box;letter-spacing:0!important}html,body{direction:rtl;width:1920px;')
R('.chl{position:absolute;left:96px;', '.chl{position:absolute;right:96px;')
R('.tx{position:absolute}.ctr{text-align:center}.l{text-align:left}.r{text-align:left}', '.tx{position:absolute}.ctr{text-align:center}.l{text-align:right}.r{text-align:left}')
R('white-space:nowrap;margin-right:14px;', 'white-space:nowrap;margin-left:14px;')
R('.ppl i{display:inline-block;width:34px;height:34px;border-radius:50%;background:${C.cy};margin-right:10px}', '.ppl i{display:inline-block;width:34px;height:34px;border-radius:50%;background:${C.cy};margin-left:10px}')
R('.pseg i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3aa8e8,#5CC8FF 60%,#FFB547);', '.pseg i{position:absolute;right:0;top:0;display:block;height:100%;width:0;background:linear-gradient(270deg,#3aa8e8,#5CC8FF 60%,#FFB547);')
R('#plab{position:absolute;left:96px;bottom:26px;', '#plab{position:absolute;right:96px;direction:ltr;bottom:26px;')
R('transform-origin:0 50%}#plab b', 'transform-origin:100% 50%}#plab b')
R('#pbar{position:absolute;left:210px;right:96px;', '#pbar{position:absolute;left:96px;right:210px;')
R('font:600 26px/1.3 Inter;color:#EAF0FF}', 'font:600 29px/1.35 Inter;color:#EAF0FF}')
R('<html lang="en" data-resolution="landscape">', '<html lang="ar" dir="rtl" data-resolution="landscape">')
R('.mono{font:600 28px "JetBrains Mono",monospace}.mono.sm,.sm{font-size:22px}', '.mono{font:600 30px "JetBrains Mono",monospace}.mono.sm,.sm{font-size:26px}')
R('.st2{font:500 21px/1.3 "JetBrains Mono",monospace;', '.st2{font:500 24px/1.3 "JetBrains Mono",monospace;')
R('.chl{position:absolute;right:96px;top:54px;font:600 24px', '.chl{position:absolute;right:96px;top:50px;font:600 29px')
R('#plab span{font:600 18px', '#plab span{font:600 22px')
R('text("c5h", 524, 150, 1300,', 'text("c5h", 224, 150, 1600,')
os.makedirs(f"{HERE}/../build_ar/tools", exist_ok=True); open(f"{HERE}/../build_ar/tools/build_long_ar.mjs", "w", encoding="utf-8").write(src)
print("ok", len(src))
