import { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup } from 'reactstrap';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { resourcesUrl } from 'services/backend/resources';
import PropTypes from 'prop-types';
import { CLASSES } from 'constants/graphSettings';

class AddResearchProblem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            problem: null,
            isLoadingProblem: false
        };
    }

    handleSubmit = async e => {
        const id = this.props.id;
        const organizationId = this.props.organizationId;
        if (this.state.problem && this.state.problem.id) {
            await this.createObservatoryResearchProblem(id, this.state.problem.id, organizationId);
        } else {
            toast.error(`Please select a research problem`);
        }
    };

    createObservatoryResearchProblem = async (id, problemId, organizationId) => {
        this.setState({ isLoadingProblem: true });
        try {
            await addResourceToObservatory({ observatory_id: id, organization_id: organizationId, id: problemId }).then(a => {
                toast.success('Research problem added successfully');
                this.props.updateObservatoryResearchProblem();
                this.props.toggle();
                this.setState({ problem: null });
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
                    <ModalHeader toggle={this.props.toggle}>Add research problem</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="ResearchProblem">Research problem</Label>
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    optionsClass={CLASSES.PROBLEM}
                                    placeholder="Select a research problem"
                                    onItemSelected={async rp => {
                                        this.setState({ problem: { ...rp, label: rp.value } });
                                    }}
                                    value={this.state.problem || ''}
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

AddResearchProblem.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    organizationId: PropTypes.string,
    updateObservatoryResearchProblem: PropTypes.func.isRequired
};

export default AddResearchProblem;
