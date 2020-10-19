import React, { Component } from 'react';
import { createPredicate } from 'services/backend/predicates';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AddPropertyTemplate from './AddPropertyTemplate';

import PropTypes from 'prop-types';

export default class AddProperty extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAddProperty: false,
            newPredicateValue: '',
            confirmNewPropertyModal: false,
            newPropertyLabel: ''
        };
    }

    handleShowAddProperty = () => {
        this.setState({
            showAddProperty: true
        });
    };

    handleHideAddProperty = () => {
        this.setState({
            showAddProperty: false,
            newPredicateValue: ''
        });
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    toggleConfirmNewProperty = propertyLabel => {
        this.setState(prevState => ({
            confirmNewPropertyModal: !prevState.confirmNewPropertyModal,
            newPropertyLabel: propertyLabel
        }));
    };

    handlePropertySelect = ({ id, value: label }) => {
        this.setState({
            showAddProperty: false
        });

        this.props.createProperty({
            resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource,
            existingPredicateId: id,
            label: label,
            isTemplate: false,
            createAndSelect: true
        });
    };

    handleNewProperty = async () => {
        this.setState({
            showAddProperty: false
        });

        this.toggleConfirmNewProperty(); // hide dialog

        if (this.props.syncBackend) {
            const newPredicate = await createPredicate(this.state.newPropertyLabel);
            this.props.createProperty({
                resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource,
                existingPredicateId: newPredicate.id,
                label: newPredicate.label,
                isTemplate: false,
                createAndSelect: true
            });
        } else {
            this.props.createProperty({
                resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource,
                label: this.state.newPropertyLabel,
                isTemplate: false,
                createAndSelect: true
            });
        }
    };

    render() {
        return (
            <>
                <AddPropertyTemplate
                    inTemplate={this.props.inTemplate}
                    isDisabled={this.props.isDisabled}
                    showAddProperty={this.state.showAddProperty}
                    handlePropertySelect={this.handlePropertySelect}
                    toggleConfirmNewProperty={this.toggleConfirmNewProperty}
                    handleHideAddProperty={this.handleHideAddProperty}
                    newProperties={this.props.newProperties}
                    handleShowAddProperty={this.handleShowAddProperty}
                />

                <Modal isOpen={this.state.confirmNewPropertyModal} toggle={this.toggleConfirmNewProperty}>
                    <ModalHeader toggle={this.toggleConfirmNewProperty}>Are you sure you need a new property?</ModalHeader>
                    <ModalBody>
                        Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.toggleConfirmNewProperty}>
                            Cancel
                        </Button>{' '}
                        <Button color="primary" onClick={this.handleNewProperty}>
                            Create new property
                        </Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

AddProperty.propTypes = {
    createProperty: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    resourceId: PropTypes.string,
    newProperties: PropTypes.array.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    inTemplate: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired
};

AddProperty.defaultProps = {
    contextStyle: 'StatementBrowser',
    inTemplate: false,
    isDisabled: false
};
