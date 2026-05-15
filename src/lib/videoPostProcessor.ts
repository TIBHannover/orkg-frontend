/**
 * Based on: https://github.com/showdownjs/youtube-extension
 * Post-processes HTML to embed YouTube, Vimeo, and TIB AV videos.
 * Adapted version that works with marked.
 */

const imgRegex = /(?:<p>)?<img[^>]*src="(.+?)"([^>]*)\/?>(?:<\/p>)?/gi;
const fullYoutubeRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?youtube\.(?:.+?)\/(?:(?:watch\?v=)|(?:embed\/))([a-zA-Z0-9_-]{11})/i;
const shortYoutubeRegex = /(?:(?:https?:)?(?:\/\/)?)?youtu\.be\/([a-zA-Z0-9_-]{11})/i;
const vimeoRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?vimeo\.com\/(\d+)/;
const vimeoPlayerRegex = /(?:(?:https?:)?(?:\/\/)?)player\.vimeo\.com\/video\/(\d+)/;
const tibAvMediaRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?av\.tib\.eu\/media\/(\d+)/;
const tibAvPlayerRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?av\.tib\.eu\/player\/(\d+)/;

const defaultWidth = 420;
const defaultHeight = 315;

/**
 * Parses dimensions from HTML img attributes.
 * Supports: width="..." height="...", or Showdown-style title="=WIDTHxHEIGHT" (e.g. =500x300)
 * Returns numeric values for iframe attributes (matches editor behavior).
 */
function parseDimensions(rest: string): { width: number; height: number } {
    const widthMatch = /width="(.+?)"/.exec(rest);
    const heightMatch = /height="(.+?)"/.exec(rest);
    if (widthMatch && heightMatch) {
        const width = parseInt(widthMatch[1], 10) || defaultWidth;
        const height = parseInt(heightMatch[1], 10) || defaultHeight;
        return { width, height };
    }
    // Showdown-style: title="=500x300" or title="=500x*" (supports " and ' quotes)
    const titleMatch = /title=["'](=(\d+|\d+%)x(\d+|\d+%|\*))["']/.exec(rest);
    if (titleMatch) {
        const [, , w, h] = titleMatch;
        const width = /^\d+$/.test(w) ? parseInt(w, 10) : defaultWidth;
        let height: number;
        if (h === '*') {
            height = defaultHeight;
        } else if (/^\d+$/.test(h)) {
            height = parseInt(h, 10);
        } else {
            height = defaultHeight;
        }
        return { width, height };
    }
    return { width: defaultWidth, height: defaultHeight };
}

export function processVideoEmbeds(html: string): string {
    return html.replace(imgRegex, (match, url, rest) => {
        const { width, height } = parseDimensions(rest);
        let m: RegExpExecArray | null;
        let embedUrl = '';
        if ((m = shortYoutubeRegex.exec(url)) || (m = fullYoutubeRegex.exec(url))) {
            embedUrl = `https://www.youtube.com/embed/${m[1]}?rel=0`;
        } else if ((m = vimeoPlayerRegex.exec(url)) || (m = vimeoRegex.exec(url))) {
            embedUrl = `https://player.vimeo.com/video/${m[1]}`;
        } else if ((m = tibAvPlayerRegex.exec(url)) || (m = tibAvMediaRegex.exec(url))) {
            embedUrl = `https://av.tib.eu/player/${m[1]}`;
        } else {
            return match;
        }
        return `<div class="video-embed text-center"><iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe></div>`;
    });
}
