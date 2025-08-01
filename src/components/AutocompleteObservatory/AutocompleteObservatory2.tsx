import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ROUTES from '@/constants/routes';
import { getObservatories } from '@/services/backend/observatories';
import { Observatory } from '@/services/backend/types';

const PAGE_SIZE = 10;

type AutocompleteObservatoryProps = {
    onChange: (observatory: Observatory | null) => void;
    observatory?: Observatory;
    showLink?: boolean;
};

const AutocompleteObservatory: FC<AutocompleteObservatoryProps> = ({ onChange, observatory, showLink = false }) => {
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

    return (
        <>
            <InputGroup className="d-flex align-items-center w-100 flex-grow-1">
                <AsyncPaginate
                    value={observatory}
                    additional={{
                        page: 0,
                    }}
                    loadOptions={(inputValue, options, additional) => loadObservatoryOptions(inputValue, options, additional)}
                    onChange={onChange}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-observatory"
                    placeholder="Select an observatory"
                    isClearable
                    classNamePrefix="react-select"
                    classNames={{
                        container: () => 'form-control form-control-sm p-0',
                        control: () => 'border-0 p-0 border-radius-0',
                    }}
                    key={observatory?.id}
                />
                {observatory && showLink && (
                    <Tooltip content="Open observatory page">
                        <Link target="_blank" className=" px-2 btn btn-outline-secondary" href={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}>
                            <FontAwesomeIcon icon={faLink} />
                        </Link>
                    </Tooltip>
                )}
            </InputGroup>
            <SelectGlobalStyle />
        </>
    );
};

export default AutocompleteObservatory;
