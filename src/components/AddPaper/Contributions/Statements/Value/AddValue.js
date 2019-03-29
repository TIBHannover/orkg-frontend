import React, { Component } from 'react';
import { resourcesUrl } from '../../../../../network';
import { Input, InputGroup, InputGroupAddon, Button, ListGroupItem, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';
import AutoComplete from '../AutoComplete';
import { guid } from '../../../../../utils';

class AddValue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            //collapse: false, //replace
            dropdownOpen: false, //replace,
            showAddValue: false,
            valueType: 'object',
            objectValue: '',
            literalValue: '',
        }
    }

    toggleDropDown = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
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
        this.props.handleAddValue({
            valueId: id,
            valueLabel: value,
            valueType: this.state.valueType,
            predicateId: this.props.predicateId,
        });

        this.handleHideAddValue();
    }

    handleAddValue = () => {
        console.log('type', this.state.valueType);

        this.props.handleAddValue({
            valueId: guid(),
            valueLabel: this.state.valueType == 'object' ? this.state.objectValue : this.state.literalValue,
            valueType: this.state.valueType,
            predicateId: this.props.predicateId,
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
                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
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

                            {this.state.valueType == 'object' ?
                                <AutoComplete requestUrl={resourcesUrl}
                                    placeholder="Enter a object"
                                    onItemSelected={this.handlePropertySelect}
                                    onInput={this.handleChangeObjectValue}
                                    disableBorderRadiusRight
                                    disableBorderRadiusLeft
                                    />
                                :
                                <Input bsSize="sm" 
                                    placeholder="Enter a value" 
                                    name="literalValue" 
                                    value={this.state.literalValue} 
                                    onChange={this.handleInputChange} />
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

export default AddValue;