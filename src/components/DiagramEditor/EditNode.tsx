import { Node } from '@xyflow/react';
import { FC, useEffect, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { ENTITIES } from '@/constants/graphSettings';
import { EntityType, Resource } from '@/services/backend/types';

type OptionTypeWithLinked = { linked?: boolean; value?: string; id?: string; label?: string; _class?: EntityType };

type EditNodeProps = {
    isEditNodeModalOpen: boolean;
    setIsEditNodeModalOpen: () => void;
    saveNode: (value: OptionTypeWithLinked | undefined) => void;
    addNode: (value: OptionTypeWithLinked | undefined) => void;
    node: Node<Resource> | undefined;
};
const EditNode: FC<EditNodeProps> = ({ isEditNodeModalOpen, setIsEditNodeModalOpen, saveNode, addNode, node }) => {
    const [value, setValue] = useState<OptionTypeWithLinked | undefined>(!node ? undefined : { label: node.data.label, id: node.data.id });

    useEffect(() => {
        if (node) {
            setValue({ label: node.data.label, id: node.data.id });
        }
    }, [node]);

    return (
        <Modal onClosed={() => setValue(undefined)} isOpen={isEditNodeModalOpen} toggle={setIsEditNodeModalOpen}>
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
                                setValue({ ...item, _class: ENTITIES.RESOURCE, linked: true, value: item?.label });
                            } else if (action === 'create-option' && item) {
                                setValue({ id: item.label, label: item.label, value: item?.label, _class: ENTITIES.RESOURCE, linked: false });
                            }
                        }}
                        value={value as OptionType | undefined}
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
};

export default EditNode;
