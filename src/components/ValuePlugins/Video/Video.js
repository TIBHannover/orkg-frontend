import { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
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
        // eslint-disable-next-line no-useless-escape
        this.expressionTib = new RegExp(/^(https?:)?\/\/av\.tib\.eu(\/(media|player)?(\?.*)?)\//);
        this.expressionYoutube = new RegExp(/^(https?:)?\/\/(www.)?youtube\.com\/watch\?v=/);
        this.expressionDailymotion = new RegExp(/^(https?:)?\/\/(www.)?dailymotion\.com\/video\//);
        this.expressionVimeo = new RegExp(/^(https?:)?\/\/(www.)?vimeo\.com\//);
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
            (labelToText.match(this.expressionTib) ||
                labelToText.match(this.expressionYoutube) ||
                labelToText.match(this.expressionDailymotion) ||
                labelToText.match(this.expressionVimeo))
        ) {
            const videoId = labelToText
                .replace(this.expressionTib, '')
                .replace(this.expressionYoutube, '')
                .replace(this.expressionDailymotion, '')
                .replace(this.expressionVimeo, '');

            let providerUrl = '';
            if (labelToText.match(this.expressionTib)) {
                providerUrl = '//av.tib.eu/player/';
            } else if (labelToText.match(this.expressionYoutube)) {
                providerUrl = 'https://www.youtube.com/embed/';
            } else if (labelToText.match(this.expressionDailymotion)) {
                providerUrl = 'https://www.dailymotion.com/embed/video/';
            } else if (labelToText.match(this.expressionVimeo)) {
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
