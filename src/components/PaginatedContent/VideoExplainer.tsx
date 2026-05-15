import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { type CSSProperties, ReactNode, useState } from 'react';

type VideoExplainerProps = {
    previewStyle?: CSSProperties;
    video: ReactNode;
};

const VideoExplainer = ({ previewStyle = {}, video }: VideoExplainerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                className="p-0 flex items-center text-secondary"
                style={{ marginTop: -6, marginBottom: -6 }}
                onPress={() => setIsOpen(true)}
            >
                <span className="border border-secondary flex justify-center items-center flex-col mr-2 rounded" style={previewStyle}>
                    <FontAwesomeIcon icon={faPlayCircle} className="shadow" style={{ fontSize: '120%' }} />
                </span>
            </Button>
            <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && setIsOpen(false)} isDismissable>
                <Modal.Container size="lg">
                    <Modal.Dialog className="max-w-3xl">
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Video explainer</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="flex items-center justify-center">{video}</Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
};

export default VideoExplainer;
