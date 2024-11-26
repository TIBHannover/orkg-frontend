import AutocompleteProvider, { useAutocompleteState } from 'components/Autocomplete/AutocompleteContext';
import Input from 'components/Autocomplete/CustomComponents/Input';
import Menu from 'components/Autocomplete/CustomComponents/Menu';
import { Option as CustomOption } from 'components/Autocomplete/CustomComponents/Option';
import OntologiesModal from 'components/Autocomplete/OntologiesModal/OntologiesModal';
import { importExternalSelectedOption } from 'components/Autocomplete/hooks/helpers';
import useLoadOptions from 'components/Autocomplete/hooks/useLoadOptions';
import { SelectGlobalStyle, customClassNames, customStyles } from 'components/Autocomplete/styled';
import { AdditionalType, AutocompleteProps, OptionType } from 'components/Autocomplete/types';
import { findIndex, uniqBy } from 'lodash';
import { useEffect, useId, useMemo, useState } from 'react';
import type { GroupBase, OnChangeValue } from 'react-select';
import { AsyncPaginate, ComponentProps, UseAsyncPaginateParams, withAsyncPaginate } from 'react-select-async-paginate';
import type {} from 'react-select/base';
import Creatable, { CreatableProps } from 'react-select/creatable';
import { getEntity } from 'services/backend/misc';

// This import is necessary for module augmentation.
// It allows us to extend the 'Props' interface in the 'react-select/base' module
// and add our custom property 'enableExternalSources' to it.
declare module 'react-select/base' {
    export interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>> {
        enableExternalSources?: boolean;
        size?: 'sm';
    }
}

const AsyncPaginateCreatable = withAsyncPaginate(Creatable);

type AsyncPaginateCreatableProps<Option, Group extends GroupBase<Option>, Additional, IsMulti extends boolean> = CreatableProps<
    Option,
    IsMulti,
    Group
> &
    UseAsyncPaginateParams<Option, Group, Additional> &
    ComponentProps<Option, Group, IsMulti>;

type AutocompleteComponentProps<IsMulti extends boolean = false> = Omit<
    AsyncPaginateCreatableProps<OptionType, GroupBase<OptionType>, AdditionalType, IsMulti>,
    'loadOptions'
> &
    AutocompleteProps;

const Autocomplete = <IsMulti extends boolean = false>(props: AutocompleteComponentProps<IsMulti>) => {
    const {
        allowCreate,
        entityType,
        baseClass,
        includeClasses,
        excludeClasses,
        enableExternalSources,
        additionalOptions,
        isMulti,
        onOntologySelectorModalStatusChange,
        fixedOptions,
        defaultValueId,
        placeholder,
    } = props;

    const { value, onChange, ...restProps } = props;

    const [defaultValue, setValue] = useState<OptionType[] | OptionType | null>(null);

    useEffect(() => {
        const loadNode = async () => {
            if (defaultValueId && !value && !isMulti) {
                const node = await getEntity(entityType, defaultValueId as string);
                setValue(node as OptionType);
            } else if (defaultValueId && defaultValueId?.length > 0 && !value && isMulti) {
                const nodes = await Promise.all((defaultValueId as string[]).map((v) => getEntity(entityType, v) as Promise<OptionType>));
                setValue(nodes);
            } else {
                setValue(null);
            }
        };

        if (defaultValueId && (!defaultValue || (!isMulti && defaultValueId !== (defaultValue as OptionType)?.id))) {
            setValue(null);
            loadNode();
        }
    }, [defaultValue, defaultValueId, entityType, isMulti, value]);

    const Select = useMemo(() => (allowCreate ? AsyncPaginateCreatable : AsyncPaginate), [allowCreate]);

    const { selectedOntologies, isOntologySelectorIsOpen } = useAutocompleteState();

    const { loadOptions, defaultAdditional } = useLoadOptions({
        entityType,
        baseClass,
        includeClasses,
        excludeClasses,
        enableExternalSources,
        additionalOptions,
    });

    const noOptionsMessage = (value: { inputValue: string }) => (value.inputValue !== '' ? 'No results found' : 'Start typing to find results');

    // in contribution editor we need to know the status of the modal because we are using useClickAway to trigger save
    useEffect(() => {
        onOntologySelectorModalStatusChange?.(isOntologySelectorIsOpen);
    }, [onOntologySelectorModalStatusChange, isOntologySelectorIsOpen]);

    let localValue = value;
    if (defaultValueId) {
        localValue = defaultValue;
    } else if (isMulti && fixedOptions?.length) {
        localValue = (value as OptionType[])?.map?.((v) => ({ ...v, isFixed: fixedOptions.includes(v.id) }));
    }

    return (
        <>
            <SelectGlobalStyle />
            <Select<OptionType, GroupBase<OptionType>, AdditionalType, IsMulti>
                {...restProps}
                // to clear the cached options if the selected ontologies changes
                key={JSON.stringify(selectedOntologies.map((o) => o.id))}
                instanceId={useId()}
                styles={customStyles}
                classNames={customClassNames}
                classNamePrefix="react-select"
                debounceTimeout={300}
                loadOptions={loadOptions}
                additional={defaultAdditional}
                enableExternalSources={enableExternalSources}
                components={{
                    Menu,
                    Option: CustomOption,
                    Input,
                }}
                value={localValue}
                getOptionValue={({ id }) => id}
                onChange={async (newValue, actionMeta) => {
                    if (!onChange) return;
                    if (actionMeta.action === 'select-option') {
                        if (isMulti && actionMeta.option) {
                            const v = await importExternalSelectedOption(entityType, actionMeta.option);
                            // Find selected item index
                            const index = findIndex(newValue as OptionType[], { id: actionMeta.option?.id });
                            (newValue as OptionType[])?.splice(index, 1, v);
                            onChange(uniqBy(newValue as OptionType[], 'id') as unknown as OnChangeValue<OptionType, IsMulti>, actionMeta);
                            return;
                        }
                        if (!isMulti) {
                            const v = await importExternalSelectedOption(entityType, newValue as OptionType);
                            onChange(v as OnChangeValue<OptionType, IsMulti>, actionMeta);
                            return;
                        }
                    }
                    onChange(newValue, actionMeta);
                }}
                noOptionsMessage={noOptionsMessage}
                aria-label={placeholder?.toString()}
                {...(allowCreate ? { createOptionPosition: 'first' } : {})}
            />
            {enableExternalSources && <OntologiesModal />}
        </>
    );
};

const AutocompleteContextWrapper = <IsMulti extends boolean = false>(props: AutocompleteComponentProps<IsMulti>) => {
    return (
        <AutocompleteProvider>
            <Autocomplete {...props} />
        </AutocompleteProvider>
    );
};

export default AutocompleteContextWrapper;
