import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import Tippy from '@tippyjs/react';

const PlayButton = styled(Button)`
    font-size: 0.9rem !important;
    color: inherit !important;
    text-decoration: none !important;
    transition: opacity 0.2s !important;
    text-align: center !important;

    &:hover {
        opacity: 0.7;
    }

    svg {
        font-size: 65px !important;
        line-height: normal;
        margin-left: 3px;
    }
`;

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

export default class Video extends Component {
    state = {
        showDialog: false
    };

    toggleDialog = type => {
        this.setState(prevState => ({
            showDialog: !prevState.showDialog
        }));
    };

    render() {
        return (
            <div>
                <PlayButton color="link" className="p-0 m-0" onClick={this.toggleDialog}>
                    <Tippy content="Play introduction video" offset={[0, 50]}>
                        <span>
                            <Icon icon={faPlayCircle} />
                        </span>
                    </Tippy>
                </PlayButton>

                <Modal isOpen={this.state.showDialog} toggle={this.toggleDialog} size="lg">
                    <ModalHeader toggle={this.toggleDialog}>ORKG introduction video</ModalHeader>
                    <ModalBody>
                        <VideoContainer>
                            <IframeFullWidth
                                title="Explanation and introduction video of the ORKG"
                                scrolling="no"
                                frameBorder="0"
                                src="//av.tib.eu/player/16120"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen={true}
                            />
                        </VideoContainer>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
