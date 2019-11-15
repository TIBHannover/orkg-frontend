import React, { Component } from 'react';
import { resourcesUrl, createResourceStatement, createResource, createLiteral, createLiteralStatement } from '../../../network';
import { Input, InputGroup, InputGroupAddon, Button, DropdownToggle, DropdownMenu, InputGroupButtonDropdown } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import { StyledValueItem, StyledDropdownItem } from '../../AddPaper/Contributions/styled';
import AutoComplete from '../AutoComplete';
import { connect } from 'react-redux';
import { createValue } from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';

class AddValue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            dropdownValueTypeOpen: false,
            showAddValue: false,
            valueType: 'object',
            inputValue: ''
        };
    }

    toggleDropDownValueType = () => {
        this.setState({
            dropdownValueTypeOpen: !this.state.dropdownValueTypeOpen
        });
    };

    handleShowAddValue = () => {
        this.setState({
            showAddValue: true
        });
    };

    handleHideAddValue = () => {
        this.setState({
            showAddValue: false,
            inputValue: '',
            valueType: 'object'
        });
    };

    handleDropdownSelect = valueType => {
        this.setState({
            valueType
        });
    };

    handleInputChange = (e, value) => {
        let inputValue = e ? e.target.value : value;

        this.setState({
            inputValue
        });
    };

    handleValueSelect = async ({ id, value, shared, classes }) => {
        if (this.props.syncBackend) {
            let predicate = this.props.properties.byId[this.props.selectedProperty];
            let newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, id);
            this.props.createValue({
                label: value,
                type: this.state.valueType,
                propertyId: this.props.selectedProperty,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: shared
            });
        } else {
            this.props.createValue({
                label: value,
                type: this.state.valueType,
                propertyId: this.props.selectedProperty,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                shared: shared
            });
        }

        this.handleHideAddValue();
    };

    handleAddValue = async () => {
        if (this.props.syncBackend) {
            let predicate = this.props.properties.byId[this.props.selectedProperty];
            let newObject = null;
            let newStatement = null;
            if (this.state.valueType === 'object') {
                newObject = await createResource(this.state.inputValue);
                newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
            } else {
                newObject = await createLiteral(this.state.inputValue);
                newStatement = await createLiteralStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
            }
            this.props.createValue({
                label: this.state.inputValue,
                type: this.state.valueType,
                propertyId: this.props.selectedProperty,
                existingResourceId: newObject.id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: newObject.shared
            });
        } else {
            this.props.createValue({
                label: this.state.inputValue,
                type: this.state.valueType,
                propertyId: this.props.selectedProperty,
                shared: 1
            });
        }

        this.handleHideAddValue();
    };

    getNewResources = () => {
        let resourceList = [];

        for (let key in this.props.newResources) {
            let resource = this.props.newResources[key];

            if (!resource.existingResourceId) {
                resourceList.push({
                    id: resource.id,
                    label: resource.label
                });
            }
        }

        return resourceList;
    };

    render() {
        return (
            <>
                <StyledValueItem>
                    {this.state.showAddValue ? (
                        <InputGroup>
                            <InputGroupButtonDropdown
                                addonType="prepend"
                                isOpen={this.state.dropdownValueTypeOpen}
                                toggle={this.toggleDropDownValueType}
                            >
                                <DropdownToggle caret color="primary" className={'valueTypeDropdown'}>
                                    {this.state.valueType.charAt(0).toUpperCase() + this.state.valueType.slice(1)}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => this.handleDropdownSelect('object')}>
                                        <Tooltip message="Choose object to link this to an object, which can contain values on its own">
                                            Object
                                        </Tooltip>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => this.handleDropdownSelect('literal')}>
                                        <Tooltip message="Choose literal for values like numbers or plain text">Literal</Tooltip>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>

                            {this.state.valueType === 'object' ? (
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM}`}
                                    placeholder="Enter an object"
                                    onItemSelected={this.handleValueSelect}
                                    onInput={this.handleInputChange}
                                    value={this.state.inputValue}
                                    additionalData={this.getNewResources()}
                                    disableBorderRadiusRight
                                    disableBorderRadiusLeft
                                />
                            ) : (
                                <Input
                                    placeholder="Enter a value"
                                    name="literalValue"
                                    value={this.state.inputValue}
                                    onChange={this.handleInputChange}
                                />
                            )}

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={'valueActionButton'} onClick={this.handleHideAddValue}>
                                    Cancel
                                </Button>
                                <Button color="light" className={'valueActionButton'} onClick={this.handleAddValue}>
                                    Create
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    ) : (
                        <span className="btn btn-link p-0" onClick={this.handleShowAddValue}>
                            + Add value
                        </span>
                    )}
                </StyledValueItem>
            </>
        );
    }
}

AddValue.propTypes = {
    createValue: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    newResources: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    properties: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        newResources: state.statementBrowser.resources.byId,
        properties: state.statementBrowser.properties
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);
