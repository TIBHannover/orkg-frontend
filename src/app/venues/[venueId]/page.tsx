'use client';

import { faEllipsisV, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import useParams from '@/components/useParams/useParams';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { getPapers, papersUrl } from '@/services/backend/papers';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Paper, VisibilityOptions } from '@/services/backend/types';

const VenuePage = () => {
    const { venueId } = useParams();

    const renderListItem = (item: Paper) => <PaperCard paper={item} key={item.id} />;

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    const {
        data: items,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getPapers,
        fetchUrl: papersUrl,
        fetchFunctionName: 'getPapers',
        fetchExtraParams: {
            visibility,
            venue: venueId,
        },
    });
    const [menuOpen, setMenuOpen] = useState(false);

    const { data: venueData, isLoading: loading } = useSWR(venueId ? [venueId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );

    useEffect(() => {
        document.title = `${venueData?.label} - ORKG`;
    }, [venueData]);

    return (
        <>
            {loading && (
                <div className="text-center mt-4 mb-4">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!loading && (
                <div>
                    <TitleBar
                        buttonGroup={
                            <>
                                <VisibilityFilter />
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 1 }}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end="true">
                                        <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: venueId })}?noRedirect`}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                        titleAddition={<SubTitle>Venue ({pluralize('paper', totalElements, true)})</SubTitle>}
                    >
                        {venueData?.label}
                    </TitleBar>

                    <ListPaginatedContent<Paper>
                        renderListItem={renderListItem}
                        pageSize={pageSize}
                        label="venue"
                        isLoading={isLoading}
                        items={items ?? []}
                        hasNextPage={hasNextPage}
                        page={page}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        totalElements={totalElements}
                        error={error}
                        totalPages={totalPages}
                    />
                </div>
            )}
        </>
    );
};

export default VenuePage;
