import { faFacebook, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { getFacebookSharerLink, getLinkedInSharerLink, getTwitterSharerLink } from '@/components/ShareLinkMarker/helpers';

type ShareCreatedContentProps = {
    typeOfLink: string;
    title: string;
};

const ShareCreatedContent: FC<ShareCreatedContentProps> = ({ typeOfLink, title }) => {
    const pathname = usePathname();
    const shareUrl = `${window.location.protocol}//${window.location.host}${pathname}`;

    return (
        <div className="mb-2">
            <div className="mb-3 mt-2">Share: </div>
            <Tooltip content={`Share this ${typeOfLink || 'page'} on Facebook`}>
                <a href={getFacebookSharerLink({ shareUrl })} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFacebook} size="lg" />
                </a>
            </Tooltip>
            <Tooltip content={`Share this  ${typeOfLink || 'page'} on Twitter`}>
                <a href={getTwitterSharerLink({ shareUrl, title })} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faXTwitter} size="lg" />
                </a>
            </Tooltip>
            <Tooltip content={`Share this  ${typeOfLink || 'page'} on Linkedin`}>
                <a href={getLinkedInSharerLink({ shareUrl })} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faLinkedin} size="lg" />
                </a>
            </Tooltip>
        </div>
    );
};

export default ShareCreatedContent;
