import React, { useState, useCallback } from 'react';
import { InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard, faLink } from '@fortawesome/free-solid-svg-icons';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { submitGetRequest, getResourcesByClass } from 'network';
import { AsyncPaginateBase } from 'react-select-async-paginate';
import { classesUrl } from 'network';
import Creatable from 'react-select/creatable';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import { compareOption } from 'utils';
import styled, { withTheme } from 'styled-components';
import getExternalData from './3rdPartyRegistries/index';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Tippy from '@tippy.js/react';
import REGEX from 'constants/regex';
import NativeListener from 'react-native-listener';
import CustomOption from './CustomOption';

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

function Autocomplete(props) {
    const [inputValue, setInputValue] = useState(typeof props.value !== 'object' || props.value === null ? props.value : props.value.label);
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    // Pagination params
    const pageSize = 10;
    const defaultAdditional = {
        page: 1
    };

    /**
     * Get Node by ID if the value starts with '#'
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @return {Array} The exact match of the ID if it exist followed by the current result
     */
    const IdMatch = async (value, prevOptions) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);
            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;
                try {
                    responseJsonExact = await submitGetRequest(props.requestUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }
                if (responseJsonExact) {
                    prevOptions.unshift(responseJsonExact);
                }
            }
        }
        return prevOptions;
    };

    /**
     * Lookup in ORKG backend
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @return {Array} The list of loaded options
     */
    const InternalORKGLookup = async (value, page) => {
        // Add the parameters for pagination
        let queryParams = '&page=' + page + '&items=' + pageSize;

        if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
            value = value.substring(1, value.length - 1).trim();
            queryParams = '&exact=true';
        }
        let responseJson;
        if (props.optionsClass) {
            responseJson = await getResourcesByClass({ id: props.optionsClass, q: value.trim(), page: page, items: pageSize });
        } else {
            const isURI = new RegExp(REGEX.URL).test(value.trim());
            if (props.requestUrl === classesUrl && isURI) {
                // Lookup a class by uri
                try {
                    responseJson = await submitGetRequest(
                        props.requestUrl +
                            '?uri=' +
                            encodeURIComponent(value.trim()) +
                            queryParams +
                            (props.excludeClasses ? '&exclude=' + encodeURIComponent(props.excludeClasses) : '')
                    );
                } catch (error) {
                    // No matching class
                    return [];
                }
                responseJson = responseJson ? [responseJson] : [];
            } else {
                responseJson = await submitGetRequest(
                    props.requestUrl +
                        '?q=' +
                        encodeURIComponent(value.trim()) +
                        queryParams +
                        (props.excludeClasses ? '&exclude=' + encodeURIComponent(props.excludeClasses) : '')
                );
            }
        }
        return responseJson;
    };

    /**
     * Add Additional data
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @return {Array} The list of loaded options including the  additionalData in the beginning it's the first page
     */
    const AddAdditionalData = (value, prevOptions, page) => {
        if (props.additionalData && props.additionalData.length > 0 && page === 1) {
            let additionalOptions = props.additionalData;
            additionalOptions = additionalOptions.filter(({ label, classes }) => {
                return (
                    label.toLowerCase().includes(value.trim().toLowerCase()) &&
                    (!props.optionsClass || (classes.length > 0 && classes.includes?.(props.optionsClass)))
                );
            }); // ensure the label of the new property contains the search value and from the same class

            prevOptions.unshift(...additionalOptions);
        }
        return prevOptions;
    };

    /**
     * Load select options
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @param {Number} Object.page Current page number
     * @return {Array} Object.options the list of loaded options
     * @return {Boolean} Object.hasMore To detect end of options list for current search
     * @return {Number} Object.Object.page Next page number
     */
    const loadOptions = async (value, prevOptions, { page }) => {
        try {
            const defaultOpts = props.defaultOptions ?? true;
            if ((!value || value === '' || value.trim() === '') && (!defaultOpts || !props.autoLoadOption)) {
                // if default options is disabled return empty result
                return {
                    options: [],
                    hasMore: false,
                    additional: {
                        page: 1
                    }
                };
            }

            let responseJson = await InternalORKGLookup(value, page);

            responseJson = await IdMatch(value.trim(), responseJson);

            if (responseJson.length > pageSize) {
                // in case the endpoint doesn't support pagination!
                responseJson = responseJson.slice(0, pageSize);
            }

            let options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id,
                    ...(item.uri ? { uri: item.uri } : {}),
                    ...(item.shared ? { shared: item.shared } : {}),
                    ...(item.classes ? { classes: item.classes } : {}),
                    ...(item.description ? { description: item.description } : {})
                })
            );

            const hasMore = options.length < pageSize ? false : true;

            options = AddAdditionalData(value, options, page);

            // Add resources from third party registries
            if (!hasMore && props.optionsClass) {
                options = await getExternalData(value, options, props.optionsClass);
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

    /**
     * Text to display when there are no options
     *
     * @param {String} value Search input
     * @return {String} Text to display when there are no options
     */
    const noResults = value => {
        return value.inputValue !== '' ? 'No results found' : 'Start typing to find results';
    };

    /**
     * Handle change events on the select
     *
     * @param {Object} selected Selected option
     * @param {String} Object.action Change action, one of : "select-option","deselect-option", "remove-value", "pop-value", "set-value", "clear", "create-option"
     */
    const handleChange = (selected, { action }) => {
        if (action === 'select-option') {
            props.onItemSelected({
                id: selected.id,
                value: selected.label,
                shared: selected.shared,
                classes: selected.classes,
                external: selected.external ?? false,
                statements: selected.statements
            });
            setInputValue('');
        } else if (action === 'create-option') {
            props.onNewItemSelected && props.onNewItemSelected(selected.label);
        }
    };

    /**
     * Handle change events on the input
     *
     * @param {String} inputValue Input value
     * @param {String} Object.action Change action, one of :"set-value", "input-change", "input-blur", "menu-close"
     */
    const handleInputChange = (inputValue, { action }) => {
        if (action === 'input-change') {
            setInputValue(inputValue);

            if (props.onInput) {
                props.onInput(null, inputValue);
            }
            return inputValue;
        } else if (action === 'menu-close') {
            // Next line commented beceause it raises an error when using AsyncPaginate
            //this.loadDefaultOptions(this.state.inputValue);
        }
        return inputValue; //https://github.com/JedWatson/react-select/issues/3189#issuecomment-597973958
    };

    /**
     * Handle click on copy to clipboard button
     *
     */
    const handleCopyClick = () => {
        if (navigator.clipboard && props.value && props.value.label) {
            navigator.clipboard.writeText(props.value.label);
            toast.success('Value copied');
        }
    };

    const Control = useCallback(innerProps => {
        if (props.eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        props.innerRef.current.focus();
                    }}
                >
                    <components.Control {...innerProps} />
                </NativeListener>
            );
        } else {
            return <components.Control {...innerProps} />;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const DropdownIndicator = useCallback(innerProps => {
        if (props.eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        setMenuIsOpen(true);
                        props.innerRef.current.focus();
                    }}
                >
                    <components.DropdownIndicator {...innerProps} />
                </NativeListener>
            );
        } else {
            return <components.DropdownIndicator {...innerProps} />;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const Option = useCallback(({ children, ...innerProps }) => {
        if (props.eventListener) {
            return (
                <NativeListener
                    onMouseDown={e => {
                        props.onChange(innerProps.data);
                    }}
                >
                    <CustomOption {...innerProps}>{children}</CustomOption>
                </NativeListener>
            );
        } else {
            return <CustomOption {...innerProps}>{children}</CustomOption>;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: props.theme.inputBg,
            boxShadow: state.isFocused ? 0 : 0,
            border: 0,
            paddingLeft: 0,
            paddingRight: 0,
            cursor: 'text',
            minHeight: 'initial',
            borderRadius: 'inherit',
            '&>div:first-of-type': {
                ...(props.cssClasses && props.cssClasses.includes('form-control-sm') ? { padding: '0 8px !important' } : {})
            },
            whiteSpace: 'nowrap' /* ensure the placeholder is not wrapped when animating the width */
        }),
        container: provided => ({
            ...provided,
            padding: 0,
            height: 'auto',
            borderTopLeftRadius: props.disableBorderRadiusLeft ? 0 : 'inherit',
            borderBottomLeftRadius: props.disableBorderRadiusLeft ? 0 : 'inherit',
            borderTopRightRadius: props.disableBorderRadiusRight ? 0 : 'inherit',
            borderBottomRightRadius: props.disableBorderRadiusRight ? 0 : 'inherit',
            background: '#fff'
        }),
        indicatorsContainer: provided => ({
            ...provided,
            cursor: 'pointer',
            '&>div:last-of-type': {
                // openMenu buttons
                ...(props.cssClasses && props.cssClasses.includes('form-control-sm') ? { padding: '4px !important' } : {})
            },
            '&>div:nth-last-of-type(2)': {
                // clear button
                ...(props.cssClasses && props.cssClasses.includes('form-control-sm') && !props.isDisabled && props.isClearable
                    ? { padding: '4px !important' }
                    : {})
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
        }),
        input: provided => ({
            ...provided, // custom style to fix when the input field doesn't get the full width
            display: 'flex',
            flex: '1',
            '& > div': {
                flex: '1',
                display: 'flex !important'
            },
            '& input': {
                flex: '1'
            }
        }),
        multiValueRemove: provided => ({
            ...provided,
            cursor: 'pointer'
        })
    };

    // Creatable with adding new options : https://codesandbox.io/s/6pznz
    const Select = props.allowCreate ? Creatable : undefined;

    return (
        <ConditionalWrapper
            condition={props.copyValueButton}
            wrapper={children => (
                <InputGroup size="sm">
                    {children}
                    {props.value && props.value.id && (
                        <InputGroupAddon addonType="append">
                            <Button disabled={!props.value || !props.value.label} onClick={handleCopyClick} outline>
                                <Tippy content="Copy the label to clipboard">
                                    <span>
                                        <Icon icon={faClipboard} size="sm" />
                                    </span>
                                </Tippy>
                            </Button>
                            {props.linkButton && (
                                <Link target="_blank" to={props.linkButton} className="btn btn-sm btn-outline-secondary align-items-center d-flex">
                                    <Tippy content={props.linkButtonTippy}>
                                        <span>
                                            <Icon icon={faLink} size="sm" />
                                        </span>
                                    </Tippy>
                                </Link>
                            )}
                        </InputGroupAddon>
                    )}
                </InputGroup>
            )}
        >
            <StyledAutoCompleteInputFormControl className={`form-control ${props.cssClasses ? props.cssClasses : 'default'}`}>
                <AsyncPaginateBase
                    SelectComponent={Select}
                    value={props.value}
                    loadOptions={loadOptions}
                    additional={defaultAdditional}
                    noOptionsMessage={noResults}
                    onChange={
                        props.onChange
                            ? (select, action) => {
                                  props.onChange(select, action);
                                  setInputValue('');
                              }
                            : handleChange
                    }
                    onInputChange={handleInputChange}
                    inputValue={inputValue || ''}
                    styles={customStyles}
                    placeholder={props.placeholder}
                    autoFocus={props.autoFocus}
                    cacheOptions
                    defaultOptions={props.defaultOptions ?? true}
                    openMenuOnFocus={props.openMenuOnFocus}
                    onBlur={props.onBlur}
                    onKeyDown={props.onKeyDown}
                    selectRef={props.innerRef}
                    components={{ Option: Option, Control: Control, DropdownIndicator: DropdownIndicator }}
                    menuIsOpen={menuIsOpen}
                    onMenuOpen={() => setMenuIsOpen(true)}
                    onMenuClose={() => setMenuIsOpen(false)}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    isClearable={props.isClearable}
                    isDisabled={props.isDisabled}
                    isMulti={props.isMulti}
                    isValidNewOption={(inputValue, selectValue, selectOptions) => {
                        if (props.handleCreateExistingLabel) {
                            // to disable the create button
                            props.handleCreateExistingLabel(inputValue, selectOptions);
                        }
                        if (!props.allowCreate) {
                            return false;
                        } else {
                            return !(
                                !inputValue ||
                                selectValue.some(option => compareOption(inputValue, option)) ||
                                selectOptions.some(option => compareOption(inputValue, option))
                            );
                        }
                    }}
                />
            </StyledAutoCompleteInputFormControl>
        </ConditionalWrapper>
    );
}

Autocomplete.propTypes = {
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
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
    cssClasses: PropTypes.string,
    theme: PropTypes.object.isRequired,
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
    autoLoadOption: PropTypes.bool, // Used to loadOptions by default
    openMenuOnFocus: PropTypes.bool, // whether the menu is opened when the Select is focused
    eventListener: PropTypes.bool, // Used to capture the events in handsontable
    handleCreateExistingLabel: PropTypes.func,
    isClearable: PropTypes.bool,
    isDisabled: PropTypes.bool,
    copyValueButton: PropTypes.bool,
    linkButton: PropTypes.string,
    linkButtonTippy: PropTypes.string,
    isMulti: PropTypes.bool,
    autoFocus: PropTypes.bool
};

Autocomplete.defaultProps = {
    cssClasses: '',
    eventListener: false,
    openMenuOnFocus: false,
    isClearable: false,
    isDisabled: false,
    copyValueButton: false,
    linkButton: null,
    isMulti: false,
    autoFocus: true
};
export default withTheme(Autocomplete);
