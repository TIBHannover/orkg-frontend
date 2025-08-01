import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import styled from 'styled-components';

import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

const PlayButton = styled(Button)`
    color: inherit !important;
    text-decoration: underline;
    transition: opacity 0.2s !important;
    font-size: inherit !important;

    &:hover {
        opacity: 0.7;
    }
`;

const Video = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <PlayButton color="link" className="p-0 m-0 d-inline" onClick={() => setIsOpen(true)}>
                <FontAwesomeIcon icon={faPlayCircle} /> Play video
            </PlayButton>

            <Modal isOpen={isOpen} toggle={() => setIsOpen((v) => !v)} size="lg">
                <ModalHeader toggle={() => setIsOpen((v) => !v)}>ORKG introduction video</ModalHeader>
                <ModalBody>
                    <div className="ratio ratio-16x9">
                        <iframe
                            title="Explanation and introduction video of the ORKG"
                            scrolling="no"
                            frameBorder="0"
                            src="//av.tib.eu/player/16120"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default Video;
