import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqBy } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import useSWR from 'swr';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import Option from '@/components/AutocompleteContributor/CustomComponents/Option';
import SingleValue from '@/components/AutocompleteContributor/CustomComponents/SingleValue';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ROUTES from '@/constants/routes';
import { contributorsUrl, getContributorInformationById, getContributors } from '@/services/backend/contributors';
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
        currentContributor && !!user && user.id ? [user.id, contributorsUrl, 'getContributorInformationById'] : null,
        ([params]) => getContributorInformationById(params),
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
            const hasMore = result.page.number < result.page.total_pages - 1;
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
        <>
            <InputGroup className="d-flex align-items-center w-100 flex-grow-1">
                <AsyncPaginate
                    value={contributor}
                    components={{ Option, SingleValue }}
                    additional={{
                        page: 0,
                    }}
                    loadOptions={(inputValue, options, additional) => loadContributorOptions(inputValue, options, additional)}
                    onChange={onChange}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ display_name }) => display_name}
                    inputId="select-contributor"
                    placeholder="Select a contributor"
                    isClearable
                    classNamePrefix="react-select"
                    classNames={{
                        container: () => 'form-control form-control-sm p-0',
                        control: () => 'border-0 p-0 border-radius-0',
                    }}
                    key={contributor?.id}
                />

                {contributor && showLink && (
                    <Tooltip content="Open profile page">
                        <Link
                            target="_blank"
                            className=" px-2 btn btn-outline-secondary"
                            href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}
                        >
                            <FontAwesomeIcon icon={faLink} />
                        </Link>
                    </Tooltip>
                )}
            </InputGroup>
            <SelectGlobalStyle />
        </>
    );
};

export default AutocompleteUser;
