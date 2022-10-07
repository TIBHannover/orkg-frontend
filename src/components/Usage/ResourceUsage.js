import { Container, ListGroupItem, ListGroup } from 'reactstrap';
import PaperCard from 'components/PaperCard/PaperCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import useUsage from 'components/Usage/hooks/useUsage';
import PropTypes from 'prop-types';

const ResourceUsage = ({ id }) => {
    const { isNextPageLoading, hasNextPage, papers, page, totalElements, isLastPageReached, handleLoadMore } = useUsage({
        id,
    });

    return (
        <>
            <div>
                <Container className="p-0">
                    {papers.length > 0 && (
                        <ListGroup>
                            {papers
                                .filter(r => r)
                                .map(resource => (
                                    <PaperCard
                                        paper={{
                                            id: resource.id,
                                            title: resource.label,
                                            ...resource,
                                        }}
                                        showBadge={true}
                                        showCurationFlags={false}
                                        showAddToComparison={false}
                                        key={`p${resource.id}`}
                                    />
                                ))}
                        </ListGroup>
                    )}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center p-4">
                            There are no papers refer to this resource, yet
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
                            <Icon icon={faAngleDoubleDown} /> Load more resource
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page
                        </ListGroupItem>
                    )}
                </Container>
                <ComparisonPopup />
            </div>
        </>
    );
};
ResourceUsage.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ResourceUsage;
