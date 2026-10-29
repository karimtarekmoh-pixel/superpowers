// Small scene props (all original artwork, fictional names).
// Each returns an element; scenes animate them.
window.Props = (() => {
  const place = (n, x, y, w, h) => {
    Object.assign(n.style, { position: "absolute", left: `${x}rem`, top: `${y}rem` });
    if (w != null) n.style.width = `${w}rem`;
    if (h != null) n.style.height = `${h}rem`;
    return n;
  };

  const glyph = {
    calendar: '<svg viewBox="0 0 24 24" width="62%"><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" width="58%"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="62%"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 8.2l1.2 2.5 2.7.3-2 1.8.6 2.7-2.5-1.4-2.5 1.4.6-2.7-2-1.8 2.7-.3z" fill="#fff"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" width="50%"><circle cx="6.5" cy="17" r="3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="17" r="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M8.6 15L18 4M15.4 15L6 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    check: (c = "#fff") => `<svg viewBox="0 0 24 24" width="60%"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  // Fictional app card with an icon, name, category and a /mo price.
  const appCard = (parent, { x, y, w, h, name, cat, color, icon }) => {
    const c = place(R.el(parent, "app-card"), x, y, w, h);
    c.innerHTML = `<div class="ic" style="background:${color}">${glyph[icon]}</div><div class="nm">${name}</div><div class="ct">${cat}</div><div class="pr"><span class="num">$0</span><small>/mo</small></div>`;
    return c;
  };

  // Calendar card whose month label flips; 12 squares fill as months pass.
  const calendar = (parent, { x, y, w, h }) => {
    const c = place(R.el(parent, "cal"), x, y, w, h);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    c.innerHTML = `
      <div style="position:absolute;inset:0;background:#fff;border-radius:2.4rem;box-shadow:var(--shadow);overflow:hidden">
        <div style="height:42%;background:var(--red);position:relative;overflow:hidden">
          ${months.map((m) => `<div class="mo" style="position:absolute;inset:0;display:grid;place-items:center;font:800 5.2rem/1 var(--sans);color:#fff;letter-spacing:.08em">${m}</div>`).join("")}
        </div>
        <div style="padding:2rem 2.4rem"><div class="label-sm" style="margin-bottom:1.2rem">Paid every month</div>
          <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:.7rem">${months.map(() => '<i class="sq" style="height:3.2rem;border-radius:.6rem;background:var(--soft);display:block"></i>').join("")}</div>
        </div>
      </div>`;
    return c;
  };

  // Magnifier glass (SVG).
  const magnifier = (parent, { x, y, size }) =>
    place(R.el(parent, "mag", `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="40" cy="40" r="28" fill="rgba(255,255,255,.35)" stroke="#111" stroke-width="7"/><path d="M61 61l26 26" stroke="#111" stroke-width="11" stroke-linecap="round"/><path d="M26 30a18 18 0 0 1 14-10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`), x, y, size, size);

  // Shield badge reading ORIGINAL.
  const shield = (parent, { x, y, size }) =>
    place(R.el(parent, "shield", `<svg viewBox="0 0 100 116" width="100%" height="100%"><path d="M50 4l40 14v32c0 30-18 50-40 62C28 100 10 80 10 50V18z" fill="#111" stroke="#111" stroke-width="4" stroke-linejoin="round"/><path d="M50 14l31 11v25c0 23-13 39-31 49C32 89 19 73 19 50V25z" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/><circle cx="50" cy="44" r="15" fill="#2FB36B"/><path d="M42 44.5l5.5 5.5L59 38.5" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><text x="50" y="80" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="12.5" letter-spacing="1" fill="#fff">ORIGINAL</text></svg>`), x, y, size, size * 1.16);

  // Storefront with a striped scalloped awning (fictional shop).
  const storefront = (parent, { x, y, w }) => {
    const stripes = Array.from({ length: 8 }, (_, i) => `<rect x="${8 + i * 13}" y="34" width="13" height="20" fill="${i % 2 ? "#fff" : "#E2342D"}"/>`).join("");
    const scallops = Array.from({ length: 8 }, (_, i) => `<path d="M${8 + i * 13} 54 a6.5 6.5 0 0 0 13 0" fill="${i % 2 ? "#fff" : "#E2342D"}" stroke="#111" stroke-width="2.4"/>`).join("");
    return place(
      R.el(parent, "store", `<svg viewBox="0 0 120 120" width="100%" height="100%" overflow="visible">
        <ellipse cx="60" cy="116" rx="52" ry="4" fill="rgba(0,0,0,.14)"/>
        <rect x="12" y="40" width="96" height="74" fill="#F3F1EC" stroke="#111" stroke-width="3"/>
        <rect x="16" y="14" width="88" height="20" rx="3" fill="#111"/>
        <text x="60" y="28.5" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="13" fill="#fff">Fade &amp; Co.</text>
        <g stroke="#111" stroke-width="2.4">${stripes}</g><rect x="8" y="34" width="104" height="20" fill="none" stroke="#111" stroke-width="3"/>${scallops}
        <rect x="22" y="66" width="36" height="30" fill="#CFE6F2" stroke="#111" stroke-width="3"/>
        <rect x="68" y="66" width="28" height="48" fill="#111"/><circle cx="91" cy="91" r="2" fill="#fff"/>
      </svg>`),
      x, y, w, w,
    );
  };

  // Generic camera glyph (not any app's logo) + handle.
  const camera = '<svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="5" y="9" width="38" height="30" rx="9" fill="none" stroke="#fff" stroke-width="3.4"/><circle cx="24" cy="24" r="8" fill="none" stroke="#fff" stroke-width="3.4"/><rect x="15" y="5" width="10" height="5" rx="2" fill="#fff"/></svg>';

  return { place, glyph, appCard, calendar, magnifier, shield, storefront, camera };
})();
