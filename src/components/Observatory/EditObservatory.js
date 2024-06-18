import Autocomplete from 'components/Autocomplete/Autocomplete';
import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { updateObservatory } from 'services/backend/observatories';

export const MAX_DESCRIPTION_LENGTH = 750;

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
            sdgs: this.props.sdgs,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.label !== this.props.label) {
            this.setState({ label: this.props.label });
        }

        if (prevProps.description !== this.props.description) {
            this.setState({ description: this.props.description });
        }

        if (prevProps.researchField !== this.props.researchField) {
            this.setState({ researchField: this.props.researchField });
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async (e) => {
        const value = this.state.label;
        const { description } = this.state;
        const { id } = this.props;
        const { researchField } = this.state;
        const { sdgs } = this.state;

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

        await this.updateObservatory(id, value, description, researchField, sdgs);
        toast.success('Observatory updated successfully');
        this.props.updateObservatoryMetadata(value, description, researchField, sdgs);
        this.props.toggle();
    };

    updateObservatory = async (id, name, description, researchField, sdgs) => {
        this.setState({ isLoadingName: true, isLoadingDescription: true, isLoadingResearchField: true });
        try {
            await updateObservatory(id, { name, description, research_field: researchField?.id, sdgs: sdgs.map((sdg) => sdg?.id) });
            this.setState({ isLoadingName: false, isLoadingDescription: false, isLoadingResearchField: false });
        } catch (error) {
            this.setState({ isLoadingName: false, isLoadingDescription: false, isLoadingResearchField: false });
            console.error(error);
            toast.error(`Error updating an observatory ${error.message}`);
        }
    };

    render() {
        const isLoading = this.state.isLoadingName || this.state.isLoadingDescription || this.state.isLoadingResearchField;
        return (
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
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="observatory-research-field">Research field</Label>
                            <Autocomplete
                                inputId="observatory-research-field"
                                entityType={ENTITIES.RESOURCE}
                                includeClasses={[CLASSES.RESEARCH_FIELD]}
                                placeholder="Select research field"
                                onChange={(value, { action }) => {
                                    if (action === 'select-option') {
                                        this.setState({ researchField: value });
                                    }
                                }}
                                value={this.state.researchField}
                                enableExternalSources={false}
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
                                disabled={isLoading}
                                maxLength={MAX_DESCRIPTION_LENGTH}
                            />
                            <div className="text-muted text-end">
                                {this.state.description?.length}/{MAX_DESCRIPTION_LENGTH}
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label>Sustainable development goals</Label>
                            <SdgBox handleSave={(sdgs) => this.setState({ sdgs })} sdgs={this.state.sdgs} maxWidth="100%" isEditable />
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
    sdgs: PropTypes.array,
    updateObservatoryMetadata: PropTypes.func.isRequired,
};

export default EditObservatory;
