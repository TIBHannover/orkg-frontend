import { truncate } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select, { components, GroupBase, OptionProps, OptionsOrGroups, SingleValue } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import Option from '@/components/AutocompleteObservatory/CustomComponents/Option';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Label from '@/components/Ui/Label/Label';
import { getObservatories } from '@/services/backend/observatories';
import { getConferences, getOrganization } from '@/services/backend/organizations';
import { Observatory, Organization } from '@/services/backend/types';

const PAGE_SIZE = 10;
const MAXIMUM_DESCRIPTION_LENGTH = 120;

const CustomOptionObservatory = ({ data, isSelected, ...innerProps }: OptionProps<Observatory, false, GroupBase<Observatory>>) => (
    <components.Option data={data} isSelected={isSelected} {...innerProps}>
        <div>{data.name}</div>
        <small className={!isSelected ? 'text-muted' : ''}>{truncate(data.description ?? '', { length: MAXIMUM_DESCRIPTION_LENGTH })}</small>
    </components.Option>
);

type AutocompleteObservatoryProps = {
    onChangeObservatory: (observatory: Observatory | null) => void;
    onChangeOrganization: (organization: Organization | null) => void;
    observatory?: Observatory;
    organization?: Organization;
};

const AutocompleteObservatory: FC<AutocompleteObservatoryProps> = ({ onChangeObservatory, onChangeOrganization, observatory, organization }) => {
    const [optionsOrganizations, setOptionsOrganizations] = useState<Organization[]>([]);
    const [conferences, setConferences] = useState<Organization[]>([]);

    useEffect(() => {
        const loadConferences = async () => {
            const callConferences = await getConferences();
            setConferences(callConferences);
            setOptionsOrganizations(callConferences);
        };
        loadConferences();
    }, []);

    const loadObservatoryOptions = async (
        search: string,
        prevOptions: OptionsOrGroups<Observatory, GroupBase<Observatory>>,
        additional?: { page: number },
    ) => {
        const page = additional?.page ?? 0;

        const emptyList = {
            options: prevOptions,
            hasMore: false,
            additional: {
                page: 0,
            },
        };
        try {
            const result = await getObservatories({
                q: search.trim(),
                size: PAGE_SIZE,
                page,
            });
            const items = result.content;
            const hasMore = result.page.number < result.page.total_pages - 1;
            return {
                options: items,
                hasMore,
                additional: {
                    page: page + 1,
                },
            };
        } catch (err) {
            return emptyList;
        }
    };

    const handleChangeObservatory = async (selected: Observatory | null) => {
        onChangeObservatory(selected ?? null);
        const data = selected ? await Promise.all(selected?.organization_ids.map((o) => getOrganization(o))) : [];
        // Select the first organization
        onChangeOrganization(data?.[0] ?? null);
        setOptionsOrganizations(selected ? data : conferences);
    };

    const handleChangeOrganization = (selected: SingleValue<Organization>) => {
        onChangeOrganization(selected ?? null);
    };

    return (
        <>
            <p>
                <small>Clear the observatory field to select a conference in the organization field.</small>
            </p>
            <FormGroup>
                <Label for="select-observatory">Select an observatory</Label>
                <AsyncPaginate
                    value={observatory}
                    components={{ Option: CustomOptionObservatory }}
                    additional={{
                        page: 0,
                    }}
                    loadOptions={(inputValue, options, additional) => loadObservatoryOptions(inputValue, options, additional)}
                    onChange={handleChangeObservatory}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-observatory"
                    isClearable
                    classNamePrefix="react-select"
                />
            </FormGroup>
            <FormGroup>
                <Label for="select-organization">Select an organization</Label>
                <Select
                    value={organization}
                    components={{ Option }}
                    options={optionsOrganizations}
                    onChange={handleChangeOrganization}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-organization"
                    isClearable
                    classNamePrefix="react-select"
                    isMulti={false}
                />
            </FormGroup>
            <SelectGlobalStyle />
        </>
    );
};

export default AutocompleteObservatory;
