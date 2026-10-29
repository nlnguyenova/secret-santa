# SSA Secret Santa — Neon Slot Machine

Open `index.html` in a browser, or publish the folder contents to GitHub Pages.

- `index.html`: structure and login overlay
- `styles.css`: red/chrome slot-machine look, neon title, arrow, curtains and gift panel
- `app.js`: login-code mapping, fixed recipient assignments, animated reels and gift ideas

The participant images are **optional**. To add them, create `images/faces/` and save PNGs named after the recipient (e.g. `Eva.png`). The machine displays names when photos are missing.

To test: open the page, use one of the codes defined at the beginning of `app.js`, then click/tap the lever. The 3 reels settle on the assigned recipient, and their gift ideas appear alongside the machine.

The login codes are client-side convenience codes, not secure authentication. All participant assignments are visible in the JavaScript source. For genuinely private draws, store assignments behind a server-side authentication system.
