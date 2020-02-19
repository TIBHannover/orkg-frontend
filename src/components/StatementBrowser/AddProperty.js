import React, { Component } from 'react';
import { predicatesUrl, createPredicate } from '../../network';
import { InputGroupAddon, Button, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup } from 'reactstrap';
import {
    StyledStatementItem,
    StyledAddProperty,
    AddPropertyStyle,
    AddPropertyContentStyle,
    AddPropertyFormStyle,
    StyledButton
} from '../AddPaper/Contributions/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from './AutoComplete';
import { connect } from 'react-redux';
import { createProperty } from '../../actions/statementBrowser';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';

class AddProperty extends Component {
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
            isTemplate: false
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
                isTemplate: false
            });
        } else {
            this.props.createProperty({
                resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource,
                label: this.state.newPropertyLabel,
                isTemplate: false
            });
        }
    };

    getNewProperties = () => {
        let propertyList = [];

        for (const key in this.props.newProperties) {
            const property = this.props.newProperties[key];

            if (!property.existingPredicateId) {
                propertyList.push({
                    id: null,
                    label: property.label
                });
            }
        }
        //  ensure no properties with duplicate Labels exist
        propertyList = uniqBy(propertyList, 'label');
        return propertyList;
    };

    getDefaultProperties = () => {
        return [
            {
                label: 'Has evaluation',
                id: 'HAS_EVALUATION'
            },
            {
                label: 'Has approach',
                id: 'HAS_APPROACH'
            },
            {
                label: 'Has method',
                id: 'HAS_METHOD'
            },
            {
                label: 'Has implementation',
                id: 'HAS_IMPLEMENTATION'
            },
            {
                label: 'Has result',
                id: 'HAS_RESULTS'
            },
            {
                label: 'Has value',
                id: 'HAS_VALUE'
            },
            {
                label: 'Has metric',
                id: 'HAS_METRIC'
            }
        ];
    };

    render() {
        return (
            <>
                {this.props.contextStyle === 'StatementBrowser' ? (
                    <StyledStatementItem
                        style={{ transition: '0.3s max-width', borderTop: '0', textAlign: 'center' }}
                        className={`${this.state.showAddProperty ? 'col-12 large' : 'col-3'}`}
                    >
                        {this.state.showAddProperty ? (
                            <StyledAddProperty style={{ textAlign: 'left' }}>
                                <AutoComplete
                                    requestUrl={predicatesUrl}
                                    placeholder="Select or type to enter a property"
                                    onItemSelected={this.handlePropertySelect}
                                    onNewItemSelected={this.toggleConfirmNewProperty}
                                    onKeyUp={() => {}}
                                    additionalData={this.getNewProperties()}
                                    disableBorderRadiusRight
                                    allowCreate
                                    defaultOptions={this.getDefaultProperties()}
                                />

                                <InputGroupAddon addonType="append">
                                    <Button color="light" className={'addPropertyActionButton'} onClick={this.handleHideAddProperty}>
                                        Cancel
                                    </Button>
                                </InputGroupAddon>
                            </StyledAddProperty>
                        ) : (
                            <span className="btn btn-link p-0 border-0 align-baseline" onClick={this.handleShowAddProperty}>
                                + Add property
                            </span>
                        )}
                    </StyledStatementItem>
                ) : (
                    <AddPropertyStyle className={this.props.inTemplate ? 'inTemplate' : 'mt-4'}>
                        <AddPropertyContentStyle
                            onClick={() => (this.props.inTemplate && !this.state.showAddProperty ? this.handleShowAddProperty() : undefined)}
                            className={`${this.props.inTemplate ? 'inTemplate' : 'noTemplate'} ${this.state.showAddProperty ? 'col-12 large' : ''}`}
                        >
                            {!this.state.showAddProperty ? (
                                <Button
                                    //className={this.props.inTemplate ? 'p-0' : ''}
                                    color={this.props.inTemplate ? 'light' : 'darkblue'}
                                    onClick={() => (!this.props.inTemplate ? this.handleShowAddProperty() : undefined)}
                                    //style={this.props.inTemplate ? { color: 'inherit' } : undefined}
                                    size="sm"
                                >
                                    <Icon className={'icon'} size="sm" icon={faPlus} /> Add property
                                </Button>
                            ) : (
                                <AddPropertyFormStyle>
                                    <InputGroup size="sm">
                                        <InputGroupAddon addonType="prepend">
                                            <Icon className={'icon'} icon={faPlus} />
                                        </InputGroupAddon>
                                        <AutoComplete
                                            cssClasses={'form-control-sm'}
                                            requestUrl={predicatesUrl}
                                            placeholder="Select or type to enter a property"
                                            onItemSelected={this.handlePropertySelect}
                                            onNewItemSelected={this.toggleConfirmNewProperty}
                                            onKeyUp={() => {}}
                                            additionalData={this.getNewProperties()}
                                            disableBorderRadiusRight
                                            allowCreate
                                            defaultOptions={this.getDefaultProperties()}
                                        />
                                        <InputGroupAddon addonType="append">
                                            <StyledButton outline onClick={() => this.handleHideAddProperty()}>
                                                Cancel
                                            </StyledButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </AddPropertyFormStyle>
                            )}
                        </AddPropertyContentStyle>
                    </AddPropertyStyle>
                )}

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
    newProperties: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    inTemplate: PropTypes.bool.isRequired
};

AddProperty.defaultProps = {
    contextStyle: 'StatementBrowser',
    inTemplate: false
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
        newProperties: state.statementBrowser.properties.byId
    };
};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddProperty);
