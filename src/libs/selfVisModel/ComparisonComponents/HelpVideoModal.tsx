import { Modal } from '@heroui/react';

type HelpVideoModalProps = {
    showDialog: boolean;
    toggle: () => void;
};

const HelpVideoModal = ({ showDialog, toggle }: HelpVideoModalProps) => {
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen={showDialog} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-4xl">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Comparison visualization instruction video</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        <div className="aspect-video">
                            <iframe
                                className="h-full w-full"
                                title="Video explaining how to make a comparison visualization"
                                scrolling="no"
                                frameBorder="0"
                                src="//av.tib.eu/player/52057"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default HelpVideoModal;
