import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

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

const Video = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <PlayButton color="link" className="p-0 m-0" onClick={() => setIsOpen(true)}>
                <Tippy content="Play introduction video" offset={[0, 50]}>
                    <span>
                        <Icon icon={faPlayCircle} />
                    </span>
                </Tippy>
            </PlayButton>

            <Modal isOpen={isOpen} toggle={() => setIsOpen(v => !v)} size="lg">
                <ModalHeader toggle={() => setIsOpen(v => !v)}>ORKG introduction video</ModalHeader>
                <ModalBody>
                    <div class="embed-responsive embed-responsive-16by9">
                        <iframe
                            title="Explanation and introduction video of the ORKG"
                            scrolling="no"
                            frameBorder="0"
                            src="//av.tib.eu/player/16120"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen={true}
                            class="embed-responsive-item"
                        />
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default Video;
