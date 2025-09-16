import { Edge } from '@xyflow/react';
import capitalize from 'capitalize';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { ENTITIES } from '@/constants/graphSettings';
import { EntityType, Predicate } from '@/services/backend/types';

const StyledEntitySelector = styled.div`
    select {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
    }
`;

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
        setValue(!edge?.id ? undefined : { label: edge.data?.label, id: edge.data?.id });
    }, [edge]);

    return (
        <Modal isOpen={isEditEdgeModalOpen} toggle={setIsEditEdgeModalOpen}>
            <ModalHeader toggle={setIsEditEdgeModalOpen}>{!edge?.id ? 'Add' : 'Edit'} edge</ModalHeader>
            <ModalBody>
                {!edge?.id && 'Enter an ORKG property in the input below and click the "Add edge" button.'}
                <div className="mt-2">
                    <InputGroup>
                        <StyledEntitySelector className="col-4 m-0 p-0">
                            <Input
                                name="select"
                                type="select"
                                value={selectedEntity}
                                onChange={(e) => {
                                    setSelectedEntity(e.target.value as EntityType);
                                    setValue(undefined);
                                }}
                            >
                                {Object.keys(ENTITIES)
                                    .filter((e) => ![ENTITIES.CLASS, ENTITIES.LITERAL].includes(ENTITIES[e]))
                                    .map((e) => (
                                        <option key={ENTITIES[e]} value={ENTITIES[e]}>
                                            {capitalize(ENTITIES[e])}
                                        </option>
                                    ))}
                            </Input>
                        </StyledEntitySelector>
                        <Autocomplete
                            entityType={selectedEntity}
                            placeholder={`Select or type to enter a ${selectedEntity}`}
                            allowCreate
                            onChange={(item, { action }) => {
                                if (action === 'select-option') {
                                    setValue({ ...item, _class: selectedEntity, linked: true, value: item?.label });
                                } else if (action === 'create-option' && item) {
                                    setValue({ id: item.label, label: item.label, value: item.label, _class: selectedEntity, linked: false });
                                }
                            }}
                            value={value as OptionType | undefined}
                            enableExternalSources={false}
                            key={selectedEntity}
                            inputId={`selectEdge${selectedEntity}`}
                        />
                    </InputGroup>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => (!edge?.id ? addEdge(value) : saveEdge(value))}
                    disabled={!!value?.id && edge?.data?.id === value?.id}
                >
                    {!edge?.id ? 'Add edge' : 'Save'}
                </Button>
                <Button color="secondary" onClick={setIsEditEdgeModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditEdge;
