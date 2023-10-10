import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Tippy, { useSingleton } from '@tippyjs/react';
import PropTypes from 'prop-types';
import { getFacebookSharerLink, getTwitterSharerLink, getLinkedInSharerLink } from 'components/ShareLinkMarker/helpers';
import usePathname from 'components/NextJsMigration/usePathname';

const ShareCreatedContent = ({ typeOfLink, title }) => {
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
                    <Icon icon={faTwitter} size="lg" />
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

ShareCreatedContent.propTypes = {
    /** What is the type of the content being shared? (e.g. resource, paper, review) */
    typeOfLink: PropTypes.string.isRequired,
    /** The title of the content being share (e.g. the paper title) */
    title: PropTypes.string,
};

export default ShareCreatedContent;
