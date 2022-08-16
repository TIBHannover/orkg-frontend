import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

function EditNode({ isAddNodeModalOpen, setIsAddNodeModalOpen, addNode, node }) {
    const [value, setValue] = useState(null);

    return (
        <Modal isOpen={isAddNodeModalOpen} toggle={setIsAddNodeModalOpen}>
            <ModalHeader toggle={setIsAddNodeModalOpen}>Add node</ModalHeader>
            <ModalBody>
                Enter an ORKG resource in the input below and click the "Add node" button.
                <div className="mt-2">
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        placeholder="Select or type to enter a resource"
                        allowCreate={true}
                        inputGroup={false}
                        onItemSelected={item => {
                            setValue(item);
                        }}
                        inputId="selectNode"
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => addNode(value)}>
                    Add node
                </Button>
                <Button color="secondary" onClick={setIsAddNodeModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

EditNode.propTypes = {
    isAddNodeModalOpen: PropTypes.bool.isRequired,
    setIsAddNodeModalOpen: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    node: PropTypes.object,
};
export default EditNode;
