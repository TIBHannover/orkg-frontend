'use client';

import { Skeleton } from '@heroui/react';
import { useEffect } from 'react';

import Filters from '@/app/search/components/Filters';
import useSearch from '@/app/search/components/hooks/useSearch';
import useSmartFilters from '@/app/search/components/hooks/useSmartFilters';
import OrkgAskBanner from '@/app/search/components/OrkgAskBanner/OrkgAskBanner';
import Results from '@/app/search/components/Results';
import TitleBar from '@/components/TitleBar/TitleBar';
import Col from '@/components/Ui/Structure/Col';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import { Thing } from '@/services/backend/things';
import { PaginatedResponse } from '@/services/backend/types';

export default function Search() {
    const {
        typeData,
        searchTerm,
        page,
        countResults,
        isLoading,
        pageSize,
        setPageSize,
        setPage,
        results: _results,
        isAuthorExists,
        hasNextPage,
    } = useSearch({
        redirectToEntity: true,
        searchAuthor: true,
    });

    const {
        filteredItemsIds,
        selectedSmartFilter,
        setSelectedSmartFilter,
        generateSmartFilters,
        isLoading: isLoadingSmartFilters,
        error: errorSmartFilters,
        facets,
    } = useSmartFilters(searchTerm, _results);

    useEffect(() => {
        document.title = `Search ${searchTerm} - ORKG`;
    }, [searchTerm]);

    let results: PaginatedResponse<Thing> | undefined = _results;
    if (filteredItemsIds.length > 0) {
        results = {
            ..._results,
            content: _results?.content?.filter((item) => filteredItemsIds.includes(item.id)),
        } as PaginatedResponse<Thing>;
    }

    return (
        <div>
            <TitleBar>Search results</TitleBar>
            <Container>
                <Row>
                    <Col md="4">
                        <div className="box rounded p-6 h-full">
                            <Filters
                                results={results as PaginatedResponse<Thing>}
                                countResults={countResults}
                                typeData={typeData}
                                isLoading={isLoading}
                                selectedSmartFilter={selectedSmartFilter}
                                setSelectedSmartFilter={setSelectedSmartFilter}
                                generateSmartFilters={generateSmartFilters}
                                isLoadingSmartFilters={isLoadingSmartFilters}
                                errorSmartFilters={errorSmartFilters}
                                facets={facets || []}
                            />
                        </div>
                    </Col>
                    <Col md="8">
                        <div className="h-full flex flex-col">
                            {searchTerm && <OrkgAskBanner />}

                            {isLoading && (
                                <div className="box rounded p-6 flex flex-col gap-3">
                                    <Skeleton className="w-1/2 h-3 rounded" />
                                    <Skeleton className="w-full h-3 rounded" />
                                    <Skeleton className="w-full h-3 rounded" />
                                    <Skeleton className="w-full h-3 rounded" />
                                    <Skeleton className="w-full h-3 rounded" />
                                </div>
                            )}
                            {!isLoading && results && results?.content?.length > 0 && (
                                <div className="box rounded pb-6 h-full">
                                    <Results
                                        query={searchTerm}
                                        hasNextPage={hasNextPage}
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
                                <div className="box rounded p-6 h-full">
                                    <h2 className="text-xl">No results</h2>
                                    <div className="text-center mt-6 mb-6">There are no results, please try a different search term</div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
