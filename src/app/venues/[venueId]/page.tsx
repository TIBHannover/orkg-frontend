'use client';

import { faEllipsisV, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import useSWR from 'swr';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
    const { data: venueData, isLoading: loading } = useSWR(venueId ? [venueId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );

    useEffect(() => {
        document.title = `${venueData?.label} - ORKG`;
    }, [venueData]);

    return (
        <>
            {loading && (
                <div className="text-center mt-6 mb-6">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!loading && (
                <div>
                    <TitleBar
                        buttonGroup={
                            <>
                                <VisibilityFilter />
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary px-4 rounded-r" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu aria-label="Options">
                                            <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id: venueId })}?noRedirect`} textValue="View resource">
                                                View resource
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
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
