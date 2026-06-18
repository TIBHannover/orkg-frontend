import { Button, Modal } from '@heroui/react';
import { FC } from 'react';

type ObservatoryModalProps = {
    isOpen: boolean;
    toggle: () => void;
};

const ObservatoryModal: FC<ObservatoryModalProps> = ({ isOpen, toggle }) => (
    <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
            if (!open) toggle();
        }}
        isDismissable
    >
        <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
            <Modal.Dialog className="sm:max-w-md">
                <Modal.Header>
                    <Modal.CloseTrigger />
                    <Modal.Heading>Editing not possible</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                    <p>You don't have sufficient rights to edit an observatory. Contact the observatory members to request any changes.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button slot="close">Close</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default ObservatoryModal;
