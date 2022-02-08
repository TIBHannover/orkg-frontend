import { Container, Button, ListGroup } from 'reactstrap';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import useContributionComparison from './hooks/useContributionComparison';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    button {
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

function ContributionComparisons(props) {
    const [comparisons, isLoadingComparisons, hasNextPage, isLastPageReached, loadMoreComparisons] = useContributionComparison(props.contributionId);

    if (comparisons.length === 0 && !isLoadingComparisons) {
        return null;
    }

    return (
        <div>
            <Title>Comparisons</Title>

            <Container className="mt-3 p-0">
                {comparisons.length > 0 && (
                    <ListGroup>
                        {comparisons.map(comparison => {
                            return (
                                comparison && (
                                    <ComparisonCard
                                        rounded={!hasNextPage ? 'false' : 'true'}
                                        comparison={{ ...comparison }}
                                        key={`pc${comparison.id}`}
                                        showCurationFlags={false}
                                        showBadge={false}
                                    />
                                )
                            );
                        })}
                    </ListGroup>
                )}
                {!isLoadingComparisons && hasNextPage && (
                    <StyledLoadMoreButton className="text-end action">
                        <Button
                            color="link"
                            size="sm"
                            className="btn btn-link btn-sm"
                            onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}
                        >
                            + Load more
                        </Button>
                    </StyledLoadMoreButton>
                )}
                {isLoadingComparisons && (
                    <StyledLoadMoreButton className="text-end action">
                        <Button color="link" size="sm" className="btn btn-link btn-sm" disabled>
                            <Icon icon={faSpinner} spin /> Loading...
                        </Button>
                    </StyledLoadMoreButton>
                )}
                {!hasNextPage && isLastPageReached && <div className="text-center mt-2">You have reached the last page</div>}
            </Container>
        </div>
    );
}

ContributionComparisons.propTypes = {
    contributionId: PropTypes.string.isRequired
};

export default ContributionComparisons;
