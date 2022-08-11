import { createRef, Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateObservatoryName, updateObservatoryDescription, updateObservatoryResearchField } from 'services/backend/observatories';
import { isEqual } from 'lodash';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { ENTITIES, CLASSES } from 'constants/graphSettings';
import AutoComplete from 'components/Autocomplete/Autocomplete';

class EditObservatory extends Component {
    constructor(props) {
        super(props);
        this.resourceInputRef = createRef();
        this.state = {
            label: this.props.label,
            description: this.props.description,
            isLoadingName: false,
            isLoadingDescription: false,
            researchField: this.props.researchField,
            isLoadingResearchField: false,
        };
    }

    componentDidUpdate = prevProps => {
        if (prevProps.label !== this.props.label) {
            this.setState({ label: this.props.label });
        }

        if (prevProps.description !== this.props.description) {
            this.setState({ description: this.props.description });
        }

        if (prevProps.researchField !== this.props.researchField) {
            this.setState({ researchField: this.props.researchField });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        const value = this.state.label;
        const { description } = this.state;
        const { id } = this.props;
        const { researchField } = this.state;

        let isUpdatedLabel = true;
        let isUpdatedDescription = true;
        let isUpdatedResearchField = true;

        toast.dismiss();

        if (value !== this.props.label && value.length === 0) {
            toast.error('Please enter an observatory name');
            return false;
        }

        if (description !== this.props.description && description.length === 0) {
            toast.error('Please enter an observatory description');
            return false;
        }

        if (!isEqual(researchField, this.props.researchField) && researchField === null) {
            toast.error('Please enter an observatory research field');
            return false;
        }

        if (value !== this.props.label && value.length !== 0) {
            await this.updateObservatoryName(id, value);
            isUpdatedLabel = true;
        }

        if (description !== this.props.description && description.length !== 0) {
            await this.updateObservatoryDescription(id, description);
            isUpdatedDescription = true;
        }

        if (!isEqual(researchField, this.props.researchField) && researchField !== null) {
            await this.updateObservatoryResearchField(id, researchField);
            isUpdatedResearchField = true;
        }

        if (isUpdatedLabel || isUpdatedDescription || isUpdatedResearchField) {
            toast.success('Observatory updated successfully');
            this.props.updateObservatoryMetadata(value, description, researchField);
            this.props.toggle();
        } else {
            this.props.toggle();
        }
    };

    updateObservatoryName = async (id, name) => {
        this.setState({ isLoadingName: true });
        try {
            await updateObservatoryName(id, name);
            this.setState({ isLoadingName: false });
        } catch (error) {
            this.setState({ isLoadingName: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    updateObservatoryDescription = async (id, description) => {
        this.setState({ isLoadingDescription: true });
        try {
            await updateObservatoryDescription(id, description);
            this.setState({ isLoadingDescription: false });
        } catch (error) {
            this.setState({ isLoadingDescription: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    updateObservatoryResearchField = async (id, researchField) => {
        this.setState({ isLoadingResearchField: true });
        try {
            await updateObservatoryResearchField(id, researchField.id);
            this.setState({ isLoadingResearchField: false });
        } catch (error) {
            this.setState({ isLoadingResearchField: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    render() {
        const isLoading = this.state.isLoadingName || this.state.isLoadingDescription || this.state.isLoadingResearchField;
        return (
            <>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Update observatory</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="observatory-name">Name</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="label"
                                    id="observatory-name"
                                    value={this.state.label}
                                    placeholder="Name"
                                    disabled={isLoading}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="observatory-research-field">Research field</Label>
                                <AutoComplete
                                    inputId="observatory-research-field"
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.RESEARCH_FIELD}
                                    placeholder="Select research field"
                                    onItemSelected={async rf => {
                                        this.setState({ researchField: { ...rf, label: rf.value } });
                                    }}
                                    value={this.state.researchField && this.state.researchField.id ? this.state.researchField : null}
                                    allowCreate={false}
                                    ols={false}
                                    autoLoadOption={true}
                                    isDisabled={isLoading}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="observatory-description">Description</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="textarea"
                                    name="description"
                                    id="observatory-description"
                                    value={this.state.description}
                                    rows={4}
                                    placeholder="description"
                                    disabled={isLoading}
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

EditObservatory.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    description: PropTypes.string,
    researchField: PropTypes.object,
    updateObservatoryMetadata: PropTypes.func.isRequired,
};

export default EditObservatory;
