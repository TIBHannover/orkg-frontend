import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

function EditEdge({ isEditEdgeModalOpen, setIsEditEdgeModalOpen, saveEdge, addEdge, edge }) {
    const [value, setValue] = useState(!edge?.id ? null : { label: edge.data?.label, id: edge.data?.id });

    useEffect(() => {
        setValue(!edge?.id ? null : { label: edge.data?.label, id: edge.data?.id });
    }, [edge]);

    return (
        <Modal isOpen={isEditEdgeModalOpen} toggle={setIsEditEdgeModalOpen}>
            <ModalHeader toggle={setIsEditEdgeModalOpen}>{!edge?.id ? 'Add' : 'Edit'} edge</ModalHeader>
            <ModalBody>
                {!edge?.id && 'Enter an ORKG property in the input below and click the "Add edge" button.'}
                <div className="mt-2">
                    <Autocomplete
                        entityType={ENTITIES.PREDICATE}
                        placeholder="Select or type to enter a predicate"
                        allowCreate={true}
                        inputGroup={false}
                        onItemSelected={item => {
                            setValue({ ...item, label: item.value });
                        }}
                        value={value}
                        inputId="selectEdge"
                    />
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
