'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Separator, Skeleton } from '@heroui/react';
import pluralize from 'pluralize';
import { useEffect } from 'react';

import BenchmarkCard from '@/components/Benchmarks/BenchmarkCard/BenchmarkCard';
import PWCProvenanceBox from '@/components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { benchmarksUrl, getAllBenchmarks } from '@/services/backend/benchmarks';
import { BenchmarkSummary } from '@/services/backend/types';

const CardGrid = ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
    </div>
);

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

    const renderListItem = (item: BenchmarkSummary) => <BenchmarkCard key={item.research_problem.id} benchmark={item} />;

    useEffect(() => {
        document.title = 'Benchmarks list - ORKG';
    }, []);

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-gray-500 mt-1">
                        on {isLoading ? <Icon icon={faSpinner} spin /> : totalElements} research {pluralize('problem', totalElements, false)}
                    </div>
                }
            >
                Benchmarks
            </TitleBar>
            <Container>
                <div className="box rounded p-6 flow-root">
                    <div className="flex flex-wrap items-stretch">
                        <div className="w-full md:shrink-0 md:grow-0 md:w-9/12 md:basis-9/12 md:max-w-9/12 pe-2">
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
                        <div className="w-full md:shrink-0 md:grow-0 md:w-3/12 md:basis-3/12 md:max-w-3/12">
                            <PWCProvenanceBox />
                        </div>
                    </div>

                    <Separator className="my-3" />

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
                        ListGroupComponent={CardGrid}
                        loadingComponent={
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full h-24 rounded-lg" />
                                ))}
                            </div>
                        }
                    />
                </div>
            </Container>
        </>
    );
};

export default Benchmarks;
