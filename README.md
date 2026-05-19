# slides-creator

Generate elegant [Reveal.js](https://revealjs.com/) presentations from HTML pages — **1 file = 1 slide**.

## Features

- Drop a folder of `.html` files, get a polished presentation in one command
- CSS scoped per slide — zero conflicts between pages
- External stylesheets (relative `<link>`) inlined automatically
- Corporate light theme: **Inter** + **Playfair Display**, blue accent `#1e3a8a`
- Bullet points with staggered entrance animations
- Single self-contained HTML output — no installation needed to view

## Installation

```bash
git clone https://github.com/riadh-mnasri/slides-creator.git
cd slides-creator
npm install
```

## Usage

```bash
# From a directory (sorted alphabetically)
node slides-creator.js --input ./my-pages --output slides.html

# Explicit files (custom order)
node slides-creator.js intro.html method.html conclusion.html

# With options
node slides-creator.js --input ./my-pages \
  --title "Q3 Review" \
  --transition zoom \
  --slide-number
```

Open the output file in any browser — no server required.

## Options

| Option | Default | Description |
|---|---|---|
| `-i, --input <dir>` | — | Directory of HTML files (alphabetical order) |
| `-o, --output <file>` | `presentation.html` | Output file |
| `--title <text>` | `Presentation` | Browser tab title |
| `--transition <name>` | `fade` | `fade` · `slide` · `zoom` · `convex` · `concave` · `none` |
| `--slide-number` | off | Show slide number (bottom right) |
| `--no-source-styles` | — | Ignore CSS from source pages, use only the elegant defaults |
| `--reveal-theme <name>` | — | Override the Reveal.js base theme (`white`, `black`, `moon`…) |

## How it works

```
HTML pages  →  Cheerio parser  →  CSS scoping  →  Reveal.js template  →  presentation.html
```

1. Each `.html` file becomes one `<section>` slide
2. `body` / `html` / `:root` CSS rules are stripped (they're meaningless inside a slide div)
3. All other selectors are prefixed with `[data-slide-id="…"]` to isolate styles
4. A corporate design system (typography, lists, tables, code blocks) is injected as the base layer

## Example

```bash
node slides-creator.js --input ./example/pages --output ./example/presentation.html --slide-number
```

The `example/` folder contains 6 sample pages covering intro, feature lists, code, quotes, ordered lists, and nested bullets.

## Keyboard shortcuts (in the browser)

| Key | Action |
|---|---|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `F` | Fullscreen |
| `Esc` | Overview mode |
| `S` | Speaker notes |

## License

MIT
