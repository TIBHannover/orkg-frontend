import { FC } from 'react';
import { Badge, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

type HelpModalProps = {
    isHelpModalOpen: boolean;
    setIsHelpModalOpen: () => void;
};

const HelpModal: FC<HelpModalProps> = ({ isHelpModalOpen, setIsHelpModalOpen }) => {
    return (
        <Modal isOpen={isHelpModalOpen} toggle={setIsHelpModalOpen}>
            <ModalHeader toggle={setIsHelpModalOpen}>ORKG Diagram</ModalHeader>
            <ModalBody>
                This is a basic editor that uses ORKG entities to create a diagram.
                <br />
                <br />
                <h5>How to?</h5>
                <br />
                <ul>
                    <li>
                        <b>Add a node:</b> Use mouse{' '}
                        <Badge color="light" pill>
                            Right-click
                        </Badge>{' '}
                        on the canvas to open the context menu, and add a new node.
                    </li>
                    <li>
                        <b>Add a group:</b> Use the{' '}
                        <Badge color="light" pill>
                            Shift key
                        </Badge>{' '}
                        and{' '}
                        <Badge color="light" pill>
                            Drag Select
                        </Badge>{' '}
                        on the canvas to make a selection of nodes and mouse{' '}
                        <Badge color="light" pill>
                            Right-click
                        </Badge>{' '}
                        on the highlighted selection of nodes to create a group.
                    </li>
                    <li>
                        <b>Edit or delete a node/edge:</b> Use mouse{' '}
                        <Badge color="light" pill>
                            Right-click
                        </Badge>{' '}
                        on the nodes or edges to open the context menu to edit or delete nodes/edges.
                    </li>
                    <li>
                        <b>Add an edge:</b> To connect two nodes with each other with an edge, you can use the bottom point of a node as a{' '}
                        <i>source</i> and the top point of a node as a <i>target</i>. use{' '}
                        <Badge color="light" pill>
                            Drag Select
                        </Badge>{' '}
                        mouse movement to create edges.
                    </li>
                </ul>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={setIsHelpModalOpen}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default HelpModal;
