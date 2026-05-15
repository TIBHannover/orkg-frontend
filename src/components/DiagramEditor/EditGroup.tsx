import { Button, Input, Modal, TextField } from '@heroui/react';
import { Node } from '@xyflow/react';
import { FC, useEffect, useState } from 'react';

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(!currentGroup?.id ? '' : currentGroup.data.label);
    }, [currentGroup]);

    return (
        <Modal.Backdrop
            isOpen={isEditGroupModalOpen}
            onOpenChange={(open) => {
                if (!open) setIsEditGroupModalOpen();
            }}
        >
            <Modal.Container size="md">
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{!currentGroup?.id ? 'Add' : 'Edit'} group</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-1 space-y-2">
                            {!currentGroup?.id && <p>Enter a group label in the input below and click the &apos;Add group&apos; button.</p>}
                            <TextField value={value} onChange={setValue} className="w-full">
                                <Input autoFocus aria-label="Group label" />
                            </TextField>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onPress={() => (!currentGroup?.id ? addGroup(value) : saveGroup(value))}>
                            {!currentGroup?.id ? 'Add group' : 'Save'}
                        </Button>
                        <Button variant="secondary" onPress={setIsEditGroupModalOpen}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditGroup;
