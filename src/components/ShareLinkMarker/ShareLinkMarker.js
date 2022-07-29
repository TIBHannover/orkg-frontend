import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import Tippy, { useSingleton } from '@tippyjs/react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { getFacebookSharerLink, getTwitterSharerLink, getLinkedInSharerLink } from './helpers';

export const ShareSideBox = styled.div`
    position: absolute;
    right: -45px;
    z-index: 20;
    background-color: #fff;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 0px 8px 0px rgba(0, 0, 0, 0.03);
    align-items: center;
    justify-content: center;

    @media (max-width: 650px) {
        display: none;
    }
`;

const ShareLinkMarker = ({ typeOfLink, title }) => {
    const [source, target] = useSingleton();
    return (
        <ShareSideBox className="pt-2 ps-2 pe-2 pb-2">
            <Tippy placement="left" singleton={source} delay={500} />
            <div className="text-muted mb-1">
                <small>Share</small>
            </div>
            <Tippy singleton={target} content={`Share this ${typeOfLink || 'page'} on Facebook`}>
                <a href={getFacebookSharerLink()} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <Icon icon={faFacebook} />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Twitter`}>
                <a href={getTwitterSharerLink(title)} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <Icon icon={faTwitter} />
                </a>
            </Tippy>
            <Tippy singleton={target} content={`Share this  ${typeOfLink || 'page'} on Linkedin`}>
                <a href={getLinkedInSharerLink()} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <Icon icon={faLinkedin} />
                </a>
            </Tippy>
            <Tippy singleton={target} content="Copy link to clipboard">
                <span>
                    <CopyToClipboard
                        text={`${window.location.protocol}//${window.location.host}${window.location.pathname}`}
                        target="_blank"
                        className="text-secondary p-0"
                        onCopy={() => {
                            toast.dismiss();
                            toast.success('Link copied');
                        }}
                    >
                        <Button color="link">
                            <Icon icon={faLink} />
                        </Button>
                    </CopyToClipboard>
                </span>
            </Tippy>
        </ShareSideBox>
    );
};

ShareLinkMarker.propTypes = { typeOfLink: PropTypes.string.isRequired, title: PropTypes.string };

export default ShareLinkMarker;
