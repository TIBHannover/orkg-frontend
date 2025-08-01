import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { ENTITIES } from '@/constants/graphSettings';

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
                        allowCreate
                        onChange={(item, { action }) => {
                            if (action === 'select-option') {
                                setValue({ ...item, _class: ENTITIES.RESOURCE, linked: true, value: item.label });
                            } else if (action === 'create-option' && item) {
                                setValue({ id: item.label, label: item.label, value: item.label, _class: ENTITIES.RESOURCE, linked: false });
                            }
                        }}
                        value={value}
                        enableExternalSources={false}
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
