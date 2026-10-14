# ORKG Widget

The user documentation can be found at https://tibhannover.gitlab.io/orkg/orkg-frontend/widget/index.html

## Browser support

The bundle targets ES2017 and uses `fetch`, so any evergreen browser works (roughly 2017+).

## Development

The widget is part of the root npm package — there is nothing to install separately. Source lives in `widget/src/` (TypeScript) and is built with esbuild (`widget/build.mjs`).

```bash
npm run widget:dev     # watch + serve the demo page at http://localhost:9060
npm run test:widget    # run the widget test suite (vitest, standalone config)
npm run widget:build   # release build -> public/widget.js
```

`public/widget.js` is **generated** — it is not committed. CI and the Docker image build it automatically; if you want `http://localhost:3000/widget.js` served by a local `npm run dev`, run `npm run widget:build` once first.

## Configuration

The ORKG URLs are baked in at build time in `widget/build.mjs` — the widget is a standalone script and cannot read runtime environment like the app does, and the Docker image is built once and reused across instances, so environment variables cannot reach this build anyway:

| Build                                          | Backend API                  | Frontend links           |
|------------------------------------------------|------------------------------|--------------------------|
| Release (`npm run widget:build`)               | `https://orkg.org/api/`      | `https://orkg.org/`      |
| Dev (`npm run widget:dev`)                     | `http://localhost:8080/api/` | `http://localhost:3000/` |
| Documentation (`npm run widget:documentation`) | -                            | -                        |
