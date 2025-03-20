import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAuthorWorks from 'components/Author/hooks/useAuthorWorks';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ReviewCard from 'components/Cards/ReviewCard/ReviewCard';
import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { Container, ListGroup, ListGroupItem } from 'reactstrap';
import { convertComparisonToNewFormat, convertPaperToNewFormat, convertReviewToNewFormat, convertVisualizationToNewFormat } from 'utils';

const AuthorWorks = ({ authorId = null, authorString = null }) => {
    const { isNextPageLoading, hasNextPage, works, page, totalElements, isLastPageReached, handleLoadMore } = useAuthorWorks({
        authorId,
        authorString,
    });

    const renderItem = useCallback((item) => {
        if (item?.classes?.includes(CLASSES.PAPER)) {
            return (
                <PaperCard
                    paper={convertPaperToNewFormat(item)}
                    showBadge
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`p${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.COMPARISON)) {
            return (
                <ComparisonCard
                    comparison={convertComparisonToNewFormat(item)}
                    showBadge
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`c${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.VISUALIZATION)) {
            return (
                <VisualizationCard visualization={convertVisualizationToNewFormat(item)} showBadge showCurationFlags={false} key={`v${item.id}`} />
            );
        }
        if (item?.classes?.includes(CLASSES.SMART_REVIEW)) {
            return (
                <ReviewCard
                    review={convertReviewToNewFormat([item])}
                    showBadge
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`c${item.id}`}
                />
            );
        }
        return null;
    }, []);

    return (
        <>
            <TitleBar
                titleSize="h5"
                titleAddition={
                    <div className="text-muted">
                        {totalElements === 0 && isNextPageLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements} items
                    </div>
                }
            >
                Works
            </TitleBar>
            <Container className="p-0 box rounded">
                <ListGroup>
                    {works.length > 0 && works.filter((r) => r).map((resource) => renderItem(resource))}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center p-4">
                            There are no works of this author, yet
                        </ListGroupItem>
                    )}
                    {isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            <FontAwesomeIcon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            action
                            className="text-center"
                            tag="div"
                            onClick={!isNextPageLoading ? handleLoadMore : undefined}
                        >
                            Load more...
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
            <ComparisonPopup />
        </>
    );
};
AuthorWorks.propTypes = {
    authorId: PropTypes.string,
    authorString: PropTypes.string,
};

export default AuthorWorks;
