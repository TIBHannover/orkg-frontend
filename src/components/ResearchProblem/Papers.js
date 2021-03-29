import { Container, Button, ListGroup, ListGroupItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import PaperCard from 'components/PaperCard/PaperCard';
import useResearchProblemPapers from 'components/ResearchProblem/hooks/useResearchProblemPapers';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Papers = ({ id, boxShadow }) => {
    const [contributions, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchProblemPapers({ researchProblemId: id });

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                </div>
            </Container>
            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {contributions.length > 0 && (
                        <div>
                            {contributions.map(contribution => {
                                return (
                                    contribution && (
                                        <PaperCard
                                            paper={{
                                                id: contribution.papers[0].subject.id,
                                                title: contribution.papers[0].subject.label,
                                                ...contribution.papers[0].data
                                            }}
                                            contribution={{ id: contribution.subject.id, title: contribution.subject.label }}
                                            key={`pc${contribution.id}`}
                                        />
                                    )
                                );
                            })}
                        </div>
                    )}
                    {contributions.length === 0 && !isLoadingPapers && (
                        <div className="text-center mt-4 mb-4">
                            There are no papers for this research problem, yet.
                            <br />
                            <br />
                            <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                <Button size="sm" color="primary " className="mr-3">
                                    Add paper
                                </Button>
                            </Link>
                        </div>
                    )}
                    {isLoadingPapers && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isLoadingPapers && hasNextPage && !isLastPageReached && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                            action
                            onClick={!isLoadingPapers ? loadMorePapers : undefined}
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more papers
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </ListGroup>
                <ComparisonPopup />
            </Container>
        </>
    );
};

Papers.propTypes = {
    id: PropTypes.string.isRequired,
    boxShadow: PropTypes.bool
};

Papers.defaultProps = {
    boxShadow: false
};

export default Papers;
