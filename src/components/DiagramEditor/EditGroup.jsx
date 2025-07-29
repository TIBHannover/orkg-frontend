import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Button from '@/components/Ui/Button/Button';

function EditGroup({ isEditGroupModalOpen, setIsEditGroupModalOpen, saveGroup, addGroup, currentGroup }) {
    const [value, setValue] = useState(!currentGroup?.id ? '' : currentGroup.data.label);

    useEffect(() => {
        setValue(!currentGroup?.id ? '' : currentGroup.data.label);
    }, [currentGroup]);

    return (
        <Modal isOpen={isEditGroupModalOpen} toggle={setIsEditGroupModalOpen}>
            <ModalHeader toggle={setIsEditGroupModalOpen}>{!currentGroup?.id ? 'Add' : 'Edit'} group</ModalHeader>
            <ModalBody>
                {!currentGroup?.id && "Enter an group label in the input below and click the 'Add group' button."}
                <div className="mt-2">
                    <Input value={value} onChange={(event) => setValue(event.target.value)} />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => (!currentGroup?.id ? addGroup(value) : saveGroup(value))}>
                    {!currentGroup?.id ? 'Add group' : 'Save'}
                </Button>
                <Button color="secondary" onClick={setIsEditGroupModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

EditGroup.propTypes = {
    isEditGroupModalOpen: PropTypes.bool.isRequired,
    setIsEditGroupModalOpen: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    saveGroup: PropTypes.func.isRequired,
    currentGroup: PropTypes.object,
};
export default EditGroup;
