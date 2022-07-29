import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Tippy, { useSingleton } from '@tippyjs/react';
import PropTypes from 'prop-types';
import { getFacebookSharerLink, getTwitterSharerLink, getLinkedInSharerLink } from './helpers';

const ShareCreatedContent = ({ typeOfLink, title }) => {
    const [source, target] = useSingleton();
    return (
        <div className="mb-2">
            <Tippy placement="bottom" singleton={source} delay={500} />
            <div className="mb-3 mt-2">Share: </div>
            <Tippy singleton={target} content={`Share this ${typeOfLink || 'page'} on Facebook`}>
                <a href={getFacebookSharerLink()} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <Icon icon={faFacebook} size="lg" />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Twitter`}>
                <a href={getTwitterSharerLink(title)} target="_blank" className="text-secondary  me-2" rel="noopener noreferrer">
                    <Icon icon={faTwitter} size="lg" />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Linkedin`}>
                <a href={getLinkedInSharerLink()} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <Icon icon={faLinkedin} size="lg" />
                </a>
            </Tippy>
        </div>
    );
};

ShareCreatedContent.propTypes = { typeOfLink: PropTypes.string.isRequired, title: PropTypes.string };

export default ShareCreatedContent;
