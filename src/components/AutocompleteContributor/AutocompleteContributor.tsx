import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { uniqBy } from 'lodash';
import Link from 'next/link';
import { FC } from 'react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import useSWR from 'swr';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import Option from '@/components/AutocompleteContributor/CustomComponents/Option';
import SingleValue from '@/components/AutocompleteContributor/CustomComponents/SingleValue';
import useAuthentication from '@/components/hooks/useAuthentication';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { contributorsUrl, getContributorById, getContributors } from '@/services/backend/contributors';
import { Contributor } from '@/services/backend/types';

const PAGE_SIZE = 10;

type AutocompleteUserProps = {
    onChange: (contributor: Contributor | null) => void;
    contributor?: Contributor;
    currentContributor?: boolean;
    showLink?: boolean;
};

const AutocompleteUser: FC<AutocompleteUserProps> = ({ onChange, contributor, currentContributor = true, showLink = true }) => {
    const { user } = useAuthentication();

    const { data: currentUser } = useSWR(
        currentContributor && !!user && user.id ? [user.id, contributorsUrl, 'getContributorById'] : null,
        ([params]) => getContributorById(params),
    );

    const loadContributorOptions = async (
        search: string,
        prevOptions: OptionsOrGroups<Contributor, GroupBase<Contributor>>,
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
            const result = await getContributors({
                q: search.trim(),
                size: PAGE_SIZE,
                page,
            });
            const items = result.content;
            const hasMore = result.page.number < result.page.totalPages - 1;
            return {
                options: page === 0 ? uniqBy([...(currentUser ? [currentUser] : []), ...items], 'id') : items,
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
            <div className={`flex-1 min-w-0 ${contributor && showLink ? '[&_.react-select\\_\\_control]:!rounded-e-none' : ''}`}>
                <AsyncPaginate
                    value={contributor}
                    components={{ Option, SingleValue }}
                    additional={{
                        page: 0,
                    }}
                    loadOptions={loadContributorOptions}
                    onChange={onChange}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.displayName}
                    inputId="select-contributor"
                    placeholder="Select a contributor"
                    isClearable
                    classNamePrefix="react-select"
                    classNames={customClassNames as any}
                    styles={customStyles as any}
                    menuPosition="fixed"
                    key={contributor?.id}
                />
            </div>

            {contributor && showLink && (
                <Tooltip delay={0}>
                    <Tooltip.Trigger className="flex items-stretch">
                        <Link
                            target="_blank"
                            className="shrink-0 inline-flex items-center h-full px-3 text-sm font-medium border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-s-none rounded-e-md -ms-px"
                            href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}
                        >
                            <FontAwesomeIcon icon={faLink} />
                        </Link>
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow>
                        <Tooltip.Arrow />
                        Open profile page
                    </Tooltip.Content>
                </Tooltip>
            )}
        </div>
    );
};

export default AutocompleteUser;
