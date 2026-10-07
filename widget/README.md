# ORKG Widget

An embeddable script that shows whether a paper (identified by its DOI) exists in the [ORKG](https://orkg.org), links to it, and displays its number of statements — or offers to add the paper if it isn't in ORKG yet.

## How to use

Place the following code on your website and set the parameter `data-doi`.

```html
<div class="orkg-widget" data-doi="10.1007/s00799-015-0158-y"></div>
<script>
    (function (w, d, s, o, f, js, fjs) {
        w['ORKG-Widget'] = o;
        w[o] =
            w[o] ||
            function () {
                (w[o].q = w[o].q || []).push(arguments);
            };
        ((js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]));
        js.id = o;
        js.src = f;
        js.async = 1;
        fjs.parentNode.insertBefore(js, fjs);
    })(window, document, 'script', 'orkgw', 'https://orkg.org/widget.js');
    orkgw('paper', { language: 'en' });
</script>
```

## Languages

The ORKG widget supports two languages:

- `en` _(for English)_
- `de` _(for German)_

## CSS classes

The ORKG widget renders this HTML template, so its appearance can be adjusted per class:

```html
<div class="orkg-widget-box">
    <a href="#" class="orkg-widget-link" target="_blank">
        <span class="orkg-widget-label">
            <img src="" class="orkg-widget-icon" />
            <span class="orkg-widget-txt-link">Open in ORKG</span>
        </span>
    </a>
    <div class="orkg-widget-description">
        <span class="orkg-widget-text-statements">Number of statements</span>
        <span class="orkg-widget-statements">0</span>
    </div>
</div>
```

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

| Build                          | Backend API                   | Frontend links          |
| ------------------------------ | ----------------------------- | ----------------------- |
| Release (`npm run widget:build`) | `https://orkg.org/api/`       | `https://orkg.org/`     |
| Dev (`npm run widget:dev`)       | `http://localhost:8080/api/`  | `http://localhost:3000/` |
