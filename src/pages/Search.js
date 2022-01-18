import { useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import Results from 'components/Search/Results';
import Filters from 'components/Search/Filters';
import { unionBy } from 'lodash';
import TitleBar from 'components/TitleBar/TitleBar';
import { useSearch } from 'components/Search/hooks/useSearch';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';

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
                    <Col className="col-sm-4 px-0">
                        <div className="box rounded me-4 p-4 h-100">
                            <Filters />
                        </div>
                    </Col>
                    <Col className="col-sm-8 px-0">
                        <div className="box rounded p-4">
                            {isLoading() && Object.keys(results).every(v => results[v] && results[v].length === 0) && (
                                <ContentLoader
                                    height="100%"
                                    width="100%"
                                    viewBox="0 0 100 25"
                                    style={{ width: '100% !important' }}
                                    speed={2}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" width="50" height="3" />
                                    <rect x="0" y="5" width="100%" height="3" />
                                    <rect x="0" y="10" width="100%" height="3" />
                                    <rect x="0" y="15" width="100%" height="3" />
                                    <rect x="0" y="20" width="100%" height="3" />
                                </ContentLoader>
                            )}

                            {!searchTerm || (!isLoading() && Object.keys(results).every(v => results[v] && results[v].length === 0)) ? (
                                <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                            ) : (
                                <div>
                                    {allFilters.map(filter => {
                                        if (
                                            selectedFilters.length === 0 ||
                                            (selectedFilters.length > 0 && selectedFilters.map(c => c && c.id).includes(filter.id))
                                        ) {
                                            return (
                                                <div key={`filter-result${filter.id}`}>
                                                    <Results
                                                        loading={isNextPageLoading[filter.id] || false}
                                                        hasNextPage={hasNextPage[filter.id] || false}
                                                        loadMore={() => loadMoreResults(filter.id, currentPage[filter.id])}
                                                        items={results[filter.id] || []}
                                                        label={filter.label || filter.id}
                                                        class={filter.id}
                                                        currentPage={currentPage[filter.id] || 0}
                                                        showNoResultsMessage={selectedFilters.map(c => c.id).includes(filter.id)}
                                                    />
                                                </div>
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
