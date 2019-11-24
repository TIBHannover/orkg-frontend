import React, { Component } from 'react';
import { InputGroup, InputGroupAddon, Input, DropdownMenu, DropdownItem, InputGroupButtonDropdown } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizzard/TemplateOptionButton';
import { StyledButton, StyledDropdownToggle, ValueItemStyle } from './../styled';
import PropTypes from 'prop-types';

class AddValue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addValue: false
        };
    }

    handleAddValue = () => {
        this.setState({ addValue: !this.state.addValue });
    };

    toggleDropDownValueType = () => {
        this.setState({
            dropdownValueTypeOpen: !this.state.dropdownValueTypeOpen
        });
    };

    render() {
        return (
            <ValueItemStyle className={this.state.addValue ? 'editingLabel' : ''}>
                {!this.state.addValue ? (
                    <TemplateOptionButton title={'Add value'} icon={faPlus} action={() => this.handleAddValue()} />
                ) : (
                    <div>
                        <InputGroup size="sm">
                            <InputGroupButtonDropdown
                                addonType="prepend"
                                isOpen={this.state.dropdownValueTypeOpen}
                                toggle={this.toggleDropDownValueType}
                            >
                                <StyledDropdownToggle>
                                    <Icon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => null}>Object</DropdownItem>
                                    <DropdownItem onClick={() => null}>Literal</DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input bsSize="sm" placeholder="Add value" />
                            <InputGroupAddon addonType="append">
                                <StyledButton outline onClick={() => this.handleAddValue()}>
                                    Create
                                </StyledButton>
                                <StyledButton outline onClick={() => this.handleAddValue()}>
                                    Cancel
                                </StyledButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                )}
            </ValueItemStyle>
        );
    }
}

AddValue.propTypes = {
    label: PropTypes.string.isRequired,
    action: PropTypes.func
};

AddValue.defaultProps = {
    label: ''
};

export default AddValue;
