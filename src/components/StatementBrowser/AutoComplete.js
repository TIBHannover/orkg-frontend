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

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(this.props.requestUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }
                
                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    }

    // TODO: add timer 
    handleChange = async (event) => {
        const maxValues = 6;
        let value = event.target.value;

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
                let queryParams = '';

                if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                    value = value.substring(1, value.length - 1);
                    queryParams = '&exact=true';
                }

                let responseJson = await submitGetRequest(this.props.requestUrl + '?q=' + encodeURIComponent(value) + queryParams);
                responseJson = await this.IdMatch(value, responseJson);
                

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

                const propertyExists = responseJson.find(i => i.label.toLowerCase() === value.trim().toLowerCase())
                const lastItem = this.props.onNewItemSelected && (
                    <>
                        {menuItemsJsx.length > 0 && <HrStyled />}
                        <button
                            type="button"
                            id="new"
                            key="new"
                            className="dropdown-item"
                            onClick={!propertyExists ? this.getNewItemClickHandler(value.trim()) : null}
                        >
                            {!propertyExists &&
                                <em>Create new property: {value.trim()}</em>
                            }
                            {propertyExists &&
                                <em>Property: {value.trim()} <em className="float-right">This property exists already</em></em>
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