import { faClipboard, faGear, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import getExternalData from 'components/Autocomplete/3rdPartyRegistries/index';
import CustomOption from 'components/Autocomplete/CustomOption';
import OntologiesModal from 'components/Autocomplete/OntologiesModal';
import TreeSelector from 'components/Autocomplete/TreeSelector';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import Link from 'components/NextJsMigration/Link';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import NativeListener from 'react-native-listener';
import { components } from 'react-select';
import { AsyncPaginate, withAsyncPaginate } from 'react-select-async-paginate';
import Creatable from 'react-select/creatable';
import { toast } from 'react-toastify';
import { Badge, Button, InputGroup } from 'reactstrap';
import { createClass, getClasses } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { getEntities, getEntity } from 'services/backend/misc';
import { createPredicate, getPredicate } from 'services/backend/predicates';
import { createResource, getResource, getResources } from 'services/backend/resources';
import { createLiteralStatement } from 'services/backend/statements';
import { getAllOntologies, getOntologyTerms, getTermMatchingAcrossOntologies, olsBaseUrl, selectTerms } from 'services/ols/index';
import styled, { withTheme } from 'styled-components';
import { asyncLocalStorage, compareOption } from 'utils';
import { MAX_LENGTH_INPUT } from 'constants/misc';

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

export const StyledMenuListHeader = styled.div`
    background-color: #f3f5f9 !important;
    border-bottom: 1px solid #f3f5f9;
    color: #5b6987;
    border-radius: 0 0 8px 8px;
    font-size: 12px;
    line-height: 12px;
    cursor: default;
`;

const STORAGE_NAME = 'autocomplete-sources';

export const DEFAULT_SOURCES = [
    { external: false, id: 'ORKG', label: 'Open Research Knowledge Graph', ontologyId: 'orkg', uri: 'http://orkg.org' },
    { external: false, id: 'Wikidata', label: 'Wikidata', ontologyId: 'wikidata', uri: 'http://wikidata.org' },
    { external: false, id: 'GeoNames', label: 'GeoNames', ontologyId: 'geonames', uri: 'http://geonames.org' },
];

const Autocomplete = ({
    value,
    cssClasses = '',
    eventListener = false,
    openMenuOnFocus = false,
    isClearable = false,
    isDisabled = false,
    copyValueButton = false,
    linkButton = null,
    isMulti = false,
    autoFocus = true,
    ols = true,
    inputGroup = true,
    inputId = null,
    inputValue: inputValueProp = null,
    menuPortalTarget = null,
    allowCreateDuplicate = false,
    cacheOptions = false,
    fixedOptions = [],
    showTreeSelector = false,
    placeholder = '',
    onChangeInputValue,
    entityType,
    onOntologySelectorIsOpenStatusChange,
    excludeClasses,
    optionsClass,
    onKeyDown,
    additionalData,
    defaultOptions,
    requestUrl,
    autoLoadOption,
    onChange,
    onItemSelected,
    onNewItemSelected,
    onInput,
    innerRef,
    theme,
    disableBorderRadiusLeft,
    onBlur,
    disableBorderRadiusRight,
    allowCreate,
    linkButtonTippy,
    handleCreateExistingLabel,
}) => {
    const [inputValue, setInputValue] = useState(typeof value !== 'object' || value === null ? value : null);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [ontologySelectorIsOpen, setOntologySelectorIsOpen] = useState(false);

    const [selectedOntologies, setSelectedOntologies] = useState(DEFAULT_SOURCES);

    // Pagination params
    const PAGE_SIZE = 3;
    const defaultAdditional = {
        page: 0,
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
                    responseJsonExact = await getEntity(entityType, valueWithoutHashtag);
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

    useEffect(() => {
        if (onChangeInputValue) {
            onChangeInputValue(inputValue);
        }
    }, [inputValue]);

    // support for setting the inputValue via the props
    useEffect(() => {
        if (inputValueProp !== null) {
            setInputValue(inputValueProp);
        }
    }, [inputValueProp]);

    // reset the value input if the selected value is null
    useEffect(() => {
        if (value === null) {
            setInputValue('');
        }
    }, [value]);

    useEffect(() => {
        const getSources = async () => {
            const data = await asyncLocalStorage.getItem(STORAGE_NAME);
            try {
                const parsedData = JSON.parse(data);
                if (data && Array.isArray(parsedData)) {
                    setSelectedOntologies(parsedData);
                }
            } catch (e) {}
        };
        getSources();
    }, []);

    // in contribution editor we need to know the status of the modal because we are using useClickAway to trigger save
    useEffect(() => {
        onOntologySelectorIsOpenStatusChange?.(ontologySelectorIsOpen);
    }, [onOntologySelectorIsOpenStatusChange, ontologySelectorIsOpen]);

    useEffect(() => {
        if (!isEqual(DEFAULT_SOURCES, selectedOntologies)) {
            asyncLocalStorage.setItem(STORAGE_NAME, JSON.stringify(selectedOntologies));
        } else {
            asyncLocalStorage.removeItem(STORAGE_NAME);
        }
    }, [selectedOntologies]);

    // Support home and end keys for text Input
    const handleKeyDown = evt => {
        if (evt.key === 'Home') {
            evt.preventDefault();
            if (evt.shiftKey) {
                evt.target.selectionStart = 0;
            } else {
                evt.target.setSelectionRange(0, 0);
            }
        }
        if (evt.key === 'End') {
            evt.preventDefault();
            const len = evt.target.value.length;
            if (evt.shiftKey) {
                evt.target.selectionEnd = len;
            } else {
                evt.target.setSelectionRange(len, len);
            }
        }
        onKeyDown?.(evt);
    };

    /**
     * Lookup in ORKG backend
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @return {Array} The list of loaded options
     */
    // eslint-disable-next-line no-shadow
    const orkgLookup = async (value, page) => {
        const exact = !!(value.startsWith('"') && value.endsWith('"') && value.length > 2);
        if (exact) {
            // eslint-disable-next-line no-param-reassign
            value = value.substring(1, value.length - 1).trim();
        }
        let responseJson;
        if (optionsClass) {
            responseJson = await getResources({ include: [optionsClass], q: value?.trim(), page, size: PAGE_SIZE, exact });
        } else {
            const isURI = new RegExp(REGEX.URL).test(value.trim());
            if (entityType === ENTITIES.CLASS && isURI) {
                // Lookup a class by uri
                try {
                    responseJson = await getClasses({
                        page,
                        size: PAGE_SIZE,
                        exact,
                        uri: value.trim(),
                    });
                } catch (error) {
                    // No matching class
                    return { content: [], last: true, totalElements: 0 };
                }
                responseJson = responseJson
                    ? { content: [responseJson], last: true, totalElements: 1 }
                    : { content: [], last: true, totalElements: 0 };
            } else {
                responseJson = await getEntities(entityType, {
                    page,
                    size: PAGE_SIZE,
                    q: value?.trim(),
                    exclude: excludeClasses?.length ? [excludeClasses] : null,
                    exact,
                });
            }
        }
        return responseJson;
    };

    /**
     * Lookup for an ontology
     *
     * @param {String} value Search input
     * @param {Array} page Page number
     * @return {Array} The list of ontologies
     */
    const OntologyLookup = async (value, page) => {
        if (value) {
            try {
                return await selectTerms({ page, PAGE_SIZE, type: 'ontology', q: encodeURIComponent(value.trim()) });
            } catch (error) {
                // No matching class
                return { content: [], last: true, totalElements: 0 };
            }
        } else {
            // List all ontologies
            try {
                return await getAllOntologies({ page, PAGE_SIZE });
            } catch (error) {
                // No matching class
                return { content: [], last: true, totalElements: 0 };
            }
        }
    };

    /**
     * Lookup for an ontology
     *
     * @param {String} value Search input
     * @param {Array} page Page number
     * @return {Array} The list of classes or properties
     */
    const olsLookup = async (value, page) => {
        if (value) {
            const classes = {
                [ENTITIES.CLASS]: 'class',
                [ENTITIES.PREDICATE]: 'property',
                default: 'individual',
            };
            try {
                return await selectTerms({
                    page,
                    pageSize: PAGE_SIZE,
                    type: classes[entityType] || classes.default,
                    q: encodeURIComponent(value.trim()),
                    ontology: selectedOntologies
                        ? selectedOntologies
                              .filter(c => c.ontologyId !== 'orkg' && c.ontologyId !== 'wikidata')
                              ?.map(o => o.ontologyId.replace(':', ''))
                              .join(',')
                        : null ?? null,
                });
            } catch (error) {
                // No matching class
                return { content: [], last: true, totalElements: 0 };
            }
        } else {
            // list all external classes
            try {
                if (
                    selectedOntologies.filter(c => c.ontologyId !== 'orkg' && c.ontologyId !== 'wikidata') &&
                    selectedOntologies.filter(c => c.ontologyId !== 'orkg' && c.ontologyId !== 'wikidata').length > 0
                ) {
                    return await getOntologyTerms({
                        ontology_id:
                            selectedOntologies
                                .filter(c => c.ontologyId !== 'orkg' && c.ontologyId !== 'wikidata')
                                ?.map(s => s.ontologyId.replace(':', ''))[0] ?? '',
                        page,
                        PAGE_SIZE,
                    });
                }
                return await getTermMatchingAcrossOntologies({
                    page,
                    PAGE_SIZE,
                });
            } catch (error) {
                // No matching class
                return { content: [], last: true, totalElements: 0 };
            }
        }
    };

    /**
     * Add Additional data
     *
     * @param {String} value Search input
     * @param {Array} prevOptions Loaded options for current search.
     * @return {Array} The list of loaded options including the  additionalData in the beginning it's the first page
     */
    const AddAdditionalData = (value, prevOptions, page) => {
        if (additionalData && additionalData.length > 0 && page === 0) {
            let additionalOptions = additionalData;
            additionalOptions = additionalOptions.filter(
                ({ label, classes }) =>
                    label.toLowerCase().includes(value.trim().toLowerCase()) &&
                    (!optionsClass || (classes.length > 0 && classes.includes?.(optionsClass))),
            ); // ensure the label of the new property contains the search value and from the same class

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
            const defaultOpts = defaultOptions ?? true;
            if ((!value || value === '' || value.trim() === '') && (!defaultOpts || !autoLoadOption)) {
                // if default options is disabled return empty result
                return {
                    options: [],
                    hasMore: false,
                    additional: {
                        page: 0,
                    },
                };
            }

            let responseItems = [];
            let hasMore = false;

            if (requestUrl === olsBaseUrl) {
                const result = await OntologyLookup(value, page);
                responseItems = result.content;
                hasMore = !result.last;
            } else {
                if (selectedOntologies.find(ontology => ontology.id === 'ORKG') || optionsClass) {
                    const orkgResponseItems = await orkgLookup(value, page);
                    responseItems.push(...(orkgResponseItems?.content ?? []));

                    // TODO: check if this this is still needed?
                    if (responseItems.length > PAGE_SIZE) {
                        // in case the endpoint doesn't support pagination!
                        responseItems = responseItems.slice(0, PAGE_SIZE);
                    }
                    hasMore = !orkgResponseItems.last;
                }
                if (
                    selectedOntologies.filter(ontology => ontology.id !== 'ORKG' && ontology.id !== 'Wikidata' && ontology.id !== 'GeoNames').length >
                        0 ||
                    entityType === ENTITIES.CLASS
                ) {
                    const olsResponseItems = await olsLookup(value, page);
                    responseItems.push(...(olsResponseItems?.content ?? []));
                    hasMore = hasMore || !olsResponseItems.last;
                }

                if (page === 0) {
                    responseItems = await IdMatch(value.trim(), responseItems);
                }
            }

            let options = [];

            responseItems.map(item =>
                options.push({
                    ...item,
                    ...(item.uri ? { uri: item.uri } : {}),
                    ...(item.shared ? { shared: item.shared } : {}),
                    ...(item.classes ? { classes: item.classes } : {}),
                    ...(item.description ? { description: item.description } : {}),
                    ...(item.ontologyId ? { ontologyId: item.ontologyId } : {}), // for ontology lookup
                    external: !!item.external,
                }),
            );

            options = AddAdditionalData(value, options, page);

            // Add resources from third party registries
            // get ExternalData only when ols is true or the optionsClass exist
            // to load data from Geonames in case of optionsClass set to Location
            if (requestUrl !== olsBaseUrl && (ols || optionsClass)) {
                try {
                    const promises = await Promise.all(
                        getExternalData({
                            value,
                            page,
                            pageSize: PAGE_SIZE,
                            options,
                            optionsClass,
                            entityType,
                            selectedOntologies: ols ? selectedOntologies : [],
                        }),
                    );
                    for (const data of promises) {
                        options = [...options, ...data.options];
                        hasMore = hasMore || data.hasMore;
                    }
                } catch (e) {}
            }
            return {
                options,
                hasMore,
                additional: {
                    page: page + 1,
                },
            };
        } catch (err) {
            console.error(err);
            return {
                options: prevOptions,
                hasMore: false,
                additional: {
                    page: 0,
                },
            };
        }
    };

    /**
     * Text to display when there are no options
     *
     * @param {String} value Search input
     * @return {String} Text to display when there are no options
     */
    const noResults = value => (value.inputValue !== '' ? 'No results found' : 'Start typing to find results');

    /**
     * Handle selecting external class
     *
     * @param {Object} selected Selected option
     * @param {String} Object.action Change action, one of : "select-option","deselect-option", "remove-value", "pop-value", "set-value", "clear", "create-option"
     */
    const handleExternalSelect = async (selected, action) => {
        if (
            entityType === ENTITIES.CLASS &&
            action.action === 'select-option' &&
            ((!action.option && selected.external) || (action.option && action.option.external))
        ) {
            let foundIndex;
            if (isMulti) {
                foundIndex = selected.findIndex(x => x.id === action.option.id);
            }
            try {
                const internalClass = await getClasses({
                    uri: isMulti ? action.option.uri.trim() : selected.uri.trim(),
                });
                if (isMulti) {
                    selected[foundIndex] = internalClass;
                } else {
                    selected = internalClass;
                }
            } catch (error) {
                const n = isMulti ? action.option : selected;
                const newClass = await createClass(n.label, n.uri ? n.uri : null);
                if (n.description && n.description.trim() !== '') {
                    const descriptionLiteral = await createLiteral(n.description);
                    createLiteralStatement(newClass.id, PREDICATES.DESCRIPTION, descriptionLiteral.id);
                }
                if (isMulti) {
                    selected[foundIndex] = newClass;
                } else {
                    selected = newClass;
                }
            }
            onChange(selected, action);
        } else {
            onChange(selected, action);
        }
    };

    const findOrCreateProperty = async ({ id, label, description, sameAsUri }) => {
        let property;
        try {
            property = await getPredicate(id);
        } catch (e) {
            property = await createPredicate(label, id);
            if (sameAsUri) {
                createLiteralStatement(property.id, PREDICATES.SAME_AS, (await createLiteral(sameAsUri)).id);
            }
            if (description) {
                createLiteralStatement(property.id, PREDICATES.DESCRIPTION, (await createLiteral(description)).id);
            }
        }
        return property;
    };

    const findOrCreateResource = async ({ id, label, description, sameAsUri }) => {
        let resource;
        try {
            resource = await getResource(id);
        } catch (e) {
            resource = await createResource(label, [CLASSES.EXTERNAL], id);
            if (sameAsUri) {
                createLiteralStatement(resource.id, PREDICATES.SAME_AS, (await createLiteral(sameAsUri)).id);
            }
            if (description) {
                createLiteralStatement(resource.id, PREDICATES.DESCRIPTION, (await createLiteral(description)).id);
            }
        }
        return resource;
    };

    /**
     * Handle change events on the select
     *
     * @param {Object} selected Selected option
     * @param {String} Object.action Change action, one of : "select-option","deselect-option", "remove-value", "pop-value", "set-value", "clear", "create-option"
     */
    const handleChange = async (selected, { action }) => {
        if (action === 'select-option') {
            let id;
            let label;
            let description;
            let sameAsUri;

            if (selected.source === 'wikidata-api') {
                id = `wikidata:${selected.id}`;
                label = selected.label;
                sameAsUri = `https://www.wikidata.org/entity/${selected.id}`;
            } else if (selected.source === 'ols-api') {
                id = `${selected.ontology}:${selected.shortForm}`;
                label = selected.label;
                description = selected.description;
                sameAsUri = selected.uri;
            }
            if (selected.source === 'wikidata-api' || selected.source === 'ols-api') {
                let resource;
                if (entityType === ENTITIES.RESOURCE) {
                    resource = await findOrCreateResource({ id, label, description, sameAsUri });
                } else if (entityType === ENTITIES.PREDICATE) {
                    resource = await findOrCreateProperty({ id, label, description, sameAsUri });
                }
                onItemSelected({
                    id: resource.id,
                    value: resource.label,
                    shared: resource.shared,
                    classes: resource.classes,
                    external: false,
                    statements: [],
                });
            } else {
                onItemSelected({
                    id: selected.id,
                    value: selected.label,
                    shared: selected.shared,
                    classes: selected.classes,
                    external: selected.external ?? false,
                    statements: selected.statements,
                });
            }

            setInputValue('');
        } else if (action === 'create-option') {
            onNewItemSelected && onNewItemSelected(selected.label);
            setInputValue('');
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

            if (onInput) {
                onInput(null, inputValue);
            }
            return inputValue;
        }
        if (action === 'menu-close') {
            // Next line commented beceause it raises an error when using AsyncPaginate
            // this.loadDefaultOptions(this.state.inputValue);
        }
        return inputValue; // https://github.com/JedWatson/react-select/issues/3189#issuecomment-597973958
    };

    /**
     * Handle click on copy to clipboard button
     *
     */
    const handleCopyClick = () => {
        if (navigator.clipboard && value && value.id) {
            navigator.clipboard.writeText(value.id);
            toast.success('ID copied to clipboard');
        }
    };

    const Control = useCallback(innerProps => {
        if (eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        innerRef.current.focus();
                    }}
                >
                    <components.Control {...innerProps} />
                </NativeListener>
            );
        }
        return <components.Control {...innerProps} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const DropdownIndicator = useCallback(innerProps => {
        if (eventListener) {
            return (
                <NativeListener
                    onMouseUp={e => {
                        e.stopPropagation();
                        setMenuIsOpen(true);
                        innerRef.current.focus();
                    }}
                >
                    <components.DropdownIndicator {...innerProps} />
                </NativeListener>
            );
        }
        return <components.DropdownIndicator {...innerProps} />;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const Menu = useCallback(
        ({ children, ...innerProps }) => (
            <components.Menu {...innerProps}>
                <div>{children}</div>
                {ols && (
                    <StyledMenuListHeader className="d-flex justify-content-between align-items-center p-1 d-flex">
                        <div className="d-flex align-items-center">
                            <div className="ps-2 align-items-center d-flex">
                                Sources
                                <div className="overflow-hidden">
                                    {selectedOntologies.map(ontology => (
                                        <Tippy
                                            key={ontology.id}
                                            content={
                                                <div className="text-break">
                                                    <strong>Label:</strong> {ontology.label} <br />
                                                    <strong>URI:</strong> {ontology.uri}
                                                </div>
                                            }
                                        >
                                            <span>
                                                <Badge color="light-darker text-black ms-2 rounded-pill" size="sm" style={{ marginBottom: 2 }}>
                                                    {ontology.id}
                                                </Badge>
                                            </span>
                                        </Tippy>
                                    ))}
                                </div>
                            </div>
                            {requestUrl !== olsBaseUrl && (
                                <Tippy content="Select sources">
                                    <span>
                                        <Button
                                            color="light-darker"
                                            className="px-2 py-0 ms-2"
                                            onClick={() => setOntologySelectorIsOpen(v => !v)}
                                            size="sm"
                                        >
                                            <Icon icon={faGear} size="sm" />
                                        </Button>
                                    </span>
                                </Tippy>
                            )}
                        </div>
                    </StyledMenuListHeader>
                )}
            </components.Menu>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedOntologies.map(o => o.id).join(','), inputValue, ols],
    );

    const Option = useCallback(({ children, ...innerProps }) => {
        if (eventListener) {
            return (
                <NativeListener
                    onMouseDown={e => {
                        onChange(innerProps.data);
                    }}
                >
                    <CustomOption {...innerProps}>{children}</CustomOption>
                </NativeListener>
            );
        }
        return <CustomOption {...innerProps}>{children}</CustomOption>;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: theme.inputBg,
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(232, 97, 97, 0.25)' : 0, // color are hardcoded to match bootstrap computed styling
            borderColor: state.isFocused ? '#f8d0d0!important' : '#ced4da!important', // same here
            paddingLeft: 0,
            paddingRight: 0,
            cursor: 'text',
            minHeight: 'initial',
            borderRadius: 'inherit',
            '&>div:first-of-type': {
                ...(cssClasses && cssClasses.includes('form-control-sm') ? { padding: '0 8px !important' } : {}),
            },
            whiteSpace: 'nowrap' /* ensure the placeholder is not wrapped when animating the width */,
        }),
        container: provided => ({
            ...provided,
            padding: 0,
            height: 'auto',
            borderTopLeftRadius: disableBorderRadiusLeft ? 0 : 'inherit',
            borderBottomLeftRadius: disableBorderRadiusLeft ? 0 : 'inherit',
            borderTopRightRadius: disableBorderRadiusRight ? 0 : 'inherit',
            borderBottomRightRadius: disableBorderRadiusRight ? 0 : 'inherit',
            background: '#fff',
        }),
        indicatorsContainer: provided => ({
            ...provided,
            cursor: 'pointer',
            '&>div:last-of-type': {
                // openMenu buttons
                ...(cssClasses && cssClasses.includes('form-control-sm') ? { padding: '4px !important' } : {}),
            },
            '&>div:nth-last-of-type(2)': {
                // clear button
                ...(cssClasses && cssClasses.includes('form-control-sm') && !isDisabled && isClearable ? { padding: '4px !important' } : {}),
            },
        }),
        menu: provided => ({
            ...provided,
            zIndex: 10,
            fontSize: '0.875rem',
            width: 'max-content', // making sure the menu can be wider than the input size
            minWidth: '100%',
            maxWidth: 700,
        }),
        option: provided => ({
            ...provided,
            cursor: 'pointer',
            whiteSpace: 'normal',
            padding: 0,
        }),
        multiValueLabel: (provided, state) => ({
            ...provided,
            ...(state.data.isFixed ? { paddingRight: '6px' } : {}),
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            ...(state.data.isFixed ? { display: 'none' } : {}),
            cursor: 'pointer',
        }),
        input: provided => ({
            ...provided,
            visibility: 'visible',
        }),
    };

    // Creatable with adding new options : https://codesandbox.io/s/6pznz
    const Select = useMemo(() => (allowCreate ? withAsyncPaginate(Creatable) : AsyncPaginate), [allowCreate]);
    const Input = useCallback(props => <components.Input {...props} maxLength={MAX_LENGTH_INPUT} />, []);

    return (
        <ConditionalWrapper
            condition={copyValueButton || showTreeSelector}
            wrapper={children => (
                <ConditionalWrapper condition={inputGroup} wrapper={children => <InputGroup size="sm">{children}</InputGroup>}>
                    {children}
                    {showTreeSelector && value && value.id && (
                        <TreeSelector value={value} handleExternalSelect={handleExternalSelect} isDisabled={isDisabled} />
                    )}
                    {copyValueButton && value && value.id && (
                        <>
                            <Button disabled={!value || !value.id} onClick={handleCopyClick} outline>
                                <Tippy content="Copy the id to clipboard">
                                    <span>
                                        <Icon icon={faClipboard} size="sm" />
                                    </span>
                                </Tippy>
                            </Button>
                            {linkButton && (
                                <Link target="_blank" href={linkButton} className="btn btn-sm btn-outline-secondary align-items-center d-flex">
                                    <Tippy content={linkButtonTippy}>
                                        <span>
                                            <Icon icon={faLink} size="sm" />
                                        </span>
                                    </Tippy>
                                </Link>
                            )}
                        </>
                    )}
                </ConditionalWrapper>
            )}
        >
            {ontologySelectorIsOpen && (
                <OntologiesModal
                    selectedOntologies={selectedOntologies}
                    setSelectedOntologies={setSelectedOntologies}
                    toggle={() => setOntologySelectorIsOpen(v => !v)}
                />
            )}
            <StyledAutoCompleteInputFormControl className={`form-control ${cssClasses || 'default'} border-0`}>
                <SelectGlobalStyle />
                <Select
                    key={JSON.stringify(selectedOntologies.map(o => o.id))}
                    value={isMulti && fixedOptions?.length ? value?.map?.(v => ({ ...v, isFixed: fixedOptions.includes(v.id) })) : value}
                    loadOptions={loadOptions}
                    debounceTimeout={300}
                    additional={defaultAdditional}
                    noOptionsMessage={noResults}
                    onChange={
                        onChange
                            ? (select, action) => {
                                  handleExternalSelect(select, action);
                                  setInputValue('');
                              }
                            : handleChange
                    }
                    onInputChange={handleInputChange}
                    inputValue={inputValue || ''}
                    styles={customStyles}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    autoFocus={autoFocus}
                    cacheOptions={cacheOptions}
                    defaultOptions={defaultOptions ?? true}
                    openMenuOnFocus={openMenuOnFocus}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    selectRef={innerRef}
                    createOptionPosition="first"
                    menuPortalTarget={menuPortalTarget}
                    components={{
                        Option,
                        Menu,
                        Control,
                        DropdownIndicator,
                        Input,
                    }}
                    menuIsOpen={menuIsOpen}
                    onMenuOpen={() => setMenuIsOpen(true)}
                    onMenuClose={() => setMenuIsOpen(false)}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    isClearable={isClearable}
                    isDisabled={isDisabled}
                    isMulti={isMulti}
                    inputId={inputId}
                    classNamePrefix="react-select"
                    isValidNewOption={(inputValue, selectValue, selectOptions) => {
                        if (handleCreateExistingLabel) {
                            // to disable the create button
                            handleCreateExistingLabel(inputValue, selectOptions);
                        }
                        if (!allowCreate && !allowCreateDuplicate) {
                            return false;
                        }
                        if (inputValue && allowCreateDuplicate) {
                            return true;
                        }
                        return !(
                            !inputValue ||
                            selectValue.some(option => compareOption(inputValue, option)) ||
                            selectOptions.some(option => compareOption(inputValue, option))
                        );
                    }}
                />
            </StyledAutoCompleteInputFormControl>
        </ConditionalWrapper>
    );
};

Autocomplete.propTypes = {
    requestUrl: PropTypes.string,
    entityType: PropTypes.string,
    excludeClasses: PropTypes.array,
    optionsClass: PropTypes.string,
    placeholder: PropTypes.string,
    onItemSelected: PropTypes.func,
    onChange: PropTypes.func,
    allowCreate: PropTypes.bool,
    allowCreateDuplicate: PropTypes.bool,
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
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
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
    autoFocus: PropTypes.bool,
    ols: PropTypes.bool,
    inputGroup: PropTypes.bool,
    inputId: PropTypes.string,
    onChangeInputValue: PropTypes.func,
    inputValue: PropTypes.string,
    menuPortalTarget: PropTypes.object,
    cacheOptions: PropTypes.bool,
    fixedOptions: PropTypes.array,
    onOntologySelectorIsOpenStatusChange: PropTypes.func,
    showTreeSelector: PropTypes.bool,
};

export default withTheme(Autocomplete);
