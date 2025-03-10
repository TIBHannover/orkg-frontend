import { faFacebook, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import { getFacebookSharerLink, getLinkedInSharerLink, getTwitterSharerLink } from 'components/ShareLinkMarker/helpers';
import { usePathname } from 'next/navigation';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import styled from 'styled-components';

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

const ShareLinkMarker = ({ typeOfLink, title }: { typeOfLink: string; title: string }) => {
    const pathname = usePathname();
    const shareUrl = `${window.location.protocol}//${window.location.host}${pathname}`;

    return (
        <ShareSideBox className="pt-2 ps-2 pe-2 pb-2">
            <div className="text-muted mb-1">
                <small>Share</small>
            </div>
            <Tooltip placement="left" content={`Share this ${typeOfLink || 'page'} on Facebook`}>
                <a href={getFacebookSharerLink({ shareUrl })} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFacebook} />
                </a>
            </Tooltip>
            <Tooltip placement="left" content={`Share this  ${typeOfLink || 'page'} on Twitter`}>
                <a href={getTwitterSharerLink({ shareUrl, title })} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faXTwitter} />
                </a>
            </Tooltip>
            <Tooltip placement="left" content={`Share this  ${typeOfLink || 'page'} on Linkedin`}>
                <a href={getLinkedInSharerLink({ shareUrl })} target="_blank" className="text-secondary" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faLinkedin} />
                </a>
            </Tooltip>
            <Tooltip placement="left" content="Copy link to clipboard">
                <span>
                    <CopyToClipboard
                        text={shareUrl}
                        // @ts-expect-error
                        target="_blank"
                        className="text-secondary p-0"
                        onCopy={() => {
                            toast.dismiss();
                            toast.success('Link copied');
                        }}
                    >
                        <Button color="link">
                            <FontAwesomeIcon icon={faLink} />
                        </Button>
                    </CopyToClipboard>
                </span>
            </Tooltip>
        </ShareSideBox>
    );
};

export default ShareLinkMarker;
