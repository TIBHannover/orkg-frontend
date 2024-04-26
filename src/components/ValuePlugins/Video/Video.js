import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

const VideoContainer = styled.div`
    position: relative;
    padding-top: 56.25%;
`;

const IframeFullWidth = styled.iframe`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
`;

// Plugin for video previews of TIB AV portal, Youtube, Dailymotion and Vimeo

const Video = ({ children, type, options = { inModal: false } }) => {
    const [showVideoDialog, setShowVideoDialog] = useState(false);

    const label = children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (
        type === 'literal' &&
        (labelToText.match(new RegExp(REGEX.TIB_URL)) ||
            labelToText.match(new RegExp(REGEX.YOUTUBE_URL)) ||
            labelToText.match(new RegExp(REGEX.DAILYMOTION_URL)) ||
            labelToText.match(new RegExp(REGEX.VIMEO_URL)))
    ) {
        const videoId = labelToText
            .replace(new RegExp(REGEX.TIB_URL), '')
            .replace(new RegExp(REGEX.YOUTUBE_URL), '')
            .replace(new RegExp(REGEX.DAILYMOTION_URL), '')
            .replace(new RegExp(REGEX.VIMEO_URL), '');

        let providerUrl = '';
        if (labelToText.match(new RegExp(REGEX.TIB_URL))) {
            providerUrl = '//av.tib.eu/player/';
        } else if (labelToText.match(new RegExp(REGEX.YOUTUBE_URL))) {
            providerUrl = 'https://www.youtube.com/embed/';
        } else if (labelToText.match(new RegExp(REGEX.DAILYMOTION_URL))) {
            providerUrl = 'https://www.dailymotion.com/embed/video/';
        } else if (labelToText.match(new RegExp(REGEX.VIMEO_URL))) {
            providerUrl = 'https://player.vimeo.com/video/';
        }
        if (!options.inModal) {
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
                    {labelToText} <Icon icon={faVideo} />
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
    return label;
};

Video.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
    options: PropTypes.object.isRequired,
};

export default Video;
