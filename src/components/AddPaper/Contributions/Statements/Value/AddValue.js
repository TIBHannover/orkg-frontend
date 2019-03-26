import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../../network';
import { Input, InputGroup, InputGroupAddon, Button, ListGroupItem, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';

class AddValue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            //collapse: false, //replace
            dropdownOpen: false, //replace,
            showAddValue: false,
            valueType: 'Object'
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
        });
    }

    handleDropdownSelect = (valueType) => {
        this.setState({
            valueType
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
                                    {this.state.valueType}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem className={styles.dropdownItem} onClick={() => this.handleDropdownSelect('Object')}>
                                        <Tooltip message="Choose object to link this to an object, which can contain values on its own" >
                                            Object
                                        </Tooltip>
                                    </DropdownItem>
                                    <DropdownItem className={styles.dropdownItem} onClick={() => this.handleDropdownSelect('Literal')}>
                                        <Tooltip message="Choose literal for values like numbers or plain text" >
                                            Literal
                                        </Tooltip>
                                    </DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>

                            <Input bsSize="sm" placeholder="Enter a value" />

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={styles.valueActionButton} onClick={this.handleHideAddValue}>Cancel</Button>
                                <Button color="light" className={styles.valueActionButton}>Done</Button>
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