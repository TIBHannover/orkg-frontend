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
import Col from '@/components/Ui/Structure/Col';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
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
            {isLoadingConference && <Container className="box rounded py-4 px-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoadingConference &&
                errorConference &&
                (errorConference.statusCode === 404 ? <NotFound /> : <InternalServerError error={errorConference} />)}
            {!isLoadingConference && !errorConference && conference && (
                <>
                    <TitleBar titleAddition={<SubTitle>Conference event</SubTitle>} wrap={false}>
                        {conference.name}
                    </TitleBar>
                    <Container className="p-0 mb-3">
                        <Row className="mt-3">
                            <Col md="6" className="d-flex">
                                <ResearchProblemBox id={conference.id} />
                            </Col>
                            <Col md="6" className="d-flex">
                                <ConferenceMetadataBox url={conference.homepage} metadata={conference?.metadata} isLoading={isLoading} />
                            </Col>
                        </Row>
                    </Container>
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
