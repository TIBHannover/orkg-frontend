import { Button, Kbd, Modal } from '@heroui/react';
import { FC } from 'react';

type HelpModalProps = {
    isHelpModalOpen: boolean;
    setIsHelpModalOpen: () => void;
};

const HelpModal: FC<HelpModalProps> = ({ isHelpModalOpen, setIsHelpModalOpen }) => (
    <Modal.Backdrop
        isOpen={isHelpModalOpen}
        onOpenChange={(open) => {
            if (!open) setIsHelpModalOpen();
        }}
    >
        <Modal.Container size="md">
            <Modal.Dialog className="sm:max-w-lg">
                <Modal.CloseTrigger />
                <Modal.Header>
                    <Modal.Heading>ORKG Diagram</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                    <p>This is a basic editor that uses ORKG entities to create a diagram.</p>
                    <h5 className="mt-4 mb-2 text-base font-semibold">How to?</h5>
                    <ul className="list-disc ps-5 space-y-2">
                        <li>
                            <b>Add a node:</b> Use mouse{' '}
                            <Kbd>
                                <Kbd.Content>Right-click</Kbd.Content>
                            </Kbd>{' '}
                            on the canvas to open the context menu, and add a new node.
                        </li>
                        <li>
                            <b>Add a group:</b> Use the{' '}
                            <Kbd>
                                <Kbd.Abbr keyValue="shift" />
                            </Kbd>{' '}
                            and{' '}
                            <Kbd>
                                <Kbd.Content>Drag Select</Kbd.Content>
                            </Kbd>{' '}
                            on the canvas to make a selection of nodes and mouse{' '}
                            <Kbd>
                                <Kbd.Content>Right-click</Kbd.Content>
                            </Kbd>{' '}
                            on the highlighted selection of nodes to create a group.
                        </li>
                        <li>
                            <b>Edit or delete a node/edge:</b> Use mouse{' '}
                            <Kbd>
                                <Kbd.Content>Right-click</Kbd.Content>
                            </Kbd>{' '}
                            on the nodes or edges to open the context menu to edit or delete nodes/edges.
                        </li>
                        <li>
                            <b>Add an edge:</b> To connect two nodes with each other with an edge, you can use the bottom point of a node as a{' '}
                            <i>source</i> and the top point of a node as a <i>target</i>. Use{' '}
                            <Kbd>
                                <Kbd.Content>Drag Select</Kbd.Content>
                            </Kbd>{' '}
                            mouse movement to create edges.
                        </li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onPress={setIsHelpModalOpen}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default HelpModal;
