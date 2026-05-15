import { Button, Modal } from '@heroui/react';
import { FC } from 'react';

type ShouldPublishModalProps = { toggle: () => void; openPublishModal: () => void };

const ShouldPublishModal: FC<ShouldPublishModalProps> = ({ toggle, openPublishModal }) => (
    <Modal.Backdrop
        isOpen
        onOpenChange={(open) => {
            if (!open) toggle();
        }}
    >
        <Modal.Container>
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.CloseTrigger />
                    <Modal.Heading>Publish article</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-6">Do you want to publish a new version of this article?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onPress={toggle}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onPress={() => {
                            toggle();
                            openPublishModal();
                        }}
                    >
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default ShouldPublishModal;
