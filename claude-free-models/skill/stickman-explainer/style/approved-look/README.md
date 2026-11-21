# Starter code from an earlier approved video

Reusable drawing code from an 86-second landscape explainer approved as the target look. Only the generic helpers are kept (`code/js/core.js`, `char.js`, `scenery.js`, `geo.js`, `props.js`, `ui.js`, `code/render.mjs`, `code/stills.mjs`, `code/sfx.py`, the Montserrat font). The shots themselves are not kept: write `shots.js` for your own script (see `code/js/main.js` for the shape).

Every frame is drawn on an HTML canvas as a pure function of time. `render.mjs` renders with headless Chrome (puppeteer-core; `npm install` first; set `CHROME`, `VW`, `VH`, `DUR`) and `sfx.py` makes quiet sound effects.
