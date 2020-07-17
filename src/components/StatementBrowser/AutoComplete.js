import React, { Component } from 'react';
import { submitGetRequest, getResourcesByClass } from 'network';
import PropTypes from 'prop-types';
import Creatable from 'react-select/creatable';
import { AsyncPaginateBase } from 'react-select-async-paginate';
import { components } from 'react-select';
import styled, { withTheme } from 'styled-components';
import NativeListener from 'react-native-listener';

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

const StyledSelectOption = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    .badge {
        background-color: #ebecf0;
        border-radius: 2em;
        color: #172b4d;
        display: inline-block;
        font-size: 12;
        font-weight: normal;
        line-height: '1';
        min-width: 1;
        padding: 0.16666666666667em 0.5em;
        text-align: center;
    }
`;

class AutoComplete extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedItemId: null,
            dropdownMenuJsx: null,
            inputValue: typeof this.props.value !== 'object' ? this.props.value : this.props.value.label,
            defaultOptions: this.props.defaultOptions ? this.props.defaultOptions : [],
            value: this.props.value || '',
            menuIsOpen: false
        };

        this.pageSize = 10;
        this.defaultAdditional = {
            page: 1
        };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onMenuOpen = () => {
        this.setState({ menuIsOpen: true });
    };

    onMenuClose = () => {
        this.setState({ menuIsOpen: false });
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
    };

    loadOptions = async (value, prevOptions, { page }) => {
        try {
            if (!value || value === '' || value.trim() === '') {
                return {
                    options: [],
                    hasMore: false,
                    additional: {
                        page: 1
                    }
                };
            }

            // Add the parameters for pagination
            let queryParams = '&page=' + page + '&items=' + this.pageSize;

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1).trim();
                queryParams = '&exact=true';
            }
            let responseJson;
            if (this.props.optionsClass) {
                responseJson = await getResourcesByClass({ id: this.props.optionsClass, q: value.trim(), page: page, items: this.pageSize });
            } else {
                responseJson = await submitGetRequest(
                    this.props.requestUrl +
                        '?q=' +
                        encodeURIComponent(value.trim()) +
                        queryParams +
                        (this.props.excludeClasses ? '&exclude=' + encodeURIComponent(this.props.excludeClasses) : '')
                );
            }

            responseJson = await this.IdMatch(value.trim(), responseJson);

            if (responseJson.length > this.pageSize) {
                // in case the endpoint doesn't support pagination!
                responseJson = responseJson.slice(0, this.pageSize);
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

            const hasMore = options.length < this.pageSize ? false : true;

            // Add the additionalData only when it's the first page
            if (this.props.additionalData && this.props.additionalData.length > 0 && page === 1) {
                let newProperties = this.props.additionalData;
                newProperties = newProperties.filter(({ label, classes }) => {
                    return (
                        label.toLowerCase().includes(value.trim().toLowerCase()) &&
                        (!this.props.optionsClass || (classes.length > 0 && classes.include?.(this.props.optionsClass)))
                    );
                }); // ensure the label of the new property contains the search value and from the same class

                options.unshift(...newProperties);
            }

            return {
                options,
                hasMore,

                additional: {
                    page: page + 1
                }
            };
        } catch (err) {
            console.error(err);
            return {
                options: prevOptions,
                hasMore: false,
                additional: {
                    page: 1
                }
            };
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
            return inputValue;
        } else if (action.action === 'menu-close') {
            // Next line commented beceause it raises an error when using AsyncPaginate
            //this.loadDefaultOptions(this.state.inputValue);
        }
        return this.state.inputValue; //https://github.com/JedWatson/react-select/issues/3189#issuecomment-597973958
    };

    Control = props => {
        if (this.props.eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        this.props.innerRef.current.focus();
                    }}
                >
                    <components.Control {...props} />
                </NativeListener>
            );
        } else {
            return <components.Control {...props} />;
        }
    };

    DropdownIndicator = props => {
        if (this.props.eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        this.onMenuOpen();
                        this.props.innerRef.current.focus();
                    }}
                >
                    <components.DropdownIndicator {...props} />
                </NativeListener>
            );
        } else {
            return <components.DropdownIndicator {...props} />;
        }
    };

    Option = ({ children, ...props }) => {
        if (this.props.eventListener) {
            return (
                <NativeListener
                    onMouseDown={e => {
                        this.props.onChange(props.data);
                    }}
                >
                    <components.Option {...props}>
                        <StyledSelectOption>
                            <span>{children}</span>
                            <span className="badge">{props.data.id}</span>
                        </StyledSelectOption>
                    </components.Option>
                </NativeListener>
            );
        } else {
            return (
                <components.Option {...props}>
                    <StyledSelectOption>
                        <span>{children}</span>
                        <span className="badge">{props.data.id}</span>
                    </StyledSelectOption>
                </components.Option>
            );
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

        // Creatable with adding new options : https://codesandbox.io/s/6pznz
        const Select = this.props.allowCreate ? Creatable : undefined;

        return (
            <StyledAutoCompleteInputFormControl className={`form-control ${this.props.cssClasses ? this.props.cssClasses : 'default'}`}>
                <AsyncPaginateBase
                    SelectComponent={Select}
                    value={this.props.value}
                    loadOptions={this.loadOptions}
                    additional={this.defaultAdditional}
                    noOptionsMessage={this.noResults}
                    onChange={this.props.onChange ? this.props.onChange : this.handleChange}
                    onInputChange={this.handleInputChange}
                    inputValue={this.state.inputValue || ''}
                    styles={this.customStyles}
                    placeholder={this.props.placeholder}
                    autoFocus
                    cacheOptions
                    defaultOptions={this.state.defaultOptions}
                    onBlur={this.props.onBlur}
                    onKeyDown={this.props.onKeyDown}
                    selectRef={this.props.innerRef}
                    components={{ Option: this.Option, Control: this.Control, DropdownIndicator: this.DropdownIndicator }}
                    menuIsOpen={this.state.menuIsOpen}
                    onMenuOpen={this.onMenuOpen}
                    onMenuClose={this.onMenuClose}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
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
    onItemSelected: PropTypes.func,
    onChange: PropTypes.func,
    allowCreate: PropTypes.bool,
    defaultOptions: PropTypes.array,
    additionalData: PropTypes.array,
    onNewItemSelected: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBlur: PropTypes.func,
    disableBorderRadiusRight: PropTypes.bool,
    disableBorderRadiusLeft: PropTypes.bool,
    onInput: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    cssClasses: PropTypes.string,
    hideAfterSelection: PropTypes.bool,
    theme: PropTypes.object.isRequired,
    innerRef: PropTypes.func,
    eventListener: PropTypes.bool // Used to capture the events in handsontable
};

AutoComplete.defaultProps = {
    cssClasses: '',
    eventListener: false
};
export default withTheme(AutoComplete);
