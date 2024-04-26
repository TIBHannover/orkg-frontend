import ObservatoryCard from 'components/Cards/ObservatoryCard/ObservatoryCard';
import usePaginate from 'components/hooks/usePaginate';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import { Button, Row } from 'reactstrap';
import { getObservatories } from 'services/backend/observatories';

const ResearchFieldObservatories = ({ rfId }) => {
    const fetchItems = async ({ researchFieldId, page, pageSize }) => {
        const { content: items, last, totalElements } = await getObservatories({ researchFieldId, page, size: pageSize });
        return {
            items,
            last,
            totalElements,
        };
    };

    const {
        results: observatories,
        isLoading,
        hasNextPage,
        isLastPageReached,
        page,
        loadNextPage,
    } = usePaginate({
        fetchItems,
        fetchItemsExtraParams: { researchFieldId: rfId },
        pageSize: 20,
    });

    return (
        <Row>
            {observatories?.length > 0 && observatories.map((observatory) => <ObservatoryCard key={`${observatory.id}`} observatory={observatory} />)}
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <div className="mt-3">
                        <div>
                            <ContentLoader
                                height="10%"
                                width="100%"
                                viewBox="0 0 100 10"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="2" ry="2" width="48" height="10" />
                                <rect x="50" y="0" rx="2" ry="2" width="48" height="10" />
                            </ContentLoader>
                        </div>
                    </div>
                </div>
            )}
            {!isLoading && hasNextPage && (
                <div className="text-center">
                    <Button onClick={loadNextPage} size="sm" color="light">
                        Load more...
                    </Button>
                </div>
            )}
            {!hasNextPage && isLastPageReached && page !== 0 && <div className="text-center my-3">You have reached the last page</div>}
        </Row>
    );
};

ResearchFieldObservatories.propTypes = {
    rfId: PropTypes.string,
};

export default ResearchFieldObservatories;
