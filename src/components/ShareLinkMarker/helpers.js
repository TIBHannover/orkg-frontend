/**
 * Get Facebook sharer link
 */
export const getFacebookSharerLink = ({ shareUrl }) => `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

/**
 * Get Twitter SharerLink
 */
export const getTwitterSharerLink = ({ shareUrl, title }) => `https://twitter.com/share?url=${shareUrl}&via=orkg_org&text=${title}`;

/**
 * Get LinkedIn sharer link
 */
export const getLinkedInSharerLink = ({ shareUrl }) => `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
