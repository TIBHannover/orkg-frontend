import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup } from 'reactstrap';
import { addResourceToObservatory, addObservatoryResearchProblem } from 'services/backend/resources';
import { deleteStatementById } from 'services/backend/statements';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import ResearchProblemInput from 'components/AddPaper/Contributions/ResearchProblemInput';

class EditResearchProblem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            label: [],
            isLoadingName: false
        };
    }

    componentDidUpdate = prevProps => {};

    handleResearchProblemsChange = async (problemsArray, a) => {
        const id = this.props.id;
        const organizationId = this.props.organizationId;
        if (a.action === 'select-option') {
            this.setState({ label: problemsArray });
            await this.addObservatoryResearchProblem(id, a.option.id, organizationId);

            toast.success('Research problem added successfully');
        } else if (a.action === 'create-option') {
            await addObservatoryResearchProblem(id, organizationId, a.createdOptionLabel).then(a => {
                this.setState({ label: a });
                toast.success('Research problem added successfully');
            });
        } else if (a.action === 'remove-value') {
            await deleteStatementById(a.removedValue.statementId);
            toast.success('Research problem deleted successfully');
        }
        this.props.updateObservatoryResearchProblem();
        this.props.toggle();
    };

    addObservatoryResearchProblem = async (id, name, organizationId) => {
        this.setState({ isLoadingName: true });
        try {
            await addResourceToObservatory(id, organizationId, name);
            this.setState({ isLoadingName: false });
        } catch (error) {
            this.setState({ isLoadingName: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    render() {
        return (
            <>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Add Research Problem</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="ResearchProblem">Title</Label>
                                <ResearchProblemInput handler={this.handleResearchProblemsChange} value={this.state.label} />
                            </FormGroup>
                        </>
                    </ModalBody>
                    <ModalFooter />
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
