import React, { Component } from 'react';
import { submitGetRequest, getResourcesByClass } from 'network';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import styled, { withTheme } from 'styled-components';

export const StyledAutoCompleteInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    &.default {
        height: auto !important;
        min-height: calc(1.8125rem + 4px);
    }
    cursor: text;
    padding: 0 !important;
`;

class AutoComplete extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputValue: ''
        };

        this.maxResults = 100;
    }

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
    };

    loadOptions = async value => {
        try {
            if (value === '' || value.trim() === '') {
                return [];
            }

            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }
            let responseJson;
            if (this.props.optionsClass) {
                responseJson = await getResourcesByClass({ id: this.props.optionsClass, q: value });
            } else {
                responseJson = await submitGetRequest(this.props.requestUrl + '?q=' + encodeURIComponent(value) + queryParams);
            }
            responseJson = await this.IdMatch(value, responseJson);

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            const options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id,
                    ...(item.shared ? { shared: item.shared } : {}),
                    ...(item.classes ? { classes: item.classes } : {})
                })
            );
            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    handleInputChange = (inputValue, action) => {
        if (action.action === 'input-change') {
            this.setState({
                inputValue
            });
        }
    };

    noResults = value => {
        return value.inputValue !== '' ? 'No results found' : 'Start typing to find results';
    };

    render() {
        this.customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: this.props.theme.inputBg,
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                paddingLeft: 0,
                paddingRight: 0,
                cursor: 'text',
                minHeight: 'initial',
                borderRadius: 'inherit',
                whiteSpace: 'nowrap' /* ensure the placeholder is not wrapped when animating the width */
            }),
            container: provided => ({
                ...provided,
                padding: 0,
                height: 'auto',
                borderTopLeftRadius: 'inherit',
                borderBottomLeftRadius: 'inherit',
                borderTopRightRadius: 'inherit',
                borderBottomRightRadius: 'inherit',
                background: '#fff'
            }),
            indicatorsContainer: provided => ({
                ...provided,
                cursor: 'pointer'
            }),
            menu: provided => ({
                ...provided,
                zIndex: 10
            }),
            option: provided => ({
                ...provided,
                cursor: 'pointer',
                whiteSpace: 'normal'
            })
        };

        const Select = this.props.allowCreate ? AsyncCreatableSelect : AsyncSelect;

        return (
            <StyledAutoCompleteInputFormControl className="form-control default">
                <Select
                    loadOptions={this.loadOptions}
                    noOptionsMessage={this.noResults}
                    onChange={this.props.onItemSelected}
                    onInputChange={this.handleInputChange}
                    styles={this.customStyles}
                    placeholder={this.props.placeholder}
                    autoFocus
                    cacheOptions
                    value={this.props.value}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    isMulti={this.props.isMulti ? true : false}
                    isDisabled={this.props.isDisabled}
                    isClearable={this.props.isClearable}
                />
            </StyledAutoCompleteInputFormControl>
        );
    }
}

AutoComplete.propTypes = {
    requestUrl: PropTypes.string.isRequired,
    onItemSelected: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    allowCreate: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    theme: PropTypes.object.isRequired,
    optionsClass: PropTypes.string,
    isMulti: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isClearable: PropTypes.bool
};

export default withTheme(AutoComplete);
