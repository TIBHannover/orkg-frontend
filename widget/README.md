# ORKG Widget Documentation

bundle size: **11.3 kB**

### How to use:

Place the following code on your website and set the paramater data-doi.

```html
<div class="orkg-widget" data-doi="10.1007/s00799-015-0158-y"></div>
<script>
    (function(w, d, s, o, f, js, fjs) {
        w['ORKG-Widget'] = o;
        w[o] =
            w[o] ||
            function() {
                (w[o].q = w[o].q || []).push(arguments);
            };
        (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
        js.id = o;
        js.src = f;
        js.async = 1;
        fjs.parentNode.insertBefore(js, fjs);
    })(window, document, 'script', 'orkgw', './widget.js');
    orkgw('paper', { language: 'en' });
</script>
```

### Languages

ORKG widget supports two languages :

-   `en` _(for English)_
-   `de` _(for German)_

### Css Classes

The orkg widget uses this following html template to render the widget:

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

### Building

```
npm run build
```

### Serve

```
npm run start
```

### Building release

```
npm run build-release
```
