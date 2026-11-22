// char.js — the  stick figure: black body + round black head, white eyes/mouth,
// black hands, warm rim light. Outfits: 'atlas' (orange jacket, dark gray trousers, white sneakers),
// 'parka' (Antarctica layer), 'stehlin' (cream suit, bow tie, homburg) and crowd variants.
'use strict';

const OUTFITS = {
  atlas: { torso: COL.jacket, torsoDark: COL.jacketDark, sleeve: COL.jacket, trousers: COL.trousers, shoe: COL.sneaker, kind: 'jacket' },
  parka: { torso: '#f08a30', torsoDark: '#c4651c', sleeve: '#f08a30', trousers: '#33363e', shoe: '#f1f1ee', kind: 'parka', goggles: true },
  stehlin: { torso: '#dccdb0', torsoDark: '#bba989', sleeve: '#dccdb0', trousers: '#6f5f52', shoe: '#3b2c22', kind: 'suit', hat: 'homburg' },
  stehlinIn: { torso: '#dccdb0', torsoDark: '#bba989', sleeve: '#dccdb0', trousers: '#6f5f52', shoe: '#3b2c22', kind: 'suit' },
  grayCap: { torso: '#a3a8b0', torsoDark: '#868b93', sleeve: '#a3a8b0', trousers: '#3e4a66', shoe: '#f2f2f2', kind: 'hoodie', hat: 'cap', capCol: '#3f5fa8' },
  yellow: { torso: '#f1bf2c', torsoDark: '#cf9d17', sleeve: '#f1bf2c', trousers: '#6d4b35', shoe: '#f2f2f2', kind: 'hoodie' },
  teal: { torso: '#3aa59a', torsoDark: '#2a857c', sleeve: '#3aa59a', trousers: '#2f3340', shoe: '#f2f2f2', kind: 'tee' },
  purple: { torso: '#8c6bb8', torsoDark: '#6f5196', sleeve: '#8c6bb8', trousers: '#3a3d48', shoe: '#f2f2f2', kind: 'tee', hat: 'bun' },
  red: { torso: '#d9534a', torsoDark: '#b23f37', sleeve: '#d9534a', trousers: '#2f3340', shoe: '#f2f2f2', kind: 'hoodie' },
  lab: { torso: '#f1f1ec', torsoDark: '#d2d3cc', sleeve: '#f1f1ec', trousers: '#41495a', shoe: '#2b2b2b', kind: 'lab' },
};

const RIG = { R: 50, LEG: 172, TORSO: 132, TW: 92, UA: 74, FA: 70, TH: 92, SH: 84, ARMW: 23, LEGW: 26, HAND: 12 };

function limbPts(jx, jy, a1, a2, L1, L2, dir) {
  const ex = jx + Math.sin(a1) * L1 * dir, ey = jy + Math.cos(a1) * L1;
  const hx = ex + Math.sin(a1 + a2) * L2 * dir, hy = ey + Math.cos(a1 + a2) * L2;
  return [[jx, jy], [ex, ey], [hx, hy]];
}

// pose defaults: arms hanging, legs straight
function basePose() { return { la: [0.12, 0.08], ra: [0.12, 0.08], ll: [0.04, 0], rl: [0.04, 0], lean: 0, tilt: 0, bob: 0 }; }

function walkPose(ph, amt = 1) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    ll: [0.42 * s * amt, (0.12 + 0.62 * Math.max(0, c)) * amt],
    rl: [-0.42 * s * amt, (0.12 + 0.62 * Math.max(0, -c)) * amt],
    la: [-0.38 * s * amt, 0.3 + 0.15 * s],
    ra: [0.38 * s * amt, 0.3 - 0.15 * s],
    lean: 0.05 * amt, tilt: 0.02 * Math.sin(ph * 2), bob: -Math.abs(Math.cos(ph)) * 7 * amt + 3,
  };
}

