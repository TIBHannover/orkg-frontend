const REGEX = {
    // eslint-disable-next-line
    URL: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/i,
    // eslint-disable-next-line no-useless-escape
    DOI_ID: /^\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'])\S)+)\b$/i, // source: https://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page#comment24134610_10324802
    DOI_URL: /\b(https?:\/\/(?:dx\.)?doi\.org\/(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\\'])\S)+))\b/i,
    PERMALINK: /^[a-zA-Z0-9_]+$/, // used to validate the observatory and organization slug
    TIB_URL: /^(https?:)?\/\/av\.tib\.eu(\/(media|player)?(\?.*)?)\//,
    YOUTUBE_URL: /^(https?:)?\/\/(www.)?youtube\.com\/watch\?v=/,
    GITHUB_CODE_URL: /^(https):(\/\/(www.)?raw\.githubusercontent\.com[^"']*\.(?:r|py))$/i,
    TIB_CODE_URL: /^(https):(\/\/(www.)?service\.tib\.eu[^"']*\.(?:r|py))$/i,
    DAILYMOTION_URL: /^(https?:)?\/\/(www.)?dailymotion\.com\/video\//,
    VIMEO_URL: /^(https?:)?\/\/(www.)?vimeo\.com\//,
    IMAGE_URL: /^(https):(\/\/[^"']*\.(?:png|jpg|jpeg|gif|svg))/i,
    PROPERTY_PATTERN: /^#P([0-9])+$/,
    RESOURCE_PATTERN: /^#R([0-9])+$/,
    CLASS_PATTERN: /^#C([0-9])+$/,
    MINIMUM_LENGTH_PATTERN: 3,
    ORCID_URL: /^(?:(?:https?:\/\/)?orcid.org\/)?([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?(([0-9]{4})|([0-9]{3}X))\/*$/,
    ORCID: /([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?(([0-9]{4})|([0-9]{3}X))/g,
    CSW_ROW_TITLES_VALUE: /^(row \d+)$/,
};
export default REGEX;
