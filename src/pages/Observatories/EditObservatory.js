import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateObservatoryName, updateObservatoryDescription } from 'network';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class EditObservatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            label: '',
            description: '',
            isLoadingName: true,
            isLoadingDescription: true
        };
    }

    componentDidUpdate = prevProps => {
        if (prevProps.label !== this.props.label) {
            this.setState({ label: this.props.label });
        }

        if (prevProps.description !== this.props.description) {
            this.setState({ description: this.props.description });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        const value = this.state.label;
        const description = this.state.description;
        const id = this.props.id;

        value !== this.props.label ? await this.updateObservatoryName(id, value) : this.setState({ isLoadingName: true });

        description !== this.props.description
            ? await this.updateObservatoryDescription(id, description)
            : this.setState({ isLoadingDescription: true });

        if (this.state.isLoadingName && this.state.isLoadingDescription) {
            window.location.reload(false);
        }
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
                toast.error(`Error updating ab observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter observatory description`);
            this.setState({ isLoadingDescription: false });
        }
    };

    render() {
        const loading = this.state.editorState === 'loading';
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
                                    // disabled={loading}
                                    value={this.state.label}
                                    placeholder="Observatory Name"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="ObservatoryDescription">Observatory Description</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="textarea"
                                    name="description"
                                    id="observatoryDescription"
                                    disabled={loading}
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
    description: PropTypes.string
};

export default connect()(EditObservatory);
