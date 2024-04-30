'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import BenchmarkCard from 'components/Benchmarks/BenchmarkCard/BenchmarkCard';
import usePaginate from 'components/hooks/usePaginate';
import PWCProvenanceBox from 'components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import TitleBar from 'components/TitleBar/TitleBar';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { Button, Container, Row } from 'reactstrap';
import { getAllBenchmarks } from 'services/backend/benchmarks';

const Benchmarks = () => {
    const fetchItems = async ({ page, pageSize }) => {
        const { content: items, last, totalElements } = await getAllBenchmarks({ page, size: pageSize });
        return {
            items,
            last,
            totalElements,
        };
    };

    const {
        results: benchmarks,
        isLoading,
        isLastPageReached,
        totalElements,
        hasNextPage,
        page,
        loadNextPage,
    } = usePaginate({
        fetchItems,
        pageSize: 64,
    });

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        on {benchmarks.length === 0 && isLoading ? <Icon icon={faSpinner} spin /> : totalElements} research problem
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
                <Row className="mt-3 flex-grow-1 justify-content-center">
                    {benchmarks?.length > 0 &&
                        benchmarks.map((benchmark) => <BenchmarkCard key={`${benchmark.research_problem.id}`} benchmark={benchmark} />)}
                    {!isLoading && hasNextPage && (
                        <div className="text-center">
                            <Button onClick={loadNextPage} size="sm" color="light">
                                Load more...
                            </Button>
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && page !== 0 && <div className="text-center my-3">You have reached the last page</div>}
                </Row>

                {benchmarks.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No benchmarks yet</div>}
                {isLoading && (
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
                )}
            </Container>
        </>
    );
};

export default Benchmarks;
