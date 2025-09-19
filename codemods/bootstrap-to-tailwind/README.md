## Bootstrap → Tailwind codemod

Converts Bootstrap utility classes found in JSX/TSX `className` (and `class`) to Tailwind utilities, and prefixes converted classes with a Tailwind prefix.

By default, this codemod uses a Tailwind v4 variant-style prefix `tw:` and places it first in the variant chain (e.g., `flex` → `tw:flex`, `md:flex` → `tw:md:flex`). You can customize the prefix.

### What it does

-   Maps common Bootstrap classes (display, flex, spacing, text alignment/colors, backgrounds, grid columns) to Tailwind equivalents
-   Keeps unknown/custom classes intact
-   Supports responsive variants (e.g., `d-md-none` → `tw:md:hidden`)
-   Preserves the original quote style (single/double) in string literals and object keys
-   Adds Tailwind important (`!`) to converted utilities by default (configurable)
-   Works in string literals, template literals, conditional expressions, arrays, and common `classnames/clsx` usages

### Files

-   `codemods/bootstrap-to-tailwind/transform.js` — the jscodeshift transform
-   `codemods/bootstrap-to-tailwind/mapping.js` — mapping utilities

### Requirements

-   Node 16+
-   Use via `npx jscodeshift` (no install needed) or install jscodeshift locally

### Run (dry-run first)

```bash
# From repo root
npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
  --parser=tsx --extensions=tsx,jsx \
  --dry --print
```

### Apply changes

```bash
npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
  --parser=tsx --extensions=tsx,jsx
```

### Customize the Tailwind prefix

-   Variant-style (default, Tailwind v4): `tw:` is placed first in the variant chain
    -   `flex` → `tw:flex`
    -   `md:flex` → `tw:md:flex`
    -   `hover:flex` → `tw:hover:flex`
    ```bash
    npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
    --parser=tsx --extensions=tsx,jsx --twPrefix="tw:"
    ```

### Important modifier configuration

-   By default, the codemod adds the Tailwind important modifier (`!`) to each converted utility, while preserving variant chains and the prefix. Examples:
    -   `me-4` → `tw:!mr-6`
    -   `md:d-flex` → `tw:md:!flex`
    -   `px-2` → `tw:!px-2`
-   Disable it if not desired:

    ```bash
    npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
      --parser=tsx --extensions=tsx,jsx --twPrefix="tw:" --important=false
    ```

### Excluding folders

The transform skips these folders by default: `node_modules`, `public`, `widget`, `dist`, `build`, `.next`, `coverage`, `scripts`, `codemods`.

You can override/extend via `--exclude` with a comma-separated list of directory segments. Examples:

```bash
# Skip src/legacy and src/vendor in addition to defaults
npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
  --parser=tsx --extensions=tsx,jsx --exclude="legacy,vendor"

# Only skip custom folders (replaces defaults). Include defaults explicitly if needed
npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**/*.{jsx,tsx}" \
  --parser=tsx --extensions=tsx,jsx --exclude="node_modules,public,widget,dist,build,.next,coverage,scripts,codemods,legacy"
```

### Tips

-   Start with a narrow path to verify results, e.g. `src/components/Home/**/*.tsx`
-   Some mappings are approximate (e.g., button and badge styles). Extend `mapping.js` as needed for your design system.
-   Quote style is preserved: if your codebase uses double quotes, the transform will keep them.

### Notes

-   LTR assumption for `ms-*`/`me-*` (mapped to `ml-*`/`mr-*`). Adjust if you need RTL support.
-   Spacing tokens use Tailwind's combined form (no extra hyphens), e.g., `me-4` → `mr-6`, `ms-2` → `ml-2`, `mx-3` → `mx-4`.
-   Grid mapping: `col-6` → `w-1/2`, `col-3` → `w-1/4`, `col-7` → `w-7/12`, etc.
