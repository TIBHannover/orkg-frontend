import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup } from 'reactstrap';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import PropTypes from 'prop-types';
import { CLASSES, ENTITIES, MISC } from 'constants/graphSettings';

const AddResearchProblem = props => {
    const [problem, setProblem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async e => {
        if (problem && problem.id) {
            setIsSaving(true);
            addResourceToObservatory({ observatory_id: props.id, organization_id: MISC.UNKNOWN_ID, id: problem.id })
                .then(a => {
                    toast.success('Research problem added successfully');
                    setIsSaving(false);
                    props.setProblems(v => [problem, ...v]);
                    props.setTotalElements(t => t + 1);
                    props.toggle();
                    setProblem(null);
                })
                .catch(error => {
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
                <>
                    <FormGroup>
                        <Label for="ResearchProblem">Research problem</Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.PROBLEM}
                            placeholder="Select a research problem"
                            onItemSelected={async rp => {
                                setProblem({ ...rp, label: rp.value });
                            }}
                            value={problem || ''}
                            allowCreate={false}
                            autoLoadOption={true}
                        />
                    </FormGroup>
                </>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <Button color="primary" disabled={isSaving} onClick={handleSubmit}>
                        {isSaving && <span className="fa fa-spinner fa-spin" />} Save
                    </Button>
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
