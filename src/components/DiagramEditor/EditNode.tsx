import { Button, Modal } from '@heroui/react';
import { Node } from '@xyflow/react';
import { FC, useEffect, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setValue({ label: node.data.label, id: node.data.id });
        }
    }, [node]);

    return (
        <Modal.Backdrop
            isOpen={isEditNodeModalOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setValue(undefined);
                    setIsEditNodeModalOpen();
                }
            }}
        >
            <Modal.Container size="md">
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{!node ? 'Add' : 'Edit'} node</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-1 space-y-2">
                            {!node && <p>Enter an ORKG resource in the input below and click the &quot;Add node&quot; button.</p>}
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            onPress={() => (!node ? addNode(value) : saveNode(value))}
                            isDisabled={!value || node?.data.id === value.id}
                        >
                            {!node ? 'Add node' : 'Save'}
                        </Button>
                        <Button variant="secondary" onPress={setIsEditNodeModalOpen}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditNode;
