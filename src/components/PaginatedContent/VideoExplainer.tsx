import { ReactNode, useState, type CSSProperties } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';

type VideoExplainerProps = {
    previewStyle?: CSSProperties;
    video: ReactNode;
};

const VideoExplainer = ({ previewStyle = {}, video }: VideoExplainerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                color="link"
                className="p-0 d-flex align-items-center text-secondary"
                style={{ marginTop: -6, marginBottom: -6 }}
                onClick={() => setIsOpen(true)}
            >
                <span
                    className="border border-secondary d-flex justify-content-center align-items-center flex-column me-2 rounded"
                    style={previewStyle}
                >
                    <FontAwesomeIcon icon={faPlayCircle} className="shadow" style={{ fontSize: '120%' }} />
                </span>
            </Button>

            <Modal isOpen={isOpen} toggle={() => setIsOpen((v) => !v)} size="lg">
                <ModalHeader toggle={() => setIsOpen((v) => !v)}>Video explainer</ModalHeader>
                <ModalBody>
                    <div className="ratio ratio-16x9">{video}</div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default VideoExplainer;
