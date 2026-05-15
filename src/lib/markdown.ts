import DOMPurify from 'isomorphic-dompurify';
import { marked as markedRaw } from 'marked';
import markedFootnote from 'marked-footnote';

import { processVideoEmbeds } from '@/lib/videoPostProcessor';

/**
 * Showdown accepted `![alt](url =500x300)` for image dimensions. Marked requires a quoted title:
 * `![alt](url "=500x300")`. Without this, video image lines are parsed as plain text and never embed.
 */
function preprocessShowdownStyleImageDimensions(md: string): string {
    return md.replace(/!\[([^\]]*)\]\(([^\s)]+)\s+(=\d+%?x(?:\d+%?|\*))\)/g, '![$1]($2 "$3")');
}

/** Same-page anchors (#section); opening in a new tab is wrong and unnecessary */
function isFragmentOnlyHref(href: string): boolean {
    return href.trimStart().startsWith('#');
}

/** Allowed iframe hostnames for video embeds (YouTube, Vimeo, TIB AV) */
const ALLOWED_VIDEO_EMBED_HOSTNAMES = [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
    'av.tib.eu',
];

const MATOMO_TRACKER_HOSTNAME = (() => {
    const raw = process.env.NEXT_PUBLIC_MATOMO_TRACKER_URL;
    if (!raw?.trim()) return null;
    try {
        return new URL(raw).hostname;
    } catch {
        return null;
    }
})();

const ALLOWED_IFRAME_HOSTNAMES = [...ALLOWED_VIDEO_EMBED_HOSTNAMES, ...(MATOMO_TRACKER_HOSTNAME ? [MATOMO_TRACKER_HOSTNAME] : [])];

function isAllowedIframeSrc(src: string | null): boolean {
    if (!src?.trim()) return false;
    try {
        // Protocol-relative (//host/...) is common in pasted iframe HTML; URL() needs a base for that form
        const url = src.startsWith('//') ? new URL(`https:${src}`) : new URL(src, 'https://orkg.org');
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
        return ALLOWED_IFRAME_HOSTNAMES.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch {
        return false;
    }
}

// Add a hook that runs after attributes are sanitized
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Check if the node is an anchor tag and has a target attribute
    // prevents Tabnabbing by forcing rel="noopener"
    if ('target' in node && node.getAttribute('target')) {
        node.setAttribute('rel', 'noopener noreferrer');
    }
    // Security: only allow iframe src from trusted embed domains (video + optional Matomo)
    if (node.tagName === 'IFRAME') {
        const src = node.getAttribute('src');
        if (!isAllowedIframeSrc(src)) {
            node.removeAttribute('src');
        } else if (src?.startsWith('//')) {
            node.setAttribute('src', `https:${src}`);
        }
    }
});

// Configure marked with extensions (applied once globally)
markedRaw.use({
    gfm: true,
    breaks: true,
    renderer: {
        link({ href, title, tokens }) {
            const text = tokens ? this.parser.parseInline(tokens) : '';
            const titleAttr = title ? ` title="${title}"` : '';
            if (isFragmentOnlyHref(href)) {
                return `<a href="${href}"${titleAttr}>${text}</a>`;
            }
            return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        },
    },
});
markedRaw.use(markedFootnote());
markedRaw.use({
    hooks: {
        postprocess(html) {
            return processVideoEmbeds(html);
        },
    },
});

export type ParseMarkdownOptions = {
    /** Sanitize HTML to prevent XSS. Default: true */
    sanitize?: boolean;
};

/**
 * Parse markdown to HTML using marked with GFM, footnotes, video embeds, and external links opening in a new window (fragment #anchors stay in-page).
 */
export function parseMarkdown(text: string, options: ParseMarkdownOptions = {}): string {
    const { sanitize = true } = options;

    // 1. Convert Markdown to HTML first
    const rawHtml = markedRaw.parse(preprocessShowdownStyleImageDimensions(text), { async: false });

    // 2. Sanitize the resulting HTML
    const cleanHtml = sanitize
        ? DOMPurify.sanitize(rawHtml, {
              ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'width', 'height', 'scrolling'],
              ADD_TAGS: ['iframe'],
              // allow only HTTP(S) and mailto URIs
              ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z0-9+.-]|(?:[a-z0-9+.-]+:)?\/\/)/i,
              ADD_URI_SAFE_ATTR: ['width', 'height'],
          })
        : rawHtml;

    return cleanHtml;
}

export { markedRaw as marked };
