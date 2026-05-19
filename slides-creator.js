#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const cheerio = require('cheerio');

const REVEAL_THEMES = [
  'black', 'white', 'league', 'beige', 'sky',
  'night', 'serif', 'simple', 'solarized', 'moon', 'dracula'
];

const TRANSITIONS = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];

// Elegant corporate design system injected into every presentation
const ELEGANT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  /* Viewport */
  .reveal-viewport { background: #f8fafc; }

  /* Progress bar */
  .reveal .progress {
    background: rgba(30, 58, 138, 0.08);
    height: 3px;
  }
  .reveal .progress span {
    background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
    border-radius: 0 2px 2px 0;
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Slide layout */
  .reveal .slides section {
    height: 100%;
    top: 0 !important;
    display: flex !important;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    padding: 0;
  }

  .slide-inner {
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
    padding: 60px 80px;
    overflow: auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: clamp(14px, 1.55vw, 17px);
    line-height: 1.75;
    color: #1e293b;
    background: #f8fafc;
  }

  /* Entrance animation */
  .reveal .slides section.present .slide-inner {
    animation: elegantEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes elegantEnter {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Typography ─────────────────────────────────── */
  .slide-inner h1,
  .slide-inner h2 {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    color: #1e3a8a;
    line-height: 1.18;
    letter-spacing: -0.025em;
    margin: 0 0 0.55em;
    font-weight: 700;
  }
  .slide-inner h1 { font-size: 2.7em; }
  .slide-inner h2 { font-size: 2em; }
  .slide-inner h3 {
    font-size: 1.05em;
    font-weight: 600;
    color: #1e3a8a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 0.8em;
    opacity: 0.75;
  }
  .slide-inner p {
    margin: 0 0 1em;
    max-width: 70ch;
    color: #374151;
  }
  .slide-inner strong { color: #1e3a8a; font-weight: 600; }
  .slide-inner em { font-style: italic; color: #4b5563; }

  /* ── Links ──────────────────────────────────────── */
  .slide-inner a {
    color: #1d4ed8;
    text-decoration: none;
    border-bottom: 1px solid rgba(29, 78, 216, 0.25);
    transition: border-color 0.2s, color 0.2s;
  }
  .slide-inner a:hover {
    color: #1e3a8a;
    border-bottom-color: #1e3a8a;
  }

  /* ── Lists ──────────────────────────────────────── */

  /* --- Unordered lists --- */
  .slide-inner ul {
    list-style: none;
    padding: 0;
    margin: 0 0 1.2em;
  }
  .slide-inner ul > li {
    position: relative;
    padding-left: 1.55em;
    margin-bottom: 0.72em;
    color: #374151;
    line-height: 1.65;
  }
  /* Filled circle bullet */
  .slide-inner ul > li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.52em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #1e3a8a;
    flex-shrink: 0;
  }

  /* Nested ul — hollow circle, lighter blue */
  .slide-inner ul ul {
    margin-top: 0.5em;
    margin-bottom: 0.2em;
    padding-left: 0.4em;
  }
  .slide-inner ul ul > li::before {
    background: transparent;
    border: 1.5px solid #93c5fd;
    width: 5px;
    height: 5px;
    top: 0.55em;
  }

  /* --- Ordered lists --- */
  .slide-inner ol {
    list-style: none;
    padding: 0;
    margin: 0 0 1.2em;
    counter-reset: slide-ol;
  }
  .slide-inner ol > li {
    position: relative;
    padding-left: 2.1em;
    margin-bottom: 0.72em;
    color: #374151;
    line-height: 1.65;
    counter-increment: slide-ol;
  }
  .slide-inner ol > li::before {
    content: counter(slide-ol, decimal-leading-zero);
    position: absolute;
    left: 0;
    top: 0;
    color: #1e3a8a;
    font-weight: 700;
    font-size: 0.72em;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    line-height: 2.1;
    min-width: 1.6em;
  }

  /* --- Staggered entrance per li --- */
  .reveal .slides section.present .slide-inner li {
    opacity: 0;
    animation: liEnter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes liEnter {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .reveal .slides section.present .slide-inner li:nth-child(1) { animation-delay: 0.15s; }
  .reveal .slides section.present .slide-inner li:nth-child(2) { animation-delay: 0.25s; }
  .reveal .slides section.present .slide-inner li:nth-child(3) { animation-delay: 0.35s; }
  .reveal .slides section.present .slide-inner li:nth-child(4) { animation-delay: 0.44s; }
  .reveal .slides section.present .slide-inner li:nth-child(5) { animation-delay: 0.52s; }
  .reveal .slides section.present .slide-inner li:nth-child(6) { animation-delay: 0.59s; }
  .reveal .slides section.present .slide-inner li:nth-child(7) { animation-delay: 0.65s; }
  .reveal .slides section.present .slide-inner li:nth-child(8) { animation-delay: 0.70s; }

  /* ── Code ───────────────────────────────────────── */
  .slide-inner code {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    background: #eff6ff;
    color: #1d4ed8;
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 0.82em;
    font-weight: 500;
  }
  .slide-inner pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 22px 28px;
    border-radius: 10px;
    overflow-x: auto;
    font-size: 0.8em;
    line-height: 1.65;
    margin: 0 0 1.2em;
    box-shadow: 0 4px 28px rgba(15, 23, 42, 0.14);
  }
  .slide-inner pre code {
    background: none;
    color: inherit;
    padding: 0;
    font-size: 1em;
    border-radius: 0;
  }

  /* ── Tables ─────────────────────────────────────── */
  .slide-inner table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88em;
    margin-bottom: 1.2em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 8px rgba(30, 58, 138, 0.07);
  }
  .slide-inner th {
    background: #1e3a8a;
    color: #fff;
    padding: 11px 18px;
    text-align: left;
    font-weight: 600;
    letter-spacing: 0.04em;
    font-size: 0.85em;
  }
  .slide-inner td {
    padding: 10px 18px;
    border-bottom: 1px solid #e2e8f0;
    color: #374151;
  }
  .slide-inner tr:last-child td { border-bottom: none; }
  .slide-inner tbody tr:nth-child(even) td { background: #f8fafc; }
  .slide-inner tbody tr:hover td { background: #eff6ff; transition: background 0.15s; }

  /* ── Blockquote ─────────────────────────────────── */
  .slide-inner blockquote {
    border-left: 3px solid #1e3a8a;
    margin: 0 0 1.2em;
    padding: 10px 22px;
    background: #eff6ff;
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #374151;
  }

  /* ── Divider ────────────────────────────────────── */
  .slide-inner hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.6em 0;
  }

  /* ── Images ─────────────────────────────────────── */
  .slide-inner img {
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.09);
  }

  /* ── Accent chip (utility class) ────────────────── */
  .slide-inner .chip,
  .slide-inner .badge,
  .slide-inner .tag {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid rgba(29, 78, 216, 0.2);
    padding: 3px 11px;
    border-radius: 20px;
    font-size: 0.78em;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  /* ── Slide number ───────────────────────────────── */
  .reveal .slide-number {
    background: transparent;
    color: rgba(30, 58, 138, 0.35);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    bottom: 16px;
    right: 20px;
  }
`;

program
  .name('slides-creator')
  .description('Generate an elegant Reveal.js presentation from HTML pages (1 file = 1 slide)')
  .argument('[files...]', 'HTML files to convert (ordered)')
  .option('-i, --input <dir>', 'Directory containing HTML files (sorted alphabetically)')
  .option('-o, --output <file>', 'Output file', 'presentation.html')
  .option('--reveal-theme <theme>', `Override Reveal.js base theme [${REVEAL_THEMES.join(', ')}]`)
  .option('--transition <transition>', `Slide transition [${TRANSITIONS.join(', ')}]`, 'fade')
  .option('--title <title>', 'Presentation title', 'Presentation')
  .option('--slide-number', 'Show slide numbers')
  .option('--no-source-styles', 'Ignore CSS from source HTML files (use only the elegant defaults)')
  .parse();

const opts = program.opts();
const args = program.args;

// --- Collect files ---
let files = [];

if (opts.input) {
  const dir = path.resolve(opts.input);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Error: "${dir}" is not a valid directory`);
    process.exit(1);
  }
  files = fs.readdirSync(dir)
    .filter(f => /\.(html|htm)$/i.test(f))
    .sort()
    .map(f => path.join(dir, f));
} else if (args.length > 0) {
  files = args.map(f => path.resolve(f));
} else {
  program.help();
}

if (files.length === 0) {
  console.error('Error: no HTML files found');
  process.exit(1);
}

// --- Parse each HTML file into a slide ---
const slides = files.map(filePath => {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: file not found, skipping: ${filePath}`);
    return null;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);

  const cssBlocks = [];

  if (opts.sourceStyles !== false) {
    // Inline linked relative stylesheets
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !/^(https?:)?\/\//.test(href)) {
        const cssPath = path.resolve(path.dirname(filePath), href);
        if (fs.existsSync(cssPath)) {
          cssBlocks.push(fs.readFileSync(cssPath, 'utf-8'));
        }
      }
    });

    // Collect <style> blocks
    $('style').each((_, el) => cssBlocks.push($(el).html()));
  }

  const bodyContent = $('body').length ? $('body').html() : $.html();
  const slideTitle = $('title').text() || path.basename(filePath, path.extname(filePath));

  return {
    id: path.basename(filePath, path.extname(filePath)).replace(/[^a-z0-9-_]/gi, '-'),
    title: slideTitle,
    content: bodyContent,
    css: cssBlocks,
  };
}).filter(Boolean);

if (slides.length === 0) {
  console.error('Error: no valid slides could be generated');
  process.exit(1);
}

// --- CSS scoping ---
// body/html/root rules are stripped: the body element is not present inside a slide div,
// so these rules would either be dead or bleed out. Stripping prevents background/color leakage.
function cleanAndScopeCSS(css, scope) {
  // Strip body, html, :root rules
  const stripped = css.replace(
    /(?:^|(?<=}|\*\/)\s*)(?:html|body|:root)\s*\{[^}]*\}/gm,
    ''
  );

  return stripped.replace(/([^{}@]+)\{/g, (match, selectors) => {
    const trimmed = selectors.trim();
    if (!trimmed || /^@/.test(trimmed)) return match;

    const scoped = trimmed
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `${scope} ${s}`)
      .join(', ');

    return `${scoped} {`;
  });
}

const scopedStyles = slides
  .map(({ id, css }) =>
    css.map(block => cleanAndScopeCSS(block, `[data-slide-id="${id}"]`)).join('\n')
  )
  .join('\n\n');

// --- Build sections ---
const sections = slides.map(({ id, content }) => `
    <section data-slide-id="${id}">
      <div class="slide-inner">${content.trim()}</div>
    </section>`).join('');

const transition = TRANSITIONS.includes(opts.transition) ? opts.transition : 'fade';

// Optional: override with a raw Reveal.js theme (sits underneath our elegant layer)
const revealThemeLink = opts.revealTheme && REVEAL_THEMES.includes(opts.revealTheme)
  ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/${opts.revealTheme}.css">`
  : '';

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// --- Final HTML ---
const output = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(opts.title)}</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reset.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  ${revealThemeLink}

  <style>
    ${ELEGANT_CSS}

    /* ── Per-slide source styles (scoped) ── */
    ${scopedStyles}
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${sections.trim()}
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      transition: '${transition}',
      transitionSpeed: 'default',
      backgroundTransition: 'fade',
      slideNumber: ${opts.slideNumber ? "'c/t'" : 'false'},
      controls: false,
      controlsTutorial: false,
      progress: true,
      center: false,
      width: '100%',
      height: '100%',
      margin: 0,
      minScale: 1,
      maxScale: 1,
    });
  </script>
</body>
</html>`;

const outputPath = path.resolve(opts.output);
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`\nPresentation generated: ${outputPath}`);
console.log(`  Slides     : ${slides.length}`);
console.log(`  Transition : ${transition}`);
slides.forEach((s, i) => console.log(`  [${String(i + 1).padStart(2)}] ${s.id}  —  ${s.title}`));
