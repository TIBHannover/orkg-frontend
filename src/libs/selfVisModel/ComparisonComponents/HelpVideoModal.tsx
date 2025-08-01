import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type HelpVideoModalProps = {
    showDialog: boolean;
    toggle: () => void;
};

const HelpVideoModal = ({ showDialog, toggle }: HelpVideoModalProps) => {
    return (
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Comparison visualization instruction video</ModalHeader>
            <ModalBody>
                <div className="ratio ratio-16x9">
                    <iframe
                        title="Video explaining how to make a comparison visualization"
                        scrolling="no"
                        frameBorder="0"
                        src="//av.tib.eu/player/52057"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </ModalBody>
        </Modal>
    );
};

export default HelpVideoModal;
