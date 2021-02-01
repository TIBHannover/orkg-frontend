import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import useResearchFieldComparison from 'components/ResearchField/hooks/useResearchFieldComparison';
import PropTypes from 'prop-types';
import { ListGroup } from 'reactstrap';

const Comparisons = ({ researchFieldId }) => {
    const [comparisons, isLoadingComparisons, hasNextPageComparison, isLastPageReachedComparison, loadMoreComparisons] = useResearchFieldComparison({
        researchFieldId
    });

    return (
        <>
            {comparisons.length > 0 && (
                <ListGroup className="box">
                    {comparisons.map(comparison => {
                        return comparison && <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                    })}
                    {!isLoadingComparisons && hasNextPageComparison && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isLoadingComparisons ? loadMoreComparisons : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more comparisons
                        </div>
                    )}
                    {!hasNextPageComparison && isLastPageReachedComparison && <div className="text-center mt-3">You have reached the last page.</div>}
                </ListGroup>
            )}
            {comparisons.length === 0 && !isLoadingComparisons && (
                <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                    There are no published comparisons for this research field, yet.
                    <br />
                </div>
            )}
            {isLoadingComparisons && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
        </>
    );
};

Comparisons.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default Comparisons;
