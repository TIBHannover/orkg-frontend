import { Label } from '@heroui/react';
import { truncate } from 'lodash';
import { FC, useState } from 'react';
import Select, { components, GroupBase, OptionProps, OptionsOrGroups, SingleValue } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import useSWR from 'swr';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import Option from '@/components/AutocompleteObservatory/CustomComponents/Option';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import { conferenceSeriesUrl, getSeriesListByConferenceId } from '@/services/backend/conferences-series';
import { getObservatories } from '@/services/backend/observatories';
import { getConferences, getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { ConferenceSeries, Observatory, Organization } from '@/services/backend/types';

const PAGE_SIZE = 10;
const MAXIMUM_DESCRIPTION_LENGTH = 120;

const CustomOptionObservatory = ({ data, isSelected, ...innerProps }: OptionProps<Observatory, false, GroupBase<Observatory>>) => (
    <components.Option data={data} isSelected={isSelected} {...innerProps}>
        <div>{data.name}</div>
        <small className={!isSelected ? 'text-gray-500' : ''}>{truncate(data.description ?? '', { length: MAXIMUM_DESCRIPTION_LENGTH })}</small>
    </components.Option>
);

type AutocompleteObservatoryProps = {
    onChangeObservatory: (observatory: Observatory | null) => void;
    onChangeOrganization: (organization: Organization | null) => void;
    onChangeConferenceSeries?: (conferenceSeries: ConferenceSeries | null) => void;
    observatory?: Observatory;
    organization?: Organization;
    conferenceSeries?: ConferenceSeries;
    // the backend only accepts conference series events as organization on papers and comparisons
    allowConferenceSeries?: boolean;
};

const AutocompleteObservatory: FC<AutocompleteObservatoryProps> = ({
    onChangeObservatory,
    onChangeOrganization,
    onChangeConferenceSeries,
    observatory,
    organization,
    conferenceSeries,
    allowConferenceSeries = false,
}) => {
    const { data: conferences } = useSWR([null, organizationsUrl, 'getConferences'], () => getConferences(), { shouldRetryOnError: false });

    const isConferenceSelected = allowConferenceSeries && organization?.type === ORGANIZATIONS_MISC.EVENT;
    const { data: conferenceEvents } = useSWR(
        isConferenceSelected ? [organization.id, conferenceSeriesUrl, 'getSeriesListByConferenceId'] : null,
        ([params]) => getSeriesListByConferenceId(params),
        { shouldRetryOnError: false },
    );

    // The organizations of the selected observatory, or null when no observatory is selected
    // (in which case the conferences are offered instead).
    const [observatoryOrganizations, setObservatoryOrganizations] = useState<Organization[] | null>(null);
    const optionsOrganizations = observatoryOrganizations ?? conferences ?? [];

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
            const hasMore = (result.page.number ?? 0) < (result.page.totalPages ?? 0) - 1;
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
        onChangeConferenceSeries?.(null);
        const data = selected ? await Promise.all(selected?.organization_ids.map((o) => getOrganization(o))) : [];
        // Select the first organization
        onChangeOrganization(data?.[0] ?? null);
        setObservatoryOrganizations(selected ? data : null);
    };

    const handleChangeOrganization = (selected: SingleValue<Organization>) => {
        onChangeOrganization(selected ?? null);
        onChangeConferenceSeries?.(null);
    };

    return (
        <>
            <p className="text-sm text-gray-500 mb-2">
                Clear the observatory field to select a conference in the organization field.
                {allowConferenceSeries && ' When a conference is selected, a specific event can optionally be picked.'}
            </p>
            <div className="mb-3">
                <Label htmlFor="select-observatory">Select an observatory</Label>
                <AsyncPaginate<Observatory, GroupBase<Observatory>, { page: number }, false>
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
                    // @ts-expect-error customClassNames is typed for OptionType but works with any option type
                    classNames={customClassNames}
                    // @ts-expect-error customStyles is typed for OptionType but works with any option type
                    styles={customStyles}
                    menuPosition="fixed"
                />
            </div>
            <div className="mb-3">
                <Label htmlFor="select-organization">Select an organization</Label>
                <Select<Organization, false, GroupBase<Organization>>
                    value={organization}
                    components={{ Option }}
                    options={optionsOrganizations}
                    onChange={handleChangeOrganization}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-organization"
                    isClearable
                    classNamePrefix="react-select"
                    // @ts-expect-error customClassNames is typed for OptionType but works with any option type
                    classNames={customClassNames}
                    // @ts-expect-error customStyles is typed for OptionType but works with any option type
                    styles={customStyles}
                    menuPosition="fixed"
                    isMulti={false}
                />
            </div>
            {isConferenceSelected && (
                <div className="mb-3">
                    <Label htmlFor="select-conference-event">Select an event (optional)</Label>
                    <Select<ConferenceSeries, false, GroupBase<ConferenceSeries>>
                        value={conferenceSeries ?? null}
                        options={conferenceEvents?.content ?? []}
                        onChange={(selected: SingleValue<ConferenceSeries>) => onChangeConferenceSeries?.(selected ?? null)}
                        getOptionValue={({ id }) => id}
                        getOptionLabel={({ name }) => name}
                        inputId="select-conference-event"
                        placeholder="Entire conference (no specific event)"
                        isClearable
                        classNamePrefix="react-select"
                        // @ts-expect-error customClassNames is typed for OptionType but works with any option type
                        classNames={customClassNames}
                        // @ts-expect-error customStyles is typed for OptionType but works with any option type
                        styles={customStyles}
                        menuPosition="fixed"
                        isMulti={false}
                    />
                </div>
            )}
        </>
    );
};

export default AutocompleteObservatory;
