import React, { Component } from 'react';
import { resourcesUrl } from '../../../../../network';
import { Input, InputGroup, InputGroupAddon, Button, ListGroupItem, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';
import AutoComplete from '../AutoComplete';
import { connect } from 'react-redux';
import { createValue } from '../../../../../actions/addPaper';
import PropTypes from 'prop-types';

class AddValue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            dropdownValueTypeOpen: false,
            showAddValue: false,
            valueType: 'object',
            objectValue: '',
            literalValue: '',
        }
    }

    toggleDropDownValueType = () => {
        this.setState({
            dropdownValueTypeOpen: !this.state.dropdownValueTypeOpen
        });
    }

    handleShowAddValue = () => {
        this.setState({
            showAddValue: true,
        });
    }

    handleHideAddValue = () => {
        this.setState({
            showAddValue: false,
            literalValue: '',
            objectValue: '',
            valueType: 'object',
        });
    }

    handleDropdownSelect = (valueType) => {
        this.setState({
            valueType
        });
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handlePropertySelect = ({ id, value }) => {
        this.props.createValue({
            label: value,
            type: this.state.valueType,
            propertyId: this.props.selectedProperty,
            existingResourceId: id,
            isExistingValue: true,
        });

        this.handleHideAddValue();
    }

    handleAddValue = () => {
        this.props.createValue({
            label: this.state.valueType === 'object' ? this.state.objectValue : this.state.literalValue,
            type: this.state.valueType,
            propertyId: this.props.selectedProperty,
        });

        this.handleHideAddValue();
    }

    handleChangeObjectValue = (e) => {
        this.setState({
            objectValue: e.target.value.trim()
        });
    }

    render() {
        return (
            <>
                <ListGroupItem className={styles.valueItem}>
                    {this.state.showAddValue ?
                        <InputGroup>
                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.dropdownValueTypeOpen} toggle={this.toggleDropDownValueType}>
                                <DropdownToggle caret color="primary" className={styles.valueTypeDropdown}>
                                    {this.state.valueType.charAt(0).toUpperCase() + this.state.valueType.slice(1)}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem className={styles.dropdownItem} onClick={() => this.handleDropdownSelect('object')}>
                                        <Tooltip message="Choose object to link this to an object, which can contain values on its own" >
                                            Object
                                        </Tooltip>
                                    </DropdownItem>
                                    <DropdownItem className={styles.dropdownItem} onClick={() => this.handleDropdownSelect('literal')}>
                                        <Tooltip message="Choose literal for values like numbers or plain text" >
                                            Literal
                                        </Tooltip>
                                    </DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>

                            {this.state.valueType === 'object' ?
                                (
                                    <AutoComplete
                                        requestUrl={resourcesUrl}
                                        placeholder="Enter a object"
                                        onItemSelected={this.handlePropertySelect}
                                        onInput={this.handleChangeObjectValue}
                                        disableBorderRadiusRight
                                        disableBorderRadiusLeft
                                    />
                                ) : (
                                    <Input bsSize="sm"
                                        placeholder="Enter a value"
                                        name="literalValue"
                                        value={this.state.literalValue}
                                        onChange={this.handleInputChange}
                                    />
                                )
                            }

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={styles.valueActionButton} onClick={this.handleHideAddValue}>Cancel</Button>
                                <Button color="light" className={styles.valueActionButton} onClick={this.handleAddValue}>Done</Button>
                            </InputGroupAddon>
                        </InputGroup>
                        :
                        <span className="btn btn-link p-0" onClick={this.handleShowAddValue}>+ Add value</span>
                    }
                </ListGroupItem>
            </>

        );
    }
}

AddValue.propTypes = {
    createValue: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
    return {
        selectedProperty: state.addPaper.selectedProperty,
    }
};

const mapDispatchToProps = dispatch => ({
    createValue: (data) => dispatch(createValue(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);