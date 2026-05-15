'use client';

import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ComparisonCard from '@/components/Cards/ComparisonCard/ComparisonCard';
import ConferenceMetadataBox from '@/components/Conference/ConferenceMetadataBox';
import ResearchProblemBox from '@/components/Conference/ResearchProblemBox';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { comparisonUrl, getComparisons } from '@/services/backend/comparisons';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
import { Comparison, VisibilityOptions } from '@/services/backend/types';

const ConferenceDetails = () => {
    const { id } = useParams();

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    const {
        data: conference,
        isLoading: isLoadingConference,
        error: errorConference,
    } = useSWR(id ? [id, conferenceSeriesUrl, 'getConferenceById'] : null, ([params]) => getConferenceById(params));

    const renderListItem = (item: Comparison) => <ComparisonCard comparison={item} key={item.id} />;

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
        fetchFunction: getComparisons,
        fetchUrl: comparisonUrl,
        fetchFunctionName: 'getComparisons',
        fetchExtraParams: {
            organization_id: conference?.id,
            visibility,
        },
        isReadyToLoad: !!conference?.id,
    });

    useEffect(() => {
        document.title = `${conference?.name} - Conference events - ORKG`;
    }, [conference]);

    return (
        <>
            {isLoadingConference && (
                <div className="max-w-container mx-auto px-3 mt-12">
                    <div className="box rounded py-6 px-12 flow-root">Loading ...</div>
                </div>
            )}
            {!isLoadingConference &&
                errorConference &&
                (errorConference.statusCode === 404 ? <NotFound /> : <InternalServerError error={errorConference} />)}
            {!isLoadingConference && !errorConference && conference && (
                <>
                    <TitleBar titleAddition={<SubTitle>Conference event</SubTitle>} wrap={false}>
                        {conference.name}
                    </TitleBar>
                    <div className="max-w-container mx-auto px-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
                            <ResearchProblemBox id={conference.id} />
                            <ConferenceMetadataBox url={conference.homepage} metadata={conference?.metadata} isLoading={isLoading} />
                        </div>
                    </div>
                    <TitleBar
                        titleSize="h5"
                        buttonGroup={<VisibilityFilter />}
                        titleAddition={<SubTitle>{pluralize('comparison', totalElements, true)}</SubTitle>}
                    >
                        Content
                    </TitleBar>

                    <ListPaginatedContent<Comparison>
                        renderListItem={renderListItem}
                        pageSize={pageSize}
                        label="conference event"
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
                </>
            )}
        </>
    );
};

export default ConferenceDetails;
