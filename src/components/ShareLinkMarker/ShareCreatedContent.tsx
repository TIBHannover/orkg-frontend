import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Tippy, { useSingleton } from '@tippyjs/react';
import { getFacebookSharerLink, getTwitterSharerLink, getLinkedInSharerLink } from 'components/ShareLinkMarker/helpers';
import usePathname from 'components/NextJsMigration/usePathname';
import { FC } from 'react';

type ShareCreatedContentProps = {
    typeOfLink: string;
    title: string;
};

const ShareCreatedContent: FC<ShareCreatedContentProps> = ({ typeOfLink, title }) => {
    const [source, target] = useSingleton();
    const pathname = usePathname();
    const shareUrl = `${window.location.protocol}//${window.location.host}${pathname}`;

    return (
        <div className="mb-2">
            <Tippy placement="bottom" singleton={source} delay={500} />
            <div className="mb-3 mt-2">Share: </div>
            <Tippy singleton={target} content={`Share this ${typeOfLink || 'page'} on Facebook`}>
                <a href={getFacebookSharerLink({ shareUrl })} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <Icon icon={faFacebook} size="lg" />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Twitter`}>
                <a href={getTwitterSharerLink({ shareUrl, title })} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <Icon icon={faXTwitter} size="lg" />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Linkedin`}>
                <a href={getLinkedInSharerLink({ shareUrl })} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <Icon icon={faLinkedin} size="lg" />
                </a>
            </Tippy>
        </div>
    );
};

export default ShareCreatedContent;
