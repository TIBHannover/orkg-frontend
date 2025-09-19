// Minimal, extensible Bootstrap → Tailwind mapping utilities
// Note: This mapping focuses on common classes. Extend as needed for your codebase.

/**
 * Map Bootstrap spacing scale (0-5) to Tailwind scale.
 * BS: 0->0, 1->0.25rem, 2->0.5rem, 3->1rem, 4->1.5rem, 5->3rem
 * TW: 0->0, 1->0.25rem, 2->0.5rem, 4->1rem, 6->1.5rem, 12->3rem
 */
const bsToTwSpace = { 0: '0', 1: '1', 2: '2', 3: '4', 4: '6', 5: '12' };

const breakpoints = ['sm', 'md', 'lg', 'xl', 'xxl'];

/**
 * Known direct mappings (no parameters)
 */
const directMap = new Map([
    // Display
    ['d-block', 'block'],
    ['d-inline', 'inline'],
    ['d-inline-block', 'inline-block'],
    ['d-flex', 'flex'],
    ['d-grid', 'grid'],
    ['d-none', 'hidden'],

    // Flex helpers
    ['flex-row', 'flex-row'],
    ['flex-column', 'flex-col'],
    ['flex-wrap', 'flex-wrap'],
    ['flex-grow-0', 'grow-0'],
    // Use flex-1 (1 1 0%) and allow shrinking of contents
    ['flex-grow-1', 'flex-1 min-w-0'],
    ['flex-shrink-0', 'shrink-0'],
    ['flex-shrink-1', 'shrink'],
    ['align-items-start', 'items-start'],
    ['align-items-center', 'items-center'],
    ['align-items-end', 'items-end'],
    ['justify-content-start', 'justify-start'],
    ['justify-content-center', 'justify-center'],
    ['justify-content-end', 'justify-end'],
    ['justify-content-between', 'justify-between'],
    ['justify-content-around', 'justify-around'],
    ['justify-content-evenly', 'justify-evenly'],

    // Text alignment
    ['text-start', 'text-left'],
    ['text-end', 'text-right'],
    ['text-left', 'text-left'],
    ['text-right', 'text-right'],
    ['text-center', 'text-center'],
    // Alt text-align aliases sometimes found in codebases
    ['text-align-left', 'text-left'],
    ['text-align-right', 'text-right'],
    ['text-align-center', 'text-center'],
    ['text-align-start', 'text-left'],
    ['text-align-end', 'text-right'],
    // Text & Typography
    ['text-break', 'break-all'],
    ['text-nowrap', 'text-nowrap'],
    ['text-wrap', 'text-wrap'],

    // Font weight/style
    ['fw-bold', 'font-bold'],
    ['fw-semibold', 'font-semibold'],
    ['fw-normal', 'font-normal'],
    ['fw-light', 'font-light'],
    ['fst-italic', 'italic'],
    ['font-weight-bold', 'font-bold'],
    ['font-weight-normal', 'font-normal'],
    ['font-weight-light', 'font-light'],
    ['font-italic', 'italic'],
    ['font-weight-bolder', 'font-extrablack'],

    // Rounded/border
    ['rounded', 'rounded'],
    ['rounded-0', 'rounded-none'],
    ['rounded-circle', 'rounded-full'],
    ['rounded-pill', 'rounded-full'],
    ['rounded-end', 'rounded-r'],
    ['rounded-top', 'rounded-t'],
    ['rounded-bottom', 'rounded-b'],
    ['border', 'border'],
    ['border-0', 'border-0'],
    ['border-bottom', 'border-b'],
    ['br-bottom', 'border-b'],

    // Buttons (very approximate defaults)
    ['btn', 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'],
    ['btn-sm', 'px-3 py-1.5 text-xs'],
    // Use project theme tokens for semantic colors
    ['btn-primary', 'bg-primary text-white hover:bg-primary-darker focus:ring-primary'],
    ['btn-secondary', 'bg-secondary text-white hover:bg-secondary-darker focus:ring-secondary'],
    // Smart suggestions button color (custom theme color)
    ['btn-smart', 'bg-smart text-white hover:bg-smart-darker focus:ring-smart'],
    ['btn-success', 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'],
    ['btn-danger', 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'],
    ['btn-warning', 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400'],
    ['btn-info', 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500'],
    ['btn-light', 'bg-light text-dark hover:bg-light-darker focus:ring-light'],
    ['btn-dark', 'bg-dark text-white hover:bg-dark focus:ring-dark'],
    ['btn-outline-secondary', 'border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus:ring-secondary'],
    ['btn-light-darker', 'bg-light-darker text-dark hover:bg-light focus:ring-light'],
    ['btn-link', 'bg-transparent p-0 text-primary focus:ring-0 hover:underline'],

    // Badges
    ['badge', 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded'],
    ['badge-primary', 'bg-primary text-white'],
    ['badge-secondary', 'bg-secondary text-white'],
    ['badge-success', 'bg-green-600 text-white'],
    ['badge-danger', 'bg-red-600 text-white'],
    ['badge-warning', 'bg-yellow-500 text-black'],
    ['badge-info', 'bg-cyan-600 text-white'],
    ['badge-light', 'bg-light text-dark'],
    ['badge-dark', 'bg-dark text-white'],

    // Container
    ['container', 'container mx-auto px-4'],
    ['container-fluid', 'w-full mx-auto px-4'],

    // Float
    ['float-right', 'float-right'],
    ['float-end', 'float-right'],
    ['float-start', 'float-left'],

    // Position
    ['position-relative', 'relative'],
    ['position-absolute', 'absolute'],
    ['position-fixed', 'fixed'],
    ['position-sticky', 'sticky'],
    ['position-static', 'static'],
    ['fixed-bottom', 'fixed bottom-0'],
    ['sticky', 'sticky'],
    ['z-3', 'z-30'],

    // Typography helpers
    ['small', 'text-sm'],
    ['h1', 'text-5xl'],
    ['h2', 'text-4xl'],
    ['h3', 'text-3xl'],
    ['h4', 'text-2xl'],
    ['h5', 'text-xl'],
    ['h6', 'text-lg'],

    // Misc
    ['clearfix', 'flow-root'],

    // Width & Height
    ['mw-100', 'max-w-full'],
    ['w-100', 'w-full'],
    ['w-50', 'w-1/2'],
    ['w-25', 'w-1/4'],
    ['w-75', 'w-3/4'],
    ['w-auto', 'w-auto'],
    ['w-full', 'w-full'],
    ['w-10', 'w-10'],
    ['h-100', 'h-full'],
    ['h-auto', 'h-auto'],
    ['h-screen', 'h-screen'],

    //flexbox & Grid
    ['d-flex', 'flex'],
    ['flex', 'flex'],
    ['flex-1', 'flex-1'],
    ['flex-col', 'flex-col'],
    ['flex-grow', 'grow'],
    ['flex-grow-1', 'grow'],
    ['flex-md-grow-1', 'md:grow'],
    ['flex-nowrap', 'flex-nowrap'],
    ['flex-row-reverse', 'flex-row-reverse'],
    ['flex-shrink-0', 'shrink-0'],

    //truncate
    ['text-truncate', 'truncate'],

    //box
    ['box-shadow', 'shadow-sm'],

    //overflow
    ['overflow-auto', 'overflow-auto'],
    ['overflow-hidden', 'overflow-hidden'],

    // cursor & pointer events
    ['cursor-pointer', 'cursor-pointer'],
    ['pe-none', 'pointer-events-none'],
    ['pe-auto', 'pointer-events-auto'],

    // spacing & gaps
    ['gap-2', 'gap-2'],
    ['gap-3', 'gap-3'],

    // opacity
    ['opacity-75', 'opacity-75'],

    // order
    ['order-1', 'order-1'],

    // Visibility & Display
    ['invisible', 'invisible'],
    ['sr-only', 'sr-only'],
    ['visually-hidden', 'sr-only'], //bootstrap v5
    ['d-none', 'hidden'],
]);

/**
 * Map Bootstrap responsive display classes: d-{bp?}-{value}
 */
function mapDisplay(token) {
    // d-{value} or d-{bp}-{value}
    const match = token.match(/^d-(?:(sm|md|lg|xl|xxl)-)?(none|block|inline|inline-block|flex|grid)$/);
    if (!match) return null;
    const [, bp, val] = match;
    const tw = directMap.get(`d-${val}`);
    if (!tw) return null;
    return bp ? `${bp}:${tw}` : tw;
}

/**
 * Map Bootstrap grid columns: col, col-{n}, col-{bp}-{n}
 */
function mapCols(token) {
    // col, col-6, col-md-4, col-sm, col-auto, col-sm-auto
    // Numbered columns → fixed fraction width (non-growing), stack below breakpoint
    let match = token.match(/^col-(?:(sm|md|lg|xl|xxl)-)?([1-9]|1[0-2])$/);
    if (match) {
        const [, bp, numStr] = match;
        const num = Number(numStr);
        const width = `w-${num}/12`;
        const basis = `basis-${num}/12`;
        const maxw = `max-w-${num}/12`;
        const fixed = `shrink-0 grow-0 ${width} ${basis} ${maxw}`;
        if (bp) {
            const prefixed = fixed
                .split(' ')
                .filter(Boolean)
                .map((t) => `${bp}:${t}`)
                .join(' ');
            return `w-full ${prefixed}`;
        }
        return fixed;
    }
    // col-auto
    match = token.match(/^col-(?:(sm|md|lg|xl|xxl)-)?auto$/);
    if (match) {
        const [, bp] = match;
        const auto = 'w-auto flex-none';
        if (bp) {
            const prefixed = auto
                .split(' ')
                .filter(Boolean)
                .map((t) => `${bp}:${t}`)
                .join(' ');
            return `w-full ${prefixed}`;
        }
        return auto;
    }
    // plain col → equal width at all sizes
    if (token === 'col') {
        return 'flex-1 basis-0 min-w-0';
    }
    // col-{bp} → stacked on smaller, equal columns from breakpoint and up
    match = token.match(/^col-(sm|md|lg|xl|xxl)$/);
    if (match) {
        const [, bp] = match;
        return `w-full ${bp}:flex-1 ${bp}:basis-0 ${bp}:min-w-0`;
    }
    return null;
}

/**
 * Map Bootstrap row → approximate flex row with wrap
 */
function mapRow(token) {
    // Bootstrap row applies negative margins to compensate for column padding
    // and sets display flex with wrap. We'll mirror that with gapless gutters
    // using -mx-2 to match px-2 added to columns.
    if (token === 'row') return 'flex flex-wrap items-stretch';
    return null;
}

/**
 * Map spacing utilities: m|p + t|r|b|l|x|y|s|e + optional bp + scale
 * Examples: mt-3, px-2, ms-2, me-3, mt-md-3
 */
function mapSpacing(token) {
    // Regex for numerical spacing (0-5)
    const reNumerical = /^(m|p)([trblxyse]?)(?:-(sm|md|lg|xl|xxl))?-(0|1|2|3|4|5)$/;
    // Regex for auto margins
    const reAuto = /^(m)([x|y]?)-(auto)$/;

    // Check for a numerical match first
    const mNum = token.match(reNumerical);
    if (mNum) {
        // Assume bsToTwSpace is defined elsewhere as a mapping
        const bsToTwSpace = {
            0: '0',
            1: '1',
            2: '2',
            3: '4',
            4: '6',
            5: '12',
        };
        const [, mp, dir, bp, scaleStr] = mNum;
        const twScale = bsToTwSpace[scaleStr];
        if (twScale == null) return null;

        const twDir =
            dir === 't'
                ? 't'
                : dir === 'r'
                ? 'r'
                : dir === 'b'
                ? 'b'
                : dir === 'l'
                ? 'l'
                : dir === 'x'
                ? 'x'
                : dir === 'y'
                ? 'y'
                : dir === 's'
                ? 'l'
                : dir === 'e'
                ? 'r'
                : '';

        const base = `${mp}${twDir ? twDir : ''}-${twScale}`;
        return bp ? `${bp}:${base}` : base;
    }

    // If no numerical match, check for an auto match
    const mAuto = token.match(reAuto);
    if (mAuto) {
        const [, mp, dir] = mAuto;
        return `${mp}${dir}-auto`;
    }

    // Return null if no match is found
    return null;
}

/**
 * Map Bootstrap gutter utilities g|gx|gy-(0..5) → Tailwind gap utilities
 */
function mapGutters(token) {
    const m = token.match(/^(g|gx|gy)-(0|1|2|3|4|5)$/);
    if (!m) return null;
    const [, axis, scaleStr] = m;
    const twScale = bsToTwSpace[scaleStr];
    if (twScale == null) return null;
    const prefix = axis === 'gx' ? 'gap-x' : axis === 'gy' ? 'gap-y' : 'gap';
    return `${prefix}-${twScale}`;
}

/**
 * Map rounded size variants rounded-1..rounded-5
 */
function mapRounded(token) {
    const m = token.match(/^rounded-([1-5])$/);
    if (!m) return null;
    const n = Number(m[1]);
    const map = { 1: 'rounded-sm', 2: 'rounded', 3: 'rounded-lg', 4: 'rounded-xl', 5: 'rounded-2xl' };
    return map[n] || null;
}

/**
 * Map user-select-* → select-*
 */
function mapUserSelect(token) {
    const m = token.match(/^user-select-(auto|all|none|text)$/);
    if (!m) return null;
    return `select-${m[1]}`;
}

/**
 * Map float start/end → left/right (LTR)
 */
function mapFloat(token) {
    const m = token.match(/^float-(start|end)$/);
    if (!m) return null;
    return m[1] === 'start' ? 'float-left' : 'float-right';
}

/**
 * Map border color helpers to semantic tokens
 */
function mapBorderColor(token) {
    const m = token.match(/^border-(primary|secondary|success|danger|warning|info|light|dark|white|black)$/);
    if (!m) return null;
    const color = m[1];
    // Keep semantic tokens for primary/secondary/light/dark
    if (color === 'primary' || color === 'secondary' || color === 'light' || color === 'dark') {
        return `border-${color}`;
    }
    const map = new Map([
        ['success', 'border-green-600'],
        ['danger', 'border-red-600'],
        ['warning', 'border-yellow-500'],
        ['info', 'border-cyan-600'],
        ['white', 'border-white'],
        ['black', 'border-black'],
    ]);
    return map.get(color) || null;
}

/**
 * Map text color/utility shorthands
 */
function mapText(token) {
    // text-{bp?}-{start|end|center}
    const align = token.match(/^text-(?:(sm|md|lg|xl|xxl)-)?(start|end|left|right|center)$/);
    if (align) {
        const [, bp, val] = align;
        const map = { start: 'text-left', end: 'text-right', left: 'text-left', right: 'text-right', center: 'text-center' };
        const tw = map[val];
        return bp ? `${bp}:${tw}` : tw;
    }
    // text-muted, text-primary, etc. (rough approximations)
    const colors = new Map([
        ['text-muted', 'text-gray-500'],
        // Use semantic tokens defined in @theme
        ['text-primary', 'text-primary'],
        ['text-primary-darker', 'text-primary-darker'],
        ['text-secondary', 'text-secondary'],
        ['text-secondary-darker', 'text-secondary-darker'],
        // Custom smart color
        ['text-smart', 'text-smart'],
        ['text-smart-darker', 'text-smart-darker'],
        ['text-success', 'text-green-600'],
        ['text-danger', 'text-red-600'],
        ['text-warning', 'text-yellow-600'],
        ['text-info', 'text-cyan-600'],
        ['text-light', 'text-light'],
        ['text-dark', 'text-dark'],
        ['text-white', 'text-white'],
        ['text-black', 'text-black'],
    ]);
    if (colors.has(token)) return colors.get(token);
    return null;
}

/**
 * Map background color shorthands
 */
function mapBackground(token) {
    const colors = new Map([
        // Use semantic tokens defined in @theme
        ['bg-primary', 'bg-primary'],
        ['bg-secondary', 'bg-secondary'],
        // Custom smart color
        ['bg-smart', 'bg-smart'],
        ['bg-smart-darker', 'bg-smart-darker'],
        ['bg-success', 'bg-green-600'],
        ['bg-danger', 'bg-red-600'],
        ['bg-warning', 'bg-yellow-500'],
        ['bg-info', 'bg-cyan-600'],
        ['bg-light', 'bg-light'],
        ['bg-dark', 'bg-dark'],
        ['bg-white', 'bg-white'],
        ['bg-black', 'bg-black'],
    ]);
    if (colors.has(token)) return colors.get(token);
    return null;
}

/**
 * Try mapping a single bootstrap token to tailwind token(s).
 * Returns string or null if unknown.
 */
function mapToken(token) {
    if (!token) return null;
    // direct map first (exact)
    if (directMap.has(token)) return directMap.get(token);
    // parametric mappers
    return (
        mapDisplay(token) ||
        mapCols(token) ||
        mapRow(token) ||
        mapSpacing(token) ||
        mapGutters(token) ||
        mapRounded(token) ||
        mapUserSelect(token) ||
        mapFloat(token) ||
        mapBorderColor(token) ||
        mapText(token) ||
        mapBackground(token) ||
        null
    );
}

/**
 * Apply a prefix to a tailwind token, respecting responsive/variant chains.
 * - If prefix ends with '-', it prefixes the base utility: `sm:flex` → `sm:tw-flex`
 * - If prefix ends with ':', it adds a variant: `sm:flex` → `sm:tw:flex`
 */
function applyPrefix(twToken, prefix) {
    if (!prefix) return twToken;
    if (prefix.endsWith('-')) {
        const parts = twToken.split(':');
        const base = parts.pop();
        return [...parts, `${prefix}${base}`].join(':');
    }
    if (prefix.endsWith(':')) {
        // Tailwind v4: "tw:" should be the first variant in the chain
        // Example: flex -> tw:flex, md:flex -> tw:md:flex, hover:flex -> tw:hover:flex
        return `${prefix}${twToken}`;
    }
    // Fallback: simple join
    const parts = twToken.split(':');
    const base = parts.pop();
    return [...parts, `${prefix}${base}`].join(':');
}

module.exports = {
    mapToken,
    applyPrefix,
    breakpoints,
};
