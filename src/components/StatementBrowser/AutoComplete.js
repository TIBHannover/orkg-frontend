import React, { Component } from 'react';
import { submitGetRequest } from '../../network';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const DropdownMenuStyled = styled.div`
    display: block!important;
    z-index: 1001!important;
`;

const HrStyled = styled.hr`
    margin-top: 0;
    margin-bottom: 0;
`;

class AutoComplete extends Component {
    constructor(props) {
        super(props);

        this.state.value = this.props.value || '';
    }

    state = {
        selectedItemId: null,
        dropdownMenuJsx: null,
    };

    // TODO: add timer, so that the request is not sent on every keystroke.
    handleChange = async (event) => {
        const maxValues = 6;
        const value = event.target.value;

        if (this.state.selectedItemId) {
            this.props.onItemSelected(null);
        }
        this.setState({
            value: value,
            selectedItemId: null,
        });

        this.props.onInput && this.props.onInput(event);

        if (value && value.length >= 0) {
            try {
                const responseJson = await submitGetRequest(this.props.requestUrl + '?q=' + encodeURIComponent(value));

                const menuItemsJsx = responseJson.map((item) => (
                    <button
                        type="button"
                        id={item.id}
                        key={item.id}
                        className="dropdown-item"
                        onClick={this.handleItemClick}
                        style={{ whiteSpace: 'normal' }}
                    >
                        {item.label}
                    </button>
                )).slice(0, maxValues);

                const lastItem = this.props.onNewItemSelected && (
                    <>
                        {menuItemsJsx.length > 0 && <HrStyled />}
                        <button
                            type="button"
                            id="new"
                            key="new"
                            className="dropdown-item"
                            onClick={this.getNewItemClickHandler(value.trim())}
                        >
                            <em>Create new property: {value.trim()}</em>
                            {responseJson.find(i => i.label.toLowerCase() === value.trim().toLowerCase()) &&
                                <em className="float-right">This property exists already</em>
                            }
                        </button>
                    </>
                );

                const completeMenuItemsJsx = lastItem ? [...menuItemsJsx, lastItem] : menuItemsJsx;

                if (completeMenuItemsJsx.length > 0) {
                    this.setState({
                        dropdownMenuJsx: <DropdownMenuStyled className="dropdown-menu" style={{ width: '100%' }}>{completeMenuItemsJsx}</DropdownMenuStyled>,
                    });
                } else {
                    this.hideDropdownMenu();
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            this.hideDropdownMenu();
        }
    };

    getNewItemClickHandler = (value) => {
        return () => {
            if (this.props.hideAfterSelection) {
                this.hideDropdownMenu();
            }
            this.props.onNewItemSelected && this.props.onNewItemSelected(value);
            return false;
        }
    };

    handleItemClick = (event) => {
        this.setState({
            value: event.target.innerText,
            selectedItemId: event.target.id,
        });
        this.hideDropdownMenu();
        this.props.onItemSelected({
            id: event.target.id,
            value: event.target.innerText,
        });
        return false;
    };

    hideDropdownMenu = () => {
        this.setState({ dropdownMenuJsx: null });
    };

    render() {
        let inputStyle = {};

        // disable border radius when is used in a button group (since there is a 
        // span around the dropdown, disabling using :first-child doesn't work)
        if (this.props.disableBorderRadiusLeft) {
            inputStyle.borderTopLeftRadius = 0;
            inputStyle.borderBottomLeftRadius = 0;
        }

        if (this.props.disableBorderRadiusRight) {
            inputStyle.borderTopRightRadius = 0;
            inputStyle.borderBottomRightRadius = 0;
        }

        return (
            <span className="dropdown" style={{ flex: '1 1 auto' }}>
                <Input bsSize="sm"
                    autoFocus={true}
                    placeholder={this.props.placeholder}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onKeyUp={this.props.onKeyUp}
                    style={inputStyle}
                />

                {this.state.dropdownMenuJsx}
            </span>
        );
    }
}

AutoComplete.propTypes = {
    requestUrl: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    onItemSelected: PropTypes.func.isRequired,
    onNewItemSelected: PropTypes.func,
    onKeyUp: PropTypes.func,
    disableBorderRadiusRight: PropTypes.bool,
    disableBorderRadiusLeft: PropTypes.bool,
    onInput: PropTypes.func,
    value: PropTypes.string,
    hideAfterSelection: PropTypes.bool,
};

export default AutoComplete;