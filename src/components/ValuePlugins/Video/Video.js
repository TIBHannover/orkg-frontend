import { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import REGEX from 'constants/regex';
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
class Video extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showVideoDialog: false
        };
    }

    toggleVideoDialog = () => {
        this.setState(prevState => ({
            showVideoDialog: !prevState.showVideoDialog
        }));
    };

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (
            this.props.type === 'literal' &&
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
            if (!this.props.options.inModal) {
                return (
                    <VideoContainer>
                        <IframeFullWidth title="Video" scrolling="no" src={`${providerUrl}${videoId}`} allowFullScreen />
                    </VideoContainer>
                );
            } else {
                return (
                    <>
                        <span
                            className="btn-link"
                            onClick={this.toggleVideoDialog}
                            style={{ cursor: 'pointer' }}
                            onKeyDown={e => (e.keyCode === 13 ? this.toggleVideoDialog : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            {labelToText} <Icon icon={faVideo} />
                        </span>
                        <Modal isOpen={this.state.showVideoDialog} toggle={this.toggleVideoDialog} size="lg">
                            <ModalHeader toggle={this.toggleVideoDialog}>Video Preview</ModalHeader>
                            <ModalBody>
                                <VideoContainer>
                                    <IframeFullWidth title="Video" scrolling="no" src={`${providerUrl}${videoId}`} allowFullScreen />
                                </VideoContainer>
                            </ModalBody>
                        </Modal>
                    </>
                );
            }
        } else {
            return label;
        }
    }
}

Video.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    options: PropTypes.object.isRequired
};

Video.defaultProps = {
    options: { inModal: false }
};

export default Video;
