# Free PDF Editor

A free, in-browser PDF editor — upload any PDF, add or edit text boxes directly on the page, restyle fonts, colors and sizes, then download the modified file. Everything happens **100% client-side**: your documents never leave your browser, no sign-up, no server, no fees.

## Features

- **Upload & render PDFs** — drop in any PDF file; pages are rendered live in the browser using [pdf.js](https://mozilla.github.io/pdf.js/)
- **Add text boxes** — click the Text tool and place new text anywhere on the page
- **Edit existing text** — select a text box to change its content, font, weight, size, and color
- **Move & duplicate** — drag boxes to reposition them, duplicate or delete with one click
- **Full undo/redo** — history covers movements, deletions, creations, style changes, and text edits (Ctrl/Cmd+Z, Ctrl+Y)
- **Zoom controls** — zoom in/out for precise placement
- **Download** — export the edited document as a new PDF via [pdf-lib](https://pdf-lib.js.org/)
- **Bilingual UI** — English and Spanish (EN/ES toggle)
- **Dark / light mode** — system, light, and dark themes
- **Keyboard shortcuts** — undo, redo, and more from the toolbar hint line

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, static export) |
| UI | React 18, Tailwind CSS, shadcn/ui, Radix UI primitives |
| Icons | Lucide React |
| PDF render | pdfjs-dist (worker loaded from jsDelivr CDN) |
| PDF edit/export | pdf-lib |
| State | React hooks (undo/redo history stack) |
| Theme | next-themes |
| Language | TypeScript |

Originally generated with v0 by Vercel.

## Quick Start

Requirements: Node.js 18+ and npm (or pnpm).

```bash
# install dependencies
npm install

# run the dev server
npm run dev
# open http://localhost:3000

# build the static site
npm run build
# output lands in ./out — serve it with any static host:
npx serve out
```

With pnpm:

```bash
pnpm install
pnpm dev
pnpm build
```

## Project Structure

```
free-pdf-editor/
├── app/
│   ├── page.tsx          # main page — mounts the PDF editor
│   ├── layout.tsx        # root layout, theme provider, metadata
│   ├── globals.css       # Tailwind + theme tokens
│   └── not-found.tsx     # 404 page
├── components/
│   ├── pdf-editor.tsx    # the whole editor: canvas, tools, history, export
│   ├── theme-provider.tsx
│   ├── google-fonts.ts   # Geist font loading
│   └── ui/               # shadcn/ui primitives (button, card, input, select)
├── lib/
│   └── utils.ts          # cn() class helper
├── public/               # static assets (favicon, manifest, images)
├── styles/               # extra global styles
├── next.config.mjs       # static export config (output: 'export')
└── components.json       # shadcn/ui config
```

## How It Works

1. `pdf-editor.tsx` reads the uploaded file into an `ArrayBuffer`.
2. `pdfjs-dist` renders each page to a canvas for display.
3. Text boxes are HTML overlays positioned over the canvas; their geometry is stored in normalized coordinates.
4. On download, `pdf-lib` loads the original PDF and draws each text box back into the page at the matching position, then saves a new file.
5. All state stays in React memory — closing the tab discards the document (by design, for privacy).

## Environment Variables

None. The app has no backend, no keys, and no secrets. The only network call is the pdf.js worker fetched from the jsDelivr CDN at runtime (`components/pdf-editor.tsx`, `GlobalWorkerOptions.workerSrc`).

## Deployment

The site is fully static and can be hosted anywhere:

- **GitHub Pages** (current): the repo's `gh-pages` branch is built from `main` — live at https://girishlade111.github.io/free-pdf-editor/
- **Vercel / Netlify / Cloudflare Pages**: import the repo and build with `npm run build` (output directory `out`)

> Note for root-domain deploys (Vercel etc.): `next.config.mjs` currently sets `basePath: '/free-pdf-editor'` for the GitHub Pages subpath. Remove the `basePath` line when deploying to a root domain so links and assets resolve from `/`.

## Limitations

- Text editing is overlay-based: editing "existing text" means the editor covers the original glyphs with its own text layer; it does not parse the PDF's original text objects.
- No annotation, form-filling, image insertion, or page reordering (yet).
- Very large PDFs (hundreds of pages) may be slow, since every page renders to canvas in the browser.

## License

No license file is present in this repository. All rights reserved by the author unless stated otherwise.

---

Built by Girish Lade — https://ladestack.in
