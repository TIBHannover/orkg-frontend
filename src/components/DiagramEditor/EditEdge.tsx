import { Button, Modal } from '@heroui/react';
import { Edge } from '@xyflow/react';
import capitalize from 'capitalize';
import { FC, useEffect, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { ENTITIES } from '@/constants/graphSettings';
import { EntityType, Predicate } from '@/services/backend/types';

type OptionTypeWithLinked = { linked?: boolean; value?: string; id?: string; label?: string; _class?: EntityType };

type EditEdgeProps = {
    isEditEdgeModalOpen: boolean;
    setIsEditEdgeModalOpen: () => void;
    saveEdge: (value: OptionTypeWithLinked | undefined) => void;
    addEdge: (value: OptionTypeWithLinked | undefined) => void;
    edge: Edge<Predicate> | undefined;
};

const EditEdge: FC<EditEdgeProps> = ({ isEditEdgeModalOpen, setIsEditEdgeModalOpen, saveEdge, addEdge, edge }) => {
    const [value, setValue] = useState<OptionTypeWithLinked | undefined>(!edge?.id ? undefined : { label: edge.data?.label, id: edge.data?.id });
    const [selectedEntity, setSelectedEntity] = useState<EntityType>(ENTITIES.PREDICATE);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(!edge?.id ? undefined : { label: edge.data?.label, id: edge.data?.id });
    }, [edge]);

    return (
        <Modal.Backdrop
            isOpen={isEditEdgeModalOpen}
            onOpenChange={(open) => {
                if (!open) setIsEditEdgeModalOpen();
            }}
        >
            <Modal.Container size="md">
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{!edge?.id ? 'Add' : 'Edit'} edge</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-1 space-y-2">
                            {!edge?.id && <p>Enter an ORKG property in the input below and click the &quot;Add edge&quot; button.</p>}
                            <div className="flex items-stretch">
                                <select
                                    aria-label="Entity type"
                                    className="w-4/12 shrink-0 rounded-s-[var(--radius)] rounded-e-none border border-default bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={selectedEntity}
                                    onChange={(e) => {
                                        setSelectedEntity(e.target.value as EntityType);
                                        setValue(undefined);
                                    }}
                                >
                                    {Object.keys(ENTITIES)
                                        // Exclude THING to avoid confusion. Users should select specific entity types for precise diagram connections.
                                        .filter((e) => ![ENTITIES.CLASS, ENTITIES.LITERAL, ENTITIES.THING].includes(ENTITIES[e]))
                                        .map((e) => (
                                            <option key={ENTITIES[e]} value={ENTITIES[e]}>
                                                {capitalize(ENTITIES[e])}
                                            </option>
                                        ))}
                                </select>
                                <div className="min-w-0 flex-1 -ms-px">
                                    <Autocomplete
                                        entityType={selectedEntity}
                                        placeholder={`Select or type to enter a ${selectedEntity}`}
                                        allowCreate
                                        onChange={(item, { action }) => {
                                            if (action === 'select-option') {
                                                setValue({ ...item, _class: selectedEntity, linked: true, value: item?.label });
                                            } else if (action === 'create-option' && item) {
                                                setValue({
                                                    id: item.label,
                                                    label: item.label,
                                                    value: item.label,
                                                    _class: selectedEntity,
                                                    linked: false,
                                                });
                                            }
                                        }}
                                        value={value as OptionType | undefined}
                                        enableExternalSources={false}
                                        key={selectedEntity}
                                        inputId={`selectEdge${selectedEntity}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            onPress={() => (!edge?.id ? addEdge(value) : saveEdge(value))}
                            isDisabled={!!value?.id && edge?.data?.id === value?.id}
                        >
                            {!edge?.id ? 'Add edge' : 'Save'}
                        </Button>
                        <Button variant="secondary" onPress={setIsEditEdgeModalOpen}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditEdge;
