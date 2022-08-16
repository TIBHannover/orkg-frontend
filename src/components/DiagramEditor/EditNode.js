import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

function EditNode({ isAddNodeModalOpen, setIsAddNodeModalOpen, saveNode, addNode, node }) {
    const [value, setValue] = useState(!node ? null : { label: node.data.label, id: node.data.id });

    useEffect(() => {
        setValue(!node ? null : { label: node.data.label, id: node.data.id });
    }, [node]);

    return (
        <Modal isOpen={isAddNodeModalOpen} toggle={setIsAddNodeModalOpen}>
            <ModalHeader toggle={setIsAddNodeModalOpen}>{!node ? 'Add' : 'Edit'} node</ModalHeader>
            <ModalBody>
                {!node && 'Enter an ORKG resource in the input below and click the "Add node" button.'}
                <div className="mt-2">
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        placeholder="Select or type to enter a resource"
                        allowCreate={true}
                        inputGroup={false}
                        onItemSelected={item => {
                            setValue({ ...item, label: item.value });
                        }}
                        value={value}
                        inputId="selectNode"
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => (!node ? addNode(value) : saveNode(value))} disabled={!value || node?.data.id === value.id}>
                    {!node ? 'Add node' : 'Save'}
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
    saveNode: PropTypes.func.isRequired,
    node: PropTypes.object,
};
export default EditNode;
