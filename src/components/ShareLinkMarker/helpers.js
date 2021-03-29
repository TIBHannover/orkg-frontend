/**
 * Get Facebook sharer link
 */
export const getFacebookSharerLink = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${window.location.protocol}//${window.location.host}${window.location.pathname}`;
};

/**
 * Get Twitter SharerLink
 */
export const getTwitterSharerLink = title => {
    return `https://twitter.com/share?url=${window.location.protocol}//${window.location.host}${window.location.pathname}&via=orkg_org&text=${title}`;
};

/**
 * Get LinkedIn sharer link
 */
export const getLinkedInSharerLink = () => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.protocol}//${window.location.host}${window.location.pathname}`;
};
