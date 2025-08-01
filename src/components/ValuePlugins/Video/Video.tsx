import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import styled from 'styled-components';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import REGEX from '@/constants/regex';

const VideoContainer = styled.div`
    position: relative;
`;

const IframeFullWidth = styled.iframe`
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
`;

// Plugin for video previews of TIB AV portal, Youtube, Dailymotion and Vimeo

type ValuePluginsProps = {
    text: string;
    options?: { isModal?: boolean };
};

export const isVideoValue = (text: string) =>
    text.match(new RegExp(REGEX.TIB_URL)) ||
    text.match(new RegExp(REGEX.YOUTUBE_URL)) ||
    text.match(new RegExp(REGEX.DAILYMOTION_URL)) ||
    text.match(new RegExp(REGEX.VIMEO_URL));

const Video: FC<ValuePluginsProps> = ({ text, options = { inModal: false } }) => {
    const [showVideoDialog, setShowVideoDialog] = useState(false);

    if (isVideoValue(text)) {
        const videoId = text
            .replace(new RegExp(REGEX.TIB_URL), '')
            .replace(new RegExp(REGEX.YOUTUBE_URL), '')
            .replace(new RegExp(REGEX.DAILYMOTION_URL), '')
            .replace(new RegExp(REGEX.VIMEO_URL), '');

        let providerUrl = '';
        if (text.match(new RegExp(REGEX.TIB_URL))) {
            providerUrl = '//av.tib.eu/player/';
        } else if (text.match(new RegExp(REGEX.YOUTUBE_URL))) {
            providerUrl = 'https://www.youtube.com/embed/';
        } else if (text.match(new RegExp(REGEX.DAILYMOTION_URL))) {
            providerUrl = 'https://www.dailymotion.com/embed/video/';
        } else if (text.match(new RegExp(REGEX.VIMEO_URL))) {
            providerUrl = 'https://player.vimeo.com/video/';
        }
        if (!('inModal' in options) || ('inModal' in options && !options.inModal)) {
            return (
                <VideoContainer>
                    <IframeFullWidth title="Video" scrolling="no" src={`${providerUrl}${videoId}`} allowFullScreen />
                </VideoContainer>
            );
        }

        return (
            <>
                <span
                    className="btn-link"
                    onClick={() => setShowVideoDialog(true)}
                    style={{ cursor: 'pointer' }}
                    onKeyDown={(e) => (e.keyCode === 13 ? setShowVideoDialog(true) : undefined)}
                    role="button"
                    tabIndex={0}
                >
                    {text} <FontAwesomeIcon icon={faVideo} />
                </span>
                <Modal isOpen={showVideoDialog} toggle={() => setShowVideoDialog((v) => !v)} size="lg">
                    <ModalHeader toggle={() => setShowVideoDialog((v) => !v)}>Video Preview</ModalHeader>
                    <ModalBody>
                        <VideoContainer>
                            <IframeFullWidth title="Video" scrolling="no" src={`${providerUrl}${videoId}`} allowFullScreen />
                        </VideoContainer>
                    </ModalBody>
                </Modal>
            </>
        );
    }
    return text;
};

export default Video;
