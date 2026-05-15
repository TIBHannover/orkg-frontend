import { Modal } from '@heroui/react';
import { FC } from 'react';

type RelatedFigureModalProps = {
    toggle: () => void;
    src: string;
    title?: string;
    description?: string;
};

const RelatedFigureModal: FC<RelatedFigureModalProps> = ({ toggle, src, title, description }) => {
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="!max-w-fit w-fit">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Related image {title ? ` - ${title}` : null}</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={title} className="max-w-full h-auto" />
                        <p className="mt-2">{description}</p>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default RelatedFigureModal;
