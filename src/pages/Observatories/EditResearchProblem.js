import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup } from 'reactstrap';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { resourcesUrl } from 'services/backend/resources';
import PropTypes from 'prop-types';

class EditResearchProblem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            label: '',
            isLoadingProblem: false
        };
    }

    handleSubmit = async e => {
        const id = this.props.id;
        const organizationId = this.props.organizationId;
        const label = this.state.label;
        console.log(label.id);
        if (label.id) {
            await this.createObservatoryResearchProblem(id, label.id, organizationId);
        }
    };

    createObservatoryResearchProblem = async (id, name, organizationId) => {
        this.setState({ isLoadingProblem: true });
        try {
            await addResourceToObservatory(id, organizationId, name).then(a => {
                toast.success('Research problem added successfully');
                this.props.updateObservatoryResearchProblem();
                this.props.toggle();
            });
            this.setState({ isLoadingProblem: false });
        } catch (error) {
            this.setState({ isLoadingProblem: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    render() {
        const isLoading = this.state.isLoadingProblem;
        return (
            <>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Add Research Problem</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="ResearchProblem">Research Problem</Label>
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    optionsClass="Problem"
                                    placeholder="Research Problem"
                                    onItemSelected={async rf => {
                                        this.setState({ label: { ...rf, label: rf.value } });
                                    }}
                                    value={this.state.label || ''}
                                    allowCreate={false}
                                    autoLoadOption={true}
                                />
                            </FormGroup>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={isLoading} onClick={this.handleSubmit}>
                                {isLoading && <span className="fa fa-spinner fa-spin" />} Save
                            </Button>
                        </div>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

EditResearchProblem.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    organizationId: PropTypes.string,
    updateObservatoryResearchProblem: PropTypes.func.isRequired
};

export default EditResearchProblem;
