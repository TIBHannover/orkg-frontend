import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, InputGroup } from 'reactstrap';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import capitalize from 'capitalize';
import styled from 'styled-components';

const StyledEntitySelector = styled.div`
    select {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
    }
`;

function EditEdge({ isEditEdgeModalOpen, setIsEditEdgeModalOpen, saveEdge, addEdge, edge }) {
    const [value, setValue] = useState(!edge?.id ? null : { label: edge.data?.label, id: edge.data?.id });
    const [selectedEntity, setSelectedEntity] = useState(ENTITIES.PREDICATE);

    useEffect(() => {
        setValue(!edge?.id ? null : { label: edge.data?.label, id: edge.data?.id });
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
                                onChange={e => {
                                    setSelectedEntity(e.target.value);
                                    setValue(null);
                                }}
                            >
                                {Object.keys(ENTITIES)
                                    .filter(e => ![ENTITIES.CLASS, ENTITIES.LITERAL].includes(ENTITIES[e]))
                                    .map((e, index) => (
                                        <option key={index} value={ENTITIES[e]}>
                                            {capitalize(ENTITIES[e])}
                                        </option>
                                    ))}
                            </Input>
                        </StyledEntitySelector>
                        <Autocomplete
                            entityType={selectedEntity}
                            placeholder={`Select or type to enter a ${selectedEntity}`}
                            allowCreate={true}
                            inputGroup={false}
                            onItemSelected={item => {
                                setValue({ ...item, label: item.value, _class: selectedEntity, linked: true });
                            }}
                            onNewItemSelected={item => {
                                setValue({ id: item, label: item, value: item, _class: selectedEntity, linked: false });
                            }}
                            value={value}
                            ols={false}
                            autoLoadOption={true}
                            cacheOptions={false}
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
                    disabled={value?.id && edge?.data?.id === value?.id}
                >
                    {!edge?.id ? 'Add edge' : 'Save'}
                </Button>
                <Button color="secondary" onClick={setIsEditEdgeModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

EditEdge.propTypes = {
    isEditEdgeModalOpen: PropTypes.bool.isRequired,
    setIsEditEdgeModalOpen: PropTypes.func.isRequired,
    addEdge: PropTypes.func.isRequired,
    saveEdge: PropTypes.func.isRequired,
    edge: PropTypes.object,
};
export default EditEdge;
