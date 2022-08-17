import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

function EditNode({ isEditNodeModalOpen, setIsEditNodeModalOpen, saveNode, addNode, node }) {
    const [value, setValue] = useState(!node ? null : { label: node.data.label, id: node.data.id });

    useEffect(() => {
        if (node) {
            setValue({ label: node.data.label, id: node.data.id });
        }
    }, [node]);

    return (
        <Modal onClosed={() => setValue(null)} isOpen={isEditNodeModalOpen} toggle={setIsEditNodeModalOpen}>
            <ModalHeader toggle={setIsEditNodeModalOpen}>{!node ? 'Add' : 'Edit'} node</ModalHeader>
            <ModalBody>
                {!node && 'Enter an ORKG resource in the input below and click the "Add node" button.'}
                <div className="mt-2">
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        placeholder="Select or type to enter a resource"
                        allowCreate={true}
                        inputGroup={false}
                        onItemSelected={i => {
                            setValue({ ...i, label: i.value });
                        }}
                        onNewItemSelected={item => {
                            setValue({ id: item, label: item, value: item });
                        }}
                        value={value}
                        ols={false}
                        inputId="selectNode"
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => (!node ? addNode(value) : saveNode(value))} disabled={!value || node?.data.id === value.id}>
                    {!node ? 'Add node' : 'Save'}
                </Button>
                <Button color="secondary" onClick={setIsEditNodeModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

EditNode.propTypes = {
    isEditNodeModalOpen: PropTypes.bool.isRequired,
    setIsEditNodeModalOpen: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    saveNode: PropTypes.func.isRequired,
    node: PropTypes.object,
};
export default EditNode;
