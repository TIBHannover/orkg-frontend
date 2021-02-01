import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/PaperCard/PaperCard';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, ListGroup } from 'reactstrap';

const Papers = ({ researchFieldId, boxShadow }) => {
    const [papers, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchFieldPapers({ researchFieldId });

    return (
        <>
            {papers.length > 0 && (
                <ListGroup className={boxShadow ? 'box' : ''}>
                    {papers.map(paper => {
                        return (
                            paper && (
                                <PaperCard
                                    paper={{
                                        id: paper.id,
                                        title: paper.label,
                                        ...paper
                                    }}
                                    key={`pc${paper.id}`}
                                />
                            )
                        );
                    })}
                    {!isLoadingPapers && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={!isLoadingPapers ? loadMorePapers : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isLoadingPapers ? loadMorePapers : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more papers
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page.</div>}
                </ListGroup>
            )}
            {papers.length === 0 && !isLoadingPapers && (
                <div className={boxShadow ? 'container box rounded' : ''}>
                    <div className="p-5 text-center mt-4 mb-4">
                        There are no papers for this research field, yet.
                        <br />
                        <br />
                        <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                            <Button size="sm" color="primary " className="mr-3">
                                Add paper
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
            {isLoadingPapers && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
        </>
    );
};

Papers.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    boxShadow: PropTypes.bool
};

Papers.defaultProps = {
    boxShadow: false
};

export default Papers;
