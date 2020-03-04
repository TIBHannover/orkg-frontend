import React, { Component } from 'react';
import { submitGetRequest, getResourcesByClass } from '../../network';
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
            selectedItemId: null,
            dropdownMenuJsx: null,
            inputValue: '',
            defaultOptions: this.props.defaultOptions ? this.props.defaultOptions : [],
            value: this.props.value || ''
        };

        this.maxResults = 100;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
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
                return this.props.defaultOptions ? this.props.defaultOptions : [];
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
                responseJson = await submitGetRequest(
                    this.props.requestUrl +
                        '?q=' +
                        encodeURIComponent(value) +
                        queryParams +
                        (this.props.excludeClasses ? '&exclude=' + encodeURIComponent(this.props.excludeClasses) : '')
                );
            }

            responseJson = await this.IdMatch(value, responseJson);

            if (this.props.additionalData && this.props.additionalData.length > 0) {
                let newProperties = this.props.additionalData;
                newProperties = newProperties.filter(({ label }) => label.toLowerCase().includes(value.toLowerCase())); // ensure the label of the new property contains the search value

                responseJson.unshift(...newProperties);
            }

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

    // this fixes a problem (or a bug by design) from react-select
    // options were lost after blurring and then focusing the select menu
    // probably because the inputValue is controlled by this component
    loadDefaultOptions = async inputValue => {
        const defaultOptions = await this.loadOptions(inputValue);

        this._isMounted &&
            this.setState({
                defaultOptions
            });
    };

    noResults = value => {
        return value.inputValue !== '' ? 'No results found' : 'Start typing to find results';
    };

    handleChange = (selected, action) => {
        if (action.action === 'select-option') {
            this.props.onItemSelected({
                id: selected.id,
                value: selected.label,
                shared: selected.shared,
                classes: selected.classes
            });
        } else if (action.action === 'create-option') {
            this.props.onNewItemSelected && this.props.onNewItemSelected(selected.label);
        }
    };

    handleInputChange = (inputValue, action) => {
        if (action.action === 'input-change') {
            this.setState({
                inputValue
            });

            if (this.props.onInput) {
                this.props.onInput(null, inputValue);
            }
        } else if (action.action === 'menu-close') {
            this.loadDefaultOptions(this.state.inputValue);
        }
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
                '&>div:first-of-type': {
                    ...(this.props.cssClasses && this.props.cssClasses.includes('form-control-sm') ? { padding: '0 8px !important' } : {})
                },
                whiteSpace: 'nowrap' /* ensure the placeholder is not wrapped when animating the width */
            }),
            container: provided => ({
                ...provided,
                padding: 0,
                height: 'auto',
                borderTopLeftRadius: this.props.disableBorderRadiusLeft ? 0 : 'inherit',
                borderBottomLeftRadius: this.props.disableBorderRadiusLeft ? 0 : 'inherit',
                borderTopRightRadius: this.props.disableBorderRadiusRight ? 0 : 'inherit',
                borderBottomRightRadius: this.props.disableBorderRadiusRight ? 0 : 'inherit',
                background: '#fff'
            }),
            indicatorsContainer: provided => ({
                ...provided,
                cursor: 'pointer',
                '&>div:last-of-type': {
                    ...(this.props.cssClasses && this.props.cssClasses.includes('form-control-sm') ? { padding: '4px !important' } : {})
                }
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
            <StyledAutoCompleteInputFormControl className={`form-control ${this.props.cssClasses ? this.props.cssClasses : 'default'}`}>
                <Select
                    loadOptions={this.loadOptions}
                    noOptionsMessage={this.noResults}
                    onChange={this.handleChange}
                    onInputChange={this.handleInputChange}
                    inputValue={this.state.inputValue}
                    styles={this.customStyles}
                    placeholder={this.props.placeholder}
                    autoFocus
                    cacheOptions
                    defaultOptions={this.state.defaultOptions}
                    onBlur={this.props.onBlur}
                    onKeyDown={this.props.onKeyDown}
                    ref={this.props.innerRef}
                />
            </StyledAutoCompleteInputFormControl>
        );
    }
}

AutoComplete.propTypes = {
    requestUrl: PropTypes.string.isRequired,
    excludeClasses: PropTypes.string,
    optionsClass: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    onItemSelected: PropTypes.func.isRequired,
    allowCreate: PropTypes.bool,
    defaultOptions: PropTypes.array,
    additionalData: PropTypes.array,
    onNewItemSelected: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBlur: PropTypes.func,
    disableBorderRadiusRight: PropTypes.bool,
    disableBorderRadiusLeft: PropTypes.bool,
    onInput: PropTypes.func,
    value: PropTypes.string,
    cssClasses: PropTypes.string,
    hideAfterSelection: PropTypes.bool,
    theme: PropTypes.object.isRequired,
    innerRef: PropTypes.func
};

AutoComplete.defaultProps = {
    cssClasses: ''
};
export default withTheme(AutoComplete);
