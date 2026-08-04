# dsuh02.github.io

Personal site. Live at **https://dsuh02.github.io**

Hand-written HTML, CSS, and JavaScript. No framework, no bundler, no build step.
Deployment is `git push` to `main`, which GitHub Pages serves directly.

## Layout

```
index.html          the whole page, one file
404.html            not-found page
css/site.css        design tokens + every style
js/site.js          theme, nav, scrollspy, reveal, counters
img/headshot.jpg    the only raster image on the site
assets/             resume + writing PDFs
robots.txt          crawl policy
sitemap.xml         one URL, but search engines like it
```

## Editing

Open `index.html` in a browser. There is nothing to install and nothing to
compile, so what you see locally is exactly what ships.

To serve it over HTTP locally (needed only if you want root-absolute paths to
resolve the way they do in production):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Conventions worth keeping

- **Design tokens live in one place.** Every color, radius, and font stack is a
  custom property at the top of `css/site.css`. The light theme overrides the
  same names under `:root[data-theme="light"]`, so nothing else in the file needs
  to know a theme exists.
- **Theme resolution order** is saved preference, then `prefers-color-scheme`.
  An inline script in `<head>` applies the saved value before first paint so the
  wrong theme never flashes. Keyboard shortcut is `t`.
- **JavaScript is optional.** The page is fully readable with `js/site.js`
  blocked. Reveal animations, counters, and the scrollspy are enhancements; the
  content and every link work without them.
- **`prefers-reduced-motion` is respected** for real. Animations collapse and
  counters jump straight to their final value.
- **No external requests.** No CDN fonts, no analytics, no third-party scripts.
  The page renders from this repo alone.
- **Images stay small.** The headshot is 560px at JPEG q86, about 65 KB. If you
  add an image, resize it first. The previous version of this site shipped 11 MB
  of unoptimized PNGs.

## Accessibility notes

Semantic landmarks, a skip link, visible `:focus-visible` rings, `aria-current`
on the active nav item, and `aria-expanded` on the mobile toggle. Icons are
inline SVG `<symbol>` definitions referenced by `<use>` and marked
`aria-hidden` where they are decorative.
