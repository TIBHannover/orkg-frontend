import { Node } from '@xyflow/react';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { Resource } from '@/services/backend/types';

type EditGroupProps = {
    isEditGroupModalOpen: boolean;
    setIsEditGroupModalOpen: () => void;
    saveGroup: (value: string) => void;
    addGroup: (value: string) => void;
    currentGroup: Node<Resource> | undefined;
};
const EditGroup: FC<EditGroupProps> = ({ isEditGroupModalOpen, setIsEditGroupModalOpen, saveGroup, addGroup, currentGroup }) => {
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
};

export default EditGroup;
