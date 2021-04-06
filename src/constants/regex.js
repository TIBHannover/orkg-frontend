const regex = {
    //eslint-disable-next-line
    URL: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/i,
    // eslint-disable-next-line no-useless-escape
    DOI: /^\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b$/i, //source: https://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
    PERMALINK: /^[a-zA-Z0-9_]+$/
};
export default regex;
