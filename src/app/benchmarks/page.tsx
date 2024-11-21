'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import BenchmarkCard from 'components/Benchmarks/BenchmarkCard/BenchmarkCard';
import PWCProvenanceBox from 'components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import TitleBar from 'components/TitleBar/TitleBar';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import { benchmarksUrl, getAllBenchmarks } from 'services/backend/benchmarks';
import { BenchmarkSummary } from 'services/backend/types';

const Benchmarks = () => {
    const {
        data: items,
        isLoading,
        totalElements,
        totalPages,
        hasNextPage,
        page,
        setPage,
        pageSize,
        setPageSize,
        error,
    } = usePaginate({
        fetchFunction: getAllBenchmarks,
        fetchFunctionName: 'getAllBenchmarks',
        fetchUrl: benchmarksUrl,
        fetchExtraParams: {},
        defaultPageSize: 64,
        defaultSortBy: 'totalPapers',
        defaultSortDirection: 'desc',
    });

    const renderListItem = (item: BenchmarkSummary) => <BenchmarkCard key={`${item.research_problem.id}`} benchmark={item} />;

    useEffect(() => {
        document.title = 'Benchmarks list - ORKG';
    }, []);

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        on {isLoading ? <Icon icon={faSpinner} spin /> : totalElements} research {pluralize('problem', totalElements, false)}
                    </div>
                }
            >
                Benchmarks
            </TitleBar>
            <Container className="box rounded p-4 clearfix">
                <div className="row">
                    <div className="col-md-9">
                        <p>
                            <i>Benchmarks</i> organize the state-of-the-art empirical research within research fields and are powered in part by
                            automated information extraction within a human-in-the-loop curation model.{' '}
                        </p>
                        <div>
                            Add your benchmark dataset and its evaluations to the ORKG by following the steps found in the{' '}
                            <a href="https://orkg.org/about/18/Benchmarks" target="_blank" rel="noopener noreferrer">
                                ORKG help center
                            </a>
                            .
                        </div>
                    </div>
                    <div className="col-md-3">
                        <PWCProvenanceBox />
                    </div>
                </div>
                <hr />

                <ListPaginatedContent<BenchmarkSummary>
                    renderListItem={renderListItem}
                    pageSize={pageSize}
                    label="Benchmarks"
                    isLoading={isLoading}
                    items={items ?? []}
                    hasNextPage={hasNextPage}
                    page={page}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalElements={totalElements}
                    error={error}
                    totalPages={totalPages}
                    boxShadow={false}
                    flush={false}
                    ListGroupComponent={Row}
                    loadingComponent={
                        <div className="text-center mt-4 mb-4">
                            <div className="mt-3">
                                <div>
                                    <ContentLoader height="10%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }}>
                                        <rect x="2" y="0" rx="2" ry="2" width="20" height="10" />
                                        <rect x="27" y="0" rx="2" ry="2" width="20" height="10" />
                                        <rect x="52" y="0" rx="2" ry="2" width="20" height="10" />
                                        <rect x="77" y="0" rx="2" ry="2" width="20" height="10" />
                                    </ContentLoader>
                                </div>
                            </div>
                        </div>
                    }
                />
            </Container>
        </>
    );
};

export default Benchmarks;
