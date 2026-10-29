// Shared helpers used by every component and scene builder.
window.R = (() => {
  // Create an element with a class and optional HTML, appended to a parent.
  const el = (parent, cls, html = "", tag = "div") => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  };

  // "Start a business with [$0]" -> words wrapped in spans; [word] becomes red italic.
  const headlineHTML = (text) =>
    text
      .split(/\s+/)
      .map((w) => {
        const m = w.match(/^\[(.+)\]$/);
        return m ? `<span class="w"><em>${m[1]}</em></span>` : `<span class="w">${w}</span>`;
      })
      .join(" ");

  // Deterministic pseudo-random numbers so every render is identical.
  const rng = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Log how long each component's timeline is, to see where time goes.
  const log = (name, tl) => {
    console.log(`[timeline] ${name.padEnd(22)} ${tl.duration().toFixed(2)}s`);
    return tl;
  };

  // 1rem in px for the current render size (stage is 108rem wide).
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  return { el, headlineHTML, rng, log, rem };
})();
