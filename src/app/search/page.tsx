'use client';

import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

import Filters from '@/app/search/components/Filters';
import useSearch from '@/app/search/components/hooks/useSearch';
import OrkgAskBanner from '@/app/search/components/OrkgAskBanner/OrkgAskBanner';
// import useSetSmartFilters from '@/app/search/components/hooks/useSetSmartFilters';
import Results from '@/app/search/components/Results';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import TitleBar from '@/components/TitleBar/TitleBar';
import { Thing } from '@/services/backend/things';
import { PaginatedResponse } from '@/services/backend/types';

export default function Search() {
    const [results, setResults] = useState<PaginatedResponse<Thing> | undefined>(undefined);

    const { typeData, searchTerm, page, countResults, isLoading, pageSize, setPageSize, setPage, results: _results, isAuthorExists } = useSearch();

    useEffect(() => {
        setResults(_results);
    }, [_results]);
    /*
    const { setSelectedSmartFilterIds, selectedSmartFilterIds, selectedSmartFilterLabels, toggleSmartFilter, initialResults } = useSetSmartFilters(
        setResults,
        results,
    );
    */
    useEffect(() => {
        document.title = `Search ${searchTerm} - ORKG`;
    }, [searchTerm]);

    return (
        <div>
            <TitleBar>Search results</TitleBar>
            <Container>
                <Row>
                    <Col md="4">
                        <div className="box rounded p-4 h-100">
                            <Filters
                                results={results as PaginatedResponse<Thing>}
                                countResults={countResults}
                                typeData={typeData}
                                isLoading={isLoading}
                            />
                        </div>
                    </Col>
                    <Col md="8">
                        <div className="tw:h-full tw:flex tw:flex-col">
                            {searchTerm && <OrkgAskBanner />}

                            {isLoading && (
                                <div className="box rounded p-4">
                                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 25" style={{ width: '100% !important' }} speed={2}>
                                        <rect x="0" y="0" width="50" height="3" />
                                        <rect x="0" y="5" width="100%" height="3" />
                                        <rect x="0" y="10" width="100%" height="3" />
                                        <rect x="0" y="15" width="100%" height="3" />
                                        <rect x="0" y="20" width="100%" height="3" />
                                    </ContentLoader>
                                </div>
                            )}
                            {!isLoading && results && results?.content?.length > 0 && (
                                <div className="box rounded pb-4 h-100">
                                    <Results
                                        query={searchTerm}
                                        hasNextPage={false}
                                        items={results.content || []}
                                        page={page}
                                        setPage={setPage}
                                        totalPages={results.page.total_pages}
                                        pageSize={pageSize}
                                        setPageSize={setPageSize}
                                        isLoading={isLoading}
                                        totalElements={results.page.total_elements}
                                        isAuthorExists={isAuthorExists}
                                    />
                                </div>
                            )}
                            {!isLoading && results?.content?.length === 0 && (
                                <div className="box rounded p-4 h-100">
                                    <h2 className="h5">No results</h2>
                                    <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
