import { Container, ListGroupItem, ListGroup } from 'reactstrap';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import ReviewCard from 'components/ReviewCard/ReviewCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { CLASSES } from 'constants/graphSettings';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import useAuthorWorks from 'components/Author/hooks/useAuthorWorks';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import TitleBar from 'components/TitleBar/TitleBar';

const AuthorWorks = ({ authorId }) => {
    const { isNextPageLoading, hasNextPage, works, page, totalElements, isLastPageReached, handleLoadMore } = useAuthorWorks({
        authorId
    });

    const renderItem = useCallback(item => {
        if (item?.classes?.includes(CLASSES.PAPER)) {
            return (
                <PaperCard
                    paper={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`p${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.COMPARISON)) {
            return (
                <ComparisonCard
                    comparison={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`c${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.VISUALIZATION)) {
            return (
                <VisualizationCard
                    visualization={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`v${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.SMART_REVIEW)) {
            return <ReviewCard versions={[item]} showBadge={true} showCurationFlags={false} showAddToComparison={false} key={`c${item.id}`} />;
        }
        return null;
    }, []);

    return (
        <>
            <div>
                <TitleBar
                    titleSize="h5"
                    titleAddition={
                        <div className="text-muted">
                            {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} items
                        </div>
                    }
                >
                    Works
                </TitleBar>
                <Container className="p-0">
                    {works.length > 0 && <ListGroup>{works.filter(r => r).map(resource => renderItem(resource))}</ListGroup>}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center p-4">
                            There are no works of this author, yet.
                        </ListGroupItem>
                    )}
                    {isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
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
                            <Icon icon={faAngleDoubleDown} /> Load more works
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </Container>
                <ComparisonPopup />
            </div>
        </>
    );
};
AuthorWorks.propTypes = {
    authorId: PropTypes.object.isRequired
};

export default AuthorWorks;
