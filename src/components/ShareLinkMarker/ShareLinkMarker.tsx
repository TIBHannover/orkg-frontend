import { faFacebook, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { getFacebookSharerLink, getLinkedInSharerLink, getTwitterSharerLink } from '@/components/ShareLinkMarker/helpers';
import Button from '@/components/Ui/Button/Button';

export const ShareSideBox = styled.div`
    position: absolute;
    right: -60px;
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
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('Link copied to clipboard');
        }
    }, [state.value]);

    const pathname = usePathname();
    const shareUrl = `${window.location.protocol}//${window.location.host}${pathname}`;

    return (
        <ShareSideBox className="pt-2 ps-0 pe-0 pb-2">
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
                    <Button color="link" onClick={() => copyToClipboard(shareUrl)}>
                        <FontAwesomeIcon icon={faLink} />
                    </Button>
                </span>
            </Tooltip>
        </ShareSideBox>
    );
};

export default ShareLinkMarker;
