'use client';

import ContentLoader from 'components/ContentLoader/ContentLoader';
import Filters from 'components/Search/Filters';
import { useSearch } from 'components/Search/hooks/useSearch';
import Results from 'components/Search/Results';
import TitleBar from 'components/TitleBar/TitleBar';
import { ENTITIES } from 'constants/graphSettings';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';
import { unionBy } from 'lodash';
import { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';

export default function Search() {
    const { searchTerm, selectedFilters, results, isNextPageLoading, hasNextPage, isLoading, loadMoreResults, currentPage } = useSearch();

    useEffect(() => {
        document.title = 'Search - ORKG';
    }, []);

    const allFilters = unionBy(DEFAULT_FILTERS, selectedFilters, 'id');

    return (
        <div>
            <TitleBar>Search results</TitleBar>
            <Container>
                <Row>
                    <Col md="4">
                        <div className="box rounded p-4 h-100">
                            <Filters />
                        </div>
                    </Col>
                    <Col md="8" className="mt-sm-2 mt-md-0">
                        <div className="box rounded p-4">
                            {isLoading() && Object.keys(results).every((v) => results[v] && results[v].length === 0) && (
                                <ContentLoader height="100%" width="100%" viewBox="0 0 100 25" style={{ width: '100% !important' }} speed={2}>
                                    <rect x="0" y="0" width="50" height="3" />
                                    <rect x="0" y="5" width="100%" height="3" />
                                    <rect x="0" y="10" width="100%" height="3" />
                                    <rect x="0" y="15" width="100%" height="3" />
                                    <rect x="0" y="20" width="100%" height="3" />
                                </ContentLoader>
                            )}

                            {!searchTerm || (!isLoading() && Object.keys(results).every((v) => results[v] && results[v].length === 0)) ? (
                                <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                            ) : (
                                <div>
                                    {allFilters
                                        .filter((filter) => (results[filter.id] || [])?.length > 0)
                                        .map((filter) => {
                                            if (
                                                selectedFilters.length === 0 ||
                                                (selectedFilters.length > 0 && selectedFilters.map((c) => c && c.id).includes(filter.id))
                                            ) {
                                                return (
                                                    <div key={`filter-result${filter.id}`}>
                                                        <Results
                                                            showClasses={ENTITIES.RESOURCE === filter.id}
                                                            loading={isNextPageLoading[filter.id] || false}
                                                            hasNextPage={hasNextPage[filter.id] || false}
                                                            loadMore={() => loadMoreResults(filter.id, currentPage[filter.id])}
                                                            items={results[filter.id] || []}
                                                            label={filter.label || filter.id}
                                                            class={filter.id}
                                                            currentPage={currentPage[filter.id] || 0}
                                                            showNoResultsMessage={selectedFilters.map((c) => c.id).includes(filter.id)}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    {allFilters.filter(
                                        (filter) =>
                                            (results[filter.id] || [])?.length === 0 && selectedFilters.map((c) => c && c.id).includes(filter.id),
                                    ).length > 0 &&
                                        !isLoading() && (
                                            <>
                                                <h2 className="h5">No results</h2>
                                                <div className="text-center mt-4 mb-4">
                                                    There are no results for the remaining filters (
                                                    <i>
                                                        {allFilters
                                                            .filter(
                                                                (filter) =>
                                                                    (results[filter.id] || [])?.length === 0 &&
                                                                    selectedFilters.map((c) => c && c.id).includes(filter.id),
                                                            )
                                                            .map((f) => f.label)
                                                            .join(', ')}
                                                    </i>
                                                    )
                                                </div>
                                            </>
                                        )}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
