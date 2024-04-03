import AutoComplete from 'components/Autocomplete/Autocomplete';
import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import {
    updateObservatory,
    updateObservatoryDescription,
    updateObservatoryName,
    updateObservatoryResearchField,
} from 'services/backend/observatories';

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

    componentDidUpdate = (prevProps) => {
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

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async (e) => {
        const value = this.state.label;
        const { description } = this.state;
        const { id } = this.props;
        const { researchField } = this.state;
        const { sdgs } = this.state;

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

        if (!isEqual(sdgs, this.props.sdgs)) {
            await this.updateObservatorySdgs(id, sdgs);
            isUpdatedResearchField = true;
        }

        if (isUpdatedLabel || isUpdatedDescription || isUpdatedResearchField) {
            toast.success('Observatory updated successfully');
            this.props.updateObservatoryMetadata(value, description, researchField, sdgs);
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

    updateObservatorySdgs = async (id, sdgs) => {
        this.setState({ isLoadingResearchField: true });
        try {
            await updateObservatory(id, {
                sdgs: sdgs.map((sdg) => sdg.id),
            });
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
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="observatory-research-field">Research field</Label>
                                <AutoComplete
                                    inputId="observatory-research-field"
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.RESEARCH_FIELD}
                                    placeholder="Select research field"
                                    onItemSelected={async (rf) => {
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
    sdgs: PropTypes.array,
    updateObservatoryMetadata: PropTypes.func.isRequired,
};

export default EditObservatory;
