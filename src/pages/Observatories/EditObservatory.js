import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateObservatoryName, updateObservatoryDescription, updateObservatoryResearchField, resourcesUrl } from 'network';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import AutoComplete from 'components/Autocomplete/Autocomplete';

class EditObservatory extends Component {
    constructor(props) {
        super(props);
        this.resourceInputRef = React.createRef();
        this.state = {
            label: '',
            description: '',
            isLoadingName: true,
            isLoadingDescription: true,
            researchField: '',
            isLoadingResearchField: true
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
            this.setState({ researchField: { label: this.props.researchField } });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        const value = this.state.label;
        const description = this.state.description;
        const id = this.props.id;
        const researchField = this.state.researchField.label;
        await this.updateObservatoryMetadata(value, description, id, researchField);

        if (this.state.isLoadingName && this.state.isLoadingDescription && this.state.isLoadingResearchField) {
            window.location.reload();
        }
    };

    updateObservatoryMetadata = async (value, description, id, researchField) => {
        value !== this.props.label ? await this.updateObservatoryName(id, value) : this.setState({ isLoadingName: true });

        description !== this.props.description
            ? await this.updateObservatoryDescription(id, description)
            : this.setState({ isLoadingDescription: true });

        researchField !== this.props.researchField
            ? await this.updateObservatoryResearchField(id, researchField)
            : this.setState({ isLoadingResearchField: true });
    };

    updateObservatoryName = async (id, name) => {
        this.setState({ isLoadingName: true });
        if (name && name.length !== 0) {
            try {
                await updateObservatoryName(id, name);
            } catch (error) {
                this.setState({ isLoadingName: false });
                console.error(error);
                toast.error(`Error updating an observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter an observatory name`);
            this.setState({ isLoadingName: false });
        }
    };

    updateObservatoryDescription = async (id, description) => {
        this.setState({ isLoadingDescription: true });
        if (description && description.length !== 0) {
            try {
                await updateObservatoryDescription(id, description);
            } catch (error) {
                this.setState({ isLoadingDescription: false });
                console.error(error);
                toast.error(`Error updating an observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter observatory description`);
            this.setState({ isLoadingDescription: false });
        }
    };

    updateObservatoryResearchField = async (id, researchField) => {
        this.setState({ isLoadingResearchField: true });
        if (researchField && researchField.length !== 0) {
            try {
                await updateObservatoryResearchField(id, researchField);
            } catch (error) {
                this.setState({ isLoadingResearchField: false });
                console.error(error);
                toast.error(`Error updating an observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter observatory research field`);
            this.setState({ isLoadingDescription: false });
        }
    };

    render() {
        return (
            <>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Update an Observatory</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="ObservatoryName">Observatory Name</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="label"
                                    id="ObservatoryName"
                                    value={this.state.label}
                                    placeholder="Observatory Name"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="ObservatoryResearchField">Observatory Research Field</Label>
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    optionsClass="ResearchField"
                                    placeholder="Observatory research field"
                                    onItemSelected={async rf => {
                                        this.setState({ researchField: { ...rf, label: rf.value } });
                                    }}
                                    value={this.state.researchField || ''}
                                    allowCreate={false}
                                    autoLoadOption={true}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="ObservatoryDescription">Observatory Description</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="textarea"
                                    name="description"
                                    id="observatoryDescription"
                                    value={this.state.description}
                                    rows={4}
                                    placeholder="Observatory description"
                                />
                            </FormGroup>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                                {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Save
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
    researchField: PropTypes.string
};

export default connect()(EditObservatory);
