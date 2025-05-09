import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { CLASSES, ENTITIES, MISC } from '@/constants/graphSettings';
import { addResourceToObservatory } from '@/services/backend/resources';

const AddResearchProblem = (props) => {
    const [problem, setProblem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        if (problem && problem.id) {
            setIsSaving(true);
            addResourceToObservatory({ observatory_id: props.id, organization_id: MISC.UNKNOWN_ID, id: problem.id })
                .then((a) => {
                    toast.success('Research problem added successfully');
                    setIsSaving(false);
                    props.setProblems((v) => [problem, ...v]);
                    props.setTotalElements((t) => t + 1);
                    props.toggle();
                    setProblem(null);
                })
                .catch((error) => {
                    setIsSaving(false);
                    console.error(error);
                    toast.error(`Error updating an observatory ${error.message}`);
                });
        } else {
            toast.error('Please select a research problem');
        }
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Add research problem</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="ResearchProblem">Research problem</Label>
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.PROBLEM]}
                        placeholder="Select a research problem"
                        onChange={(value, { action }) => {
                            if (action === 'select-option') {
                                setProblem(value);
                            }
                        }}
                        value={problem}
                        enableExternalSources={false}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <ButtonWithLoading color="primary" isLoading={isSaving} onClick={handleSubmit}>
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalFooter>
        </Modal>
    );
};

AddResearchProblem.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    setProblems: PropTypes.func.isRequired,
    setTotalElements: PropTypes.func.isRequired,
};

export default AddResearchProblem;
