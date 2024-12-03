import { SelectGlobalStyle, customClassNames, customStyles } from 'components/Autocomplete/styled';
import SelectOption, { type RosettaStoneTemplateOption } from 'components/RosettaStone/AddStatement/SelectOption';
import { uniqBy } from 'lodash';
import { FC, useId } from 'react';
import type { GroupBase, OptionsOrGroups } from 'react-select';
import { ActionMeta, SingleValue } from 'react-select';
import { withAsyncPaginate } from 'react-select-async-paginate';
import Creatable from 'react-select/creatable';
import { getRSTemplates } from 'services/backend/rosettaStone';
import { RosettaStoneTemplate } from 'services/backend/types';

type AdditionalType = {
    page: number;
};

const AsyncPaginateCreatable = withAsyncPaginate(Creatable);

const PAGE_SIZE = 12;

type StatementTypeAutocompleteProps = {
    onChange: (value: SingleValue<RosettaStoneTemplateOption>, actionMeta: ActionMeta<RosettaStoneTemplateOption>) => void;
    additionalOptions?: RosettaStoneTemplate[];
    autoFocus?: boolean;
    openMenuOnFocus?: boolean;
};

const StatementTypeAutocomplete: FC<StatementTypeAutocompleteProps> = ({
    additionalOptions = [],
    onChange,
    autoFocus = true,
    openMenuOnFocus = true,
}) => {
    const loadOptions = async (
        search: string,
        prevOptions: OptionsOrGroups<RosettaStoneTemplateOption, GroupBase<RosettaStoneTemplateOption>>,
        additional?: AdditionalType,
    ) => {
        const page = additional?.page ?? 0;
        const responseItems: RosettaStoneTemplateOption[] = [];

        if (additionalOptions.length > 0 && page === 0) {
            responseItems.push(...additionalOptions.map((t) => ({ ...t, used: true })));
        }
        let hasMore = false;

        const orkgResponseItems = await getRSTemplates({ q: search, page, size: PAGE_SIZE });

        if ('content' in orkgResponseItems) {
            responseItems.push(...(orkgResponseItems?.content ?? []).map((t) => ({ ...t, used: false })));
            hasMore = !orkgResponseItems.last;
        }

        return {
            options: uniqBy(responseItems, 'id'),
            hasMore,
            additional: {
                page: page + 1,
            },
        };
    };
    const instanceId = useId();

    const defaultAdditional = {
        page: 0,
    };

    return (
        <>
            <SelectGlobalStyle />
            <AsyncPaginateCreatable<RosettaStoneTemplateOption, GroupBase<RosettaStoneTemplateOption>, AdditionalType, false>
                instanceId={instanceId}
                classNamePrefix="react-select"
                // @ts-expect-error different type from OptionType
                styles={customStyles}
                classNames={customClassNames}
                debounceTimeout={300}
                loadOptions={loadOptions}
                additional={defaultAdditional}
                getOptionValue={({ id }) => id}
                isMulti={false}
                components={{ Option: SelectOption }}
                onChange={onChange}
                formatCreateLabel={(inputValue: string) => `Create new statement type "${inputValue}"`}
                placeholder="Search statement type by verb/predicate (e.g., has measurement, develops from) or define a new one"
                createOptionPosition="first"
                autoFocus={autoFocus}
                openMenuOnFocus={openMenuOnFocus}
                isValidNewOption={(val: string) => {
                    if (val) {
                        return true;
                    }
                    return false;
                }}
            />
        </>
    );
};

export default StatementTypeAutocomplete;
