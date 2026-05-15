import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
        <div className="flex items-stretch w-full">
            <div className={`flex-1 min-w-0 ${observatory && showLink ? '[&_.react-select\\_\\_control]:!rounded-e-none' : ''}`}>
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
                    classNames={customClassNames as any}
                    styles={customStyles as any}
                    menuPosition="fixed"
                    key={observatory?.id}
                />
            </div>
            {observatory && showLink && (
                <Tooltip delay={0}>
                    <Tooltip.Trigger className="flex items-stretch">
                        <Link
                            target="_blank"
                            className="shrink-0 inline-flex items-center h-full px-3 text-sm font-medium border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-s-none rounded-e-md -ms-px"
                            href={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
                        >
                            <FontAwesomeIcon icon={faLink} />
                        </Link>
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow>
                        <Tooltip.Arrow />
                        Open observatory page
                    </Tooltip.Content>
                </Tooltip>
            )}
        </div>
    );
};

export default AutocompleteObservatory;