// o: {x,y,s,face(-1|0|1),pose,expr,look:[x,y],blink,outfit,rim:[dx,dy],propL,propR,alpha,shiver}
function drawFigure(ctx, o) {
  const s = o.s || 1, face = o.face ?? 0, of = typeof o.outfit === 'object' ? o.outfit : OUTFITS[o.outfit || 'atlas'];
  const pose = Object.assign(basePose(), o.pose || {});
  ctx.save();
  ctx.translate(o.x, o.y); ctx.scale(s, s);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  const rim = o.rim === false ? null : (o.rim || [5, -4]);
  if (rim) { ctx.save(); ctx.translate(rim[0] / Math.max(s, .35), rim[1] / Math.max(s, .35)); body(ctx, pose, face, of, true, o); ctx.restore(); }
  body(ctx, pose, face, of, false, o);
  ctx.restore();
}

function body(ctx, pose, face, of, rimPass, o) {
  const { R, LEG, TORSO, TW, UA, FA, TH, SH, ARMW, LEGW, HAND } = RIG;
  const RC = o.rimCol || COL.rim;
  const C = c => rimPass ? RC : c;
  const parka = of.kind === 'parka';
  const tw = parka ? TW * 1.2 : TW;
  const hipY = -LEG + (pose.bob || 0), shY = hipY - TORSO;
  const lean = pose.lean || 0;
  ctx.save();
  // legs (not leaned)
  const legDir = face === 0 ? null : face;
  const legs = [['ll', -14], ['rl', 14]];
  const drawLeg = (key, hx, far) => {
    const [h, kn] = pose[key];
    const dir = legDir ?? (hx < 0 ? -1 : 1);
    const pts = limbPts(hx, hipY, h, -kn, TH, SH, dir);
    poly(ctx, pts, false); stroke(ctx, C(far ? shade(of.trousers, -0.12) : of.trousers), LEGW);
    // shoe
    const [fx, fy] = pts[2]; const sa = h - kn;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(face === 0 ? 0 : -sa * 0.3 * dir);
    const toe = face === 0 ? (hx < 0 ? -1 : 1) * 0.5 : dir;
    rr(ctx, -11 + toe * 9 - 8, -5, 34, 14, 7); ctx.fillStyle = C(far ? shade(of.shoe, -0.08) : of.shoe); ctx.fill();
    ctx.restore();
  };
  if (face === 0 && pose.seat) {
    // seated facing camera: thighs foreshortened towards the viewer, shins straight down to the floor (y = 0)
    [-1, 1].forEach(sd => {
      const hx = sd * 18, kx = sd * (26 + (pose.knees || 0)), ky = hipY + 26;
      line(ctx, hx, hipY, kx, ky); stroke(ctx, C(shade(of.trousers, 0.06)), LEGW + 10);
      const fy = pose.shin ? ky + pose.shin : -9, fx = kx + sd * (pose.shin ? 6 : 3);
      line(ctx, kx, ky, fx, fy); stroke(ctx, C(of.trousers), LEGW);
      rr(ctx, fx - 15 + sd * 5, fy - 5, 32, 14, 7); ctx.fillStyle = C(of.shoe); ctx.fill();
    });
  } else if (face !== 0) { // far leg first
    drawLeg(face > 0 ? 'rl' : 'll', 0, true); drawLeg(face > 0 ? 'll' : 'rl', 0, false);
  } else { drawLeg('ll', -15, false); drawLeg('rl', 15, false); }

  // lean torso+arms+head about hip
  ctx.translate(0, hipY); ctx.rotate(lean * (face || 1)); ctx.translate(0, -hipY);
  if (o.shiver) ctx.translate(Math.sin(o.shiver * 90) * 1.6, 0);

  const armSh = (side) => face === 0 ? [side * (tw / 2 - 9), shY + 14] : [side * face * -6 + face * 4, shY + 14];
  const drawArm = (key, side, far) => {
    const [a1, a2] = pose[key];
    const dir = face === 0 ? side : face;
    const [sx, sy] = armSh(side);
    const pts = limbPts(sx, sy, a1, a2, UA, FA, dir);
    poly(ctx, pts, false); stroke(ctx, C(far ? shade(of.sleeve, -0.13) : of.sleeve), parka ? ARMW * 1.35 : ARMW);
    // hand
    fillC(ctx, pts[2][0], pts[2][1], HAND * (parka ? 1.1 : 1), C(COL.ink));
    const prop = key === 'ra' ? o.propR : o.propL;
    if (prop && !rimPass) { ctx.save(); ctx.translate(pts[2][0], pts[2][1]); ctx.rotate(-(a1 + a2) * dir); prop(ctx, dir, -(a1 + a2) * dir); ctx.restore(); }
  };
  // far arm behind torso in side view
  if (face !== 0) drawArm(face > 0 ? 'la' : 'ra', face > 0 ? -1 : 1, true);

  // hood/fur ring behind head
  const headY = shY - R + 8 + (pose.headDy || 0);
  if (parka) {
    const R2 = rng(7);
    ctx.save(); ctx.translate(0, headY); ctx.rotate(pose.tilt || 0);
    const pts = []; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const rr_ = R * 1.38 + (i % 2 ? 6 : -2) + R2() * 3; pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_ * 1.03]); }
    smoothPath(ctx, pts); ctx.fillStyle = C('#efe6d6'); ctx.fill();
    circ(ctx, 0, 0, R * 1.16); ctx.fillStyle = C('#c86a22'); ctx.fill();
    ctx.restore();
  }
  // torso
  const tTop = shY - 4, tH = TORSO + 12;
  rr(ctx, -tw / 2, tTop, tw, tH, [26, 26, 12, 12]); ctx.fillStyle = C(of.torso); ctx.fill();
  if (!rimPass) {
    ctx.save(); rr(ctx, -tw / 2, tTop, tw, tH, [26, 26, 12, 12]); ctx.clip();
    // soft shading on the side away from the light
    const g = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0); g.addColorStop(0, rgba(of.torsoDark, 0.85)); g.addColorStop(0.35, rgba(of.torsoDark, 0)); ctx.fillStyle = g; ctx.fillRect(-tw, tTop, tw * 2, tH);
    if (of.kind === 'jacket') {
      line(ctx, face * 6, tTop + 18, face * 6, tTop + tH); stroke(ctx, of.torsoDark, 3);
      rr(ctx, -tw / 2 + 8, tTop + tH - 44, 20, 5, 2); ctx.fillStyle = of.torsoDark; ctx.fill();
      rr(ctx, tw / 2 - 28, tTop + tH - 44, 20, 5, 2); ctx.fill();
      rr(ctx, -tw / 2, tTop + tH - 12, tw, 12, 4); ctx.fillStyle = of.torsoDark; ctx.fill();
      // collar
      ctx.beginPath(); ctx.moveTo(-22 + face * 6, tTop + 2); ctx.lineTo(face * 6, tTop + 22); ctx.lineTo(22 + face * 6, tTop + 2); ctx.lineTo(18 + face * 6, tTop - 4); ctx.lineTo(-18 + face * 6, tTop - 4); ctx.closePath(); ctx.fillStyle = of.torsoDark; ctx.fill();
    } else if (of.kind === 'parka') {
      for (let i = 1; i < 5; i++) { line(ctx, -tw / 2, tTop + i * tH / 5, tw / 2, tTop + i * tH / 5 + 2); stroke(ctx, rgba(of.torsoDark, .8), 3); }
      line(ctx, face * 6, tTop, face * 6, tTop + tH); stroke(ctx, of.torsoDark, 4);
    } else if (of.kind === 'suit') {
      // shirt V + bow tie + lapels
      ctx.beginPath(); ctx.moveTo(-16 + face * 5, tTop); ctx.lineTo(face * 5, tTop + 46); ctx.lineTo(16 + face * 5, tTop); ctx.closePath(); ctx.fillStyle = '#f7f4ee'; ctx.fill();
      const bx = face * 5, by = tTop + 9;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 13, by - 6); ctx.lineTo(bx - 13, by + 7); ctx.closePath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 13, by - 6); ctx.lineTo(bx + 13, by + 7); ctx.closePath(); ctx.fillStyle = '#4a2f24'; ctx.fill(); fillC(ctx, bx, by, 4, '#4a2f24');
      line(ctx, -16 + face * 5, tTop, face * 5 - 2, tTop + 60); stroke(ctx, of.torsoDark, 3);
      line(ctx, 16 + face * 5, tTop, face * 5 + 2, tTop + 60); stroke(ctx, of.torsoDark, 3);
      fillC(ctx, face * 5, tTop + 74, 3, of.torsoDark); fillC(ctx, face * 5, tTop + 96, 3, of.torsoDark);
    } else if (of.kind === 'hoodie') {
      rr(ctx, -24, tTop + tH - 52, 48, 28, 8); ctx.fillStyle = of.torsoDark; ctx.fill();
      line(ctx, -9, tTop + 6, -11, tTop + 40); stroke(ctx, '#ffffff', 2.5); line(ctx, 9, tTop + 6, 11, tTop + 40); stroke(ctx, '#ffffff', 2.5);
    } else if (of.kind === 'lab') {
      line(ctx, face * 4, tTop + 6, face * 4, tTop + tH); stroke(ctx, of.torsoDark, 3);
      rr(ctx, tw / 2 - 26, tTop + 30, 16, 20, 3); ctx.fillStyle = of.torsoDark; ctx.fill();
    }
    ctx.restore();
  }
  // near arm (side view) — front-view arms are drawn after the head so hands can touch the face
  if (face !== 0) drawArm(face > 0 ? 'ra' : 'la', face > 0 ? 1 : -1, false);

  // head
  ctx.save(); ctx.translate(face * 4, headY); ctx.rotate(pose.tilt || 0);
  circ(ctx, 0, 0, R); ctx.fillStyle = C(COL.ink); ctx.fill();
  if (!rimPass) {
    const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, 4, 0, 0, R);
    g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; circ(ctx, 0, 0, R); ctx.fill();
    drawFace(ctx, o, face);
  }
  // hats
  if (of.hat === 'homburg') {
    ctx.save(); ctx.translate(0, -R * 0.62); ctx.rotate(-0.06);
    ell(ctx, 0, 6, R * 1.12, 9); ctx.fillStyle = C('#3f2f25'); ctx.fill();
    rr(ctx, -R * 0.7, -R * 0.62, R * 1.4, R * 0.7, [16, 16, 2, 2]); ctx.fillStyle = C('#4b372b'); ctx.fill();
    if (!rimPass) { rr(ctx, -R * 0.7, -6, R * 1.4, 9, 2); ctx.fillStyle = '#2a1e17'; ctx.fill(); }
    ctx.restore();
  } else if (of.hat === 'cap') {
    ctx.save(); ctx.translate(0, -R * 0.55);
    ctx.beginPath(); ctx.arc(0, 8, R * 0.98, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fillStyle = C(of.capCol); ctx.fill();
    rr(ctx, face >= 0 ? 10 : -R * 1.25, 0, R * 1.15, 10, 5); ctx.fill();
    ctx.restore();
  } else if (of.hat === 'bun') {
    fillC(ctx, -R * 0.2, -R * 0.98, R * 0.36, C('#6b4a35'));
    ctx.beginPath(); ctx.arc(0, 0, R * 1.02, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath(); ctx.fillStyle = C('#6b4a35'); ctx.fill();
  }
  if (of.goggles && o.goggles !== false) {
    // goggles pushed up on the forehead
    ctx.save(); ctx.translate(0, -R * 0.58);
    ctx.beginPath(); ctx.arc(0, R * 0.58, R * 1.0, Math.PI * 1.2, Math.PI * 1.8); stroke(ctx, C('#2c2f36'), 8, 'butt');
    rr(ctx, -R * 0.66, -13, R * 1.32, 24, 12); ctx.fillStyle = C('#2c2f36'); ctx.fill();
    if (!rimPass) { const g = ctx.createLinearGradient(-R * .6, -10, R * .6, 10); g.addColorStop(0, '#ffb547'); g.addColorStop(1, '#e05c7d'); rr(ctx, -R * 0.58, -9, R * 1.16, 16, 8); ctx.fillStyle = g; ctx.fill(); rr(ctx, -R * 0.45, -6, R * 0.35, 4, 2); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
  if (face === 0) { drawArm('la', -1, false); drawArm('ra', 1, false); }
  ctx.restore();
}

function drawFace(ctx, o, face) {
  const R = RIG.R, ex = o.expr || 'smile';
  const look = o.look || [face * 0.6, 0];
  const lx = look[0] * 10, ly = look[1] * 6;
  const bl = 1 - clamp(o.blink || 0);
  const W_ = '#ffffff';
  let erx = 6.2, ery = 9.5;
  if (ex === 'surprise') { erx = 7.4; ery = 11.5; }
  const eyeY = -6 + ly;
  const exs = [-15 + lx, 15 + lx];
  if (ex === 'flat') {
    exs.forEach(x => { ctx.save(); ctx.beginPath(); ctx.rect(x - 10, eyeY - 1, 20, 20); ctx.clip(); fillE(ctx, x, eyeY, erx, Math.max(0.8, ery * bl), W_); ctx.restore(); line(ctx, x - 9, eyeY - 1, x + 9, eyeY - 1); stroke(ctx, W_, 3.5); });
  } else if (ex === 'squint' || ex === 'strain') {
    ctx.beginPath(); ctx.moveTo(exs[0] - 7, eyeY - 7); ctx.lineTo(exs[0] + 5, eyeY); ctx.lineTo(exs[0] - 7, eyeY + 7);
    ctx.moveTo(exs[1] + 7, eyeY - 7); ctx.lineTo(exs[1] - 5, eyeY); ctx.lineTo(exs[1] + 7, eyeY + 7); stroke(ctx, W_, 4);
  } else {
    exs.forEach(x => fillE(ctx, x, eyeY, erx, Math.max(0.8, ery * bl), W_));
  }
  // brows
  if (ex === 'surprise') {
    exs.forEach(x => { ctx.beginPath(); ctx.arc(x, eyeY - 4, 15, Math.PI * 1.3, Math.PI * 1.7); stroke(ctx, W_, 3.5); });
  } else if (ex === 'worry' || ex === 'gulp') {
    ctx.beginPath(); ctx.moveTo(exs[0] - 9, eyeY - 15); ctx.lineTo(exs[0] + 7, eyeY - 20);
    ctx.moveTo(exs[1] + 9, eyeY - 15); ctx.lineTo(exs[1] - 7, eyeY - 20); stroke(ctx, W_, 3.5);
  } else if (ex === 'curious' || ex === 'smirk') {
    ctx.beginPath(); ctx.moveTo(exs[0] - 8, eyeY - 17); ctx.lineTo(exs[0] + 7, eyeY - 16);
    ctx.moveTo(exs[1] - 8, eyeY - 21); ctx.quadraticCurveTo(exs[1], eyeY - 26, exs[1] + 8, eyeY - 20); stroke(ctx, W_, 3.5);
  }
  // mouth
  const mx = lx * 0.8, my = 16 + ly * 0.5;
  if (ex === 'smile') { ctx.beginPath(); ctx.arc(mx, my - 8, 13, Math.PI * 0.18, Math.PI * 0.82); stroke(ctx, W_, 4.5); }
  else if (ex === 'big') { ctx.beginPath(); ctx.arc(mx, my - 3, 13, 0, Math.PI); ctx.closePath(); ctx.fillStyle = W_; ctx.fill(); }
  else if (ex === 'surprise') { fillE(ctx, mx, my + 3, 6.5, 8.5, W_); }
  else if (ex === 'o') { fillE(ctx, mx, my + 2, 5, 6, W_); }
  else if (ex === 'worry') { ctx.beginPath(); ctx.arc(mx, my + 10, 10, Math.PI * 1.2, Math.PI * 1.8); stroke(ctx, W_, 4); }
  else if (ex === 'gulp') { ctx.beginPath(); ctx.moveTo(mx - 9, my + 2); ctx.quadraticCurveTo(mx - 4, my - 2, mx, my + 2); ctx.quadraticCurveTo(mx + 4, my + 6, mx + 9, my + 1); stroke(ctx, W_, 4); }
  else if (ex === 'curious') { ctx.beginPath(); ctx.moveTo(mx - 7, my + 2); ctx.lineTo(mx + 8, my); stroke(ctx, W_, 4); }
  else if (ex === 'squint') { ctx.beginPath(); ctx.arc(mx, my + 8, 9, Math.PI * 1.15, Math.PI * 1.85); stroke(ctx, W_, 4); }
  else if (ex === 'strain') { ctx.beginPath(); ctx.moveTo(mx - 12, my + 2); for (let i = 1; i <= 6; i++) ctx.lineTo(mx - 12 + i * 4, my + 2 + (i % 2 ? -4 : 0)); stroke(ctx, W_, 3.5); }
  else if (ex === 'grin') { ctx.beginPath(); ctx.moveTo(mx - 15, my - 4); ctx.quadraticCurveTo(mx, my + 16, mx + 15, my - 4); ctx.closePath(); ctx.fillStyle = W_; ctx.fill(); }
  else if (ex === 'smirk') { ctx.beginPath(); ctx.moveTo(mx - 9, my + 2); ctx.quadraticCurveTo(mx + 2, my + 6, mx + 11, my - 4); stroke(ctx, W_, 4); }
  else { ctx.beginPath(); ctx.moveTo(mx - 7, my + 1); ctx.lineTo(mx + 7, my + 1); stroke(ctx, W_, 4); }
  if (o.sweat) { // sweat drop
    const a = o.sweat; ctx.save(); ctx.globalAlpha *= a; ctx.translate(R * 0.62, -R * 0.42 + (1 - a) * -6);
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(9, 2, 0, 8); ctx.quadraticCurveTo(-9, 2, 0, -12); ctx.fillStyle = '#bfe2f2'; ctx.fill(); ctx.restore();
  }
}

// board-style figure: thin white line person (circle head, rectangle torso, line limbs)
function lineFigure(ctx, x, y, s, p = 1, col = '#fff', lw = 3.5, pose = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const L = lw / s;
  const steps = [
    () => { circ(ctx, 0, -205, 30); stroke(ctx, col, L); },
    () => { rr(ctx, -24, -168, 48, 82, 2); stroke(ctx, col, L); },
    () => { poly(ctx, [[-24, -162], [-38, -120], [-36, -86]], false); stroke(ctx, col, L); poly(ctx, [[24, -162], [38, -120], [36, -86]], false); stroke(ctx, col, L); },
    () => { line(ctx, -12, -86, -13, 0); stroke(ctx, col, L); line(ctx, 12, -86, 13, 0); stroke(ctx, col, L); },
  ];
  steps.forEach((f, i) => { const q = clamp(p * steps.length - i); if (q > 0) { ctx.save(); ctx.globalAlpha *= q; f(); ctx.restore(); } });
  ctx.restore();
}
