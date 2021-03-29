import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export const ShareSideBox = styled.div`
    position: absolute;
    right: -40px;
    z-index: 20;
    background-color: #fff;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 0px 8px 0px rgba(0, 0, 0, 0.13);
    align-items: center;
    justify-content: center;
`;

const ShareLinkMarker = () => {
    return (
        <ShareSideBox className="pt-2 pl-2 pr-2 pb-2">
            <small className="text-muted">Share</small>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.protocol}//${window.location.host}${window.location.pathname}`}
                target="_blank"
                className="text-secondary"
                title="Share this paper on Facebook"
                rel="noopener noreferrer"
            >
                <Icon icon={faFacebook} />
            </a>
            <a
                href={`https://twitter.com/share?url=${window.location.protocol}//${window.location.host}${window.location.pathname}&via=orkg_org`}
                target="_blank"
                className="text-secondary"
                title="Share this paper on Twitter"
                rel="noopener noreferrer"
            >
                <Icon icon={faTwitter} />
            </a>
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.protocol}//${window.location.host}${window.location.pathname}&via=orkg_org`}
                target="_blank"
                className="text-secondary"
                title="Share this paper on Linkedin"
                rel="noopener noreferrer"
            >
                <Icon icon={faLinkedin} />
            </a>
            <a
                href={`${window.location.protocol}//${window.location.host}${window.location.pathname}`}
                target="_blank"
                className="text-secondary"
                title="Copy to clipboard"
                rel="noopener noreferrer"
            >
                <Icon icon={faLink} />
            </a>
        </ShareSideBox>
    );
};
ShareLinkMarker.propTypes = {};

export default ShareLinkMarker;
