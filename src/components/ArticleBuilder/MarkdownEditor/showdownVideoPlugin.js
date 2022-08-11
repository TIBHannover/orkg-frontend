/* eslint-disable no-cond-assign */
/**
 * Based on: https://github.com/showdownjs/youtube-extension
 * Extended to support the TIB AV portal
 */

const svg =
    '<div class="youtube-preview" style="width:%2; height:%3; background-color:#333; position:relative;">' +
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' +
    '     width="100" height="70" viewBox="0 0 100 70"' +
    '     style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">' +
    '    <defs>' +
    '      <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">' +
    '        <stop offset="0%" style="stop-color:rgb(229,45,49);stop-opacity:1" />' +
    '        <stop offset="100%" style="stop-color:rgb(191,23,29);stop-opacity:1" />' +
    '      </linearGradient>' +
    '    </defs>' +
    '    <rect width="100%" height="100%" rx="26" fill="url(#grad1)"/>' +
    '    <polygon points="35,20 70,35 35,50" fill="#fff"/>' +
    '    <polygon points="35,20 70,35 64,37 35,21" fill="#e8e0e0"/>' +
    '</svg>' +
    '<div style="text-align:center; padding-top:10px; color:#fff"><a href="%1">%1</a></div>' +
    '</div>';
const img = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=" width="%2" height="%3">';
const iframe = '<div class="text-center"><iframe src="%1" width="%2" height="%3" frameborder="0" allowfullscreen></iframe></div>';
const imgRegex = /(?:<p>)?<img.*?src="(.+?)"(.*?)\/?>(?:<\/p>)?/gi;
const fullYoutubeRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?youtube\.(?:.+?)\/(?:(?:watch\?v=)|(?:embed\/))([a-zA-Z0-9_-]{11})/i;
const shortYoutubeRegex = /(?:(?:https?:)?(?:\/\/)?)?youtu\.be\/([a-zA-Z0-9_-]{11})/i;
const vimeoRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?vimeo.com\/(\d+)/;
const tibAvRegex = /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?av.tib.eu\/media\/(\d+)/;

function parseDimensions(rest, options) {
    let width;
    let height;
    let d;

    const defaultWidth = options.youtubeWidth ? options.youtubeWidth : 420;
    const defaultHeight = options.youtubeHeight ? options.youtubeHeight : 315;

    if (rest) {
        width = (d = /width="(.+?)"/.exec(rest)) ? d[1] : defaultWidth;
        height = (d = /height="(.+?)"/.exec(rest)) ? d[1] : defaultHeight;
    }

    // add units so they can be used in css
    if (/^\d+$/gm.exec(width)) {
        width += 'px';
    }
    if (/^\d+$/gm.exec(height)) {
        height += 'px';
    }

    return {
        width,
        height,
    };
}

const video = {
    type: 'output',
    filter(text, converter, options) {
        let tag = iframe;
        if (options.smoothLivePreview) {
            tag = options.youtubeUseSimpleImg ? img : svg;
        }
        return text.replace(imgRegex, (match, url, rest) => {
            const d = parseDimensions(rest, options);
            let m;
            let fUrl = '';
            if ((m = shortYoutubeRegex.exec(url)) || (m = fullYoutubeRegex.exec(url))) {
                fUrl = `https://www.youtube.com/embed/${m[1]}?rel=0`;
                if (options.youtubejsapi) {
                    fUrl += '&enablejsapi=1';
                }
            } else if ((m = vimeoRegex.exec(url))) {
                fUrl = `https://player.vimeo.com/video/${m[1]}`;
            } else if ((m = tibAvRegex.exec(url))) {
                fUrl = `https://av.tib.eu/player/${m[1]}`;
            } else {
                return match;
            }
            return tag
                .replace(/%1/g, fUrl)
                .replace('%2', d.width)
                .replace('%3', d.height);
        });
    },
};

export default video;
