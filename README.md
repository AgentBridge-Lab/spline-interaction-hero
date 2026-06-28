# Spline Interaction Hero

Next.js App Router version of the interactive hero page.

The hero is rendered directly into a local `<canvas>` with the extracted Hana
runtime, scene data, wasm, and texture assets in `public/`. It does not use an
iframe embed.

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
```

`npm run build` creates a static export in `out/`. `npm start` serves that
export locally.
