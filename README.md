# MARATHON // TAU CETI IV — fan landing

A single-page fan landing for **Marathon** (Bungie, 2026), built in the game's
"graphic realism" style. Pure static site — plain HTML/CSS/JS, no build step,
no dependencies, self-hosted fonts. Works as-is on GitHub Pages.

## Deploy to GitHub Pages

1. Create a repo and push these files to the **root** of a branch (e.g. `main`).
2. Repo → **Settings → Pages** → **Source: Deploy from a branch** →
   Branch **`main`**, folder **`/ (root)`** → **Save**.
3. Wait ~1 min. Your site is live at:
   - `https://<user>.github.io/<repo>/` (project site), or
   - `https://<user>.github.io/` if the repo is named `<user>.github.io`.

Both work — every asset path is relative, so the site is agnostic to whether
it's served from the domain root or a `/repo/` subpath. The included
`.nojekyll` file tells Pages to serve everything verbatim (no Jekyll build).

No configuration, no `package.json`, no CI. Push and it runs.

## Local preview

Any static file server from this folder, e.g.:

```bash
python -m http.server 4173
# open http://127.0.0.1:4173/
```

Opening `index.html` via `file://` also mostly works, but a server is
recommended so the `@font-face` files load without cross-origin quirks.

## Files

```
index.html   markup + copy
styles.css   all styling, animations, responsive rules
script.js    boot sequence, tabs, reveal-on-scroll, ration dispenser, cursor
fonts/       self-hosted brand fonts (Maratype, Shapiro 65, PP Fraktion Mono, NuCaloric)
.nojekyll    disables Jekyll on GitHub Pages
```

## Notes

- Adding `?shot` to the URL enables a static capture mode (skips the boot
  overlay and freezes animations) — handy for screenshots.
- Respects `prefers-reduced-motion`: all motion is disabled for users who ask.

---

**Unofficial fan project.** Not affiliated with or endorsed by Bungie or Sony
Interactive Entertainment. MARATHON™ © Bungie, Inc. All trademarks are the
property of their respective owners.
