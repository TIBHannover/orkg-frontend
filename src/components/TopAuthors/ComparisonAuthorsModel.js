import AuthorCard from 'components/AuthorCard/AuthorCard';
import AuthorsContentLoader from 'components/TopAuthors/AuthorsContentLoader';
import PropTypes from 'prop-types';
import { Alert, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import useTopAuthors from './hooks/useTopAuthors';

const ComparisonAuthorsModel = ({ comparisonId, toggle }) => {
    const { authors, isLoading, isLast, loadNext } = useTopAuthors({
        comparisonId,
        pageSize: 5,
    });

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Top authors</ModalHeader>
            <ModalBody className="p-0">
                <Alert color="info" className="m-3">
                    The authors listed below are engaged researchers. Each author is linked to a paper displayed in the comparison. The list can be
                    used to find suitable peer-reviewers.
                </Alert>
                <ListGroup flush className="overflow-hidden rounded">
                    {authors.map((author, index) => (
                        <ListGroupItem className="py-2 px-4" key={index}>
                            <AuthorCard
                                author={author.author.value}
                                papers={author.info}
                                isVisibleGoogleScholar
                                isVisibleShowCitations
                                semanticScholarAuthors={author.semanticScholarAuthors}
                            />
                        </ListGroupItem>
                    ))}

                    {!isLoading && !isLast && (
                        <ListGroupItem className="py-2 text-center" action role="button" tabIndex="0" onClick={loadNext}>
                            Load more...
                        </ListGroupItem>
                    )}
                </ListGroup>

                {!isLoading && authors?.length === 0 && <div className="mt-4 mb-4">No authors found</div>}
                {isLoading && authors?.length === 0 && <AuthorsContentLoader />}
            </ModalBody>
        </Modal>
    );
};

ComparisonAuthorsModel.propTypes = {
    comparisonId: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default ComparisonAuthorsModel;
