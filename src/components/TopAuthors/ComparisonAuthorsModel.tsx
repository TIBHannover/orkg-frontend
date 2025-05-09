import { Alert, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import AuthorsContentLoader from '@/components/TopAuthors/AuthorsContentLoader';
import useTopAuthors from '@/components/TopAuthors/hooks/useTopAuthors';
import { ComparisonTopAuthor } from '@/services/backend/comparisons';

type ComparisonAuthorsModelProps = {
    comparisonId: string;
    toggle: () => void;
};

const ComparisonAuthorsModel = ({ comparisonId, toggle }: ComparisonAuthorsModelProps) => {
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
                <ListGroup flush className="overflow-hidden rounded mb-3">
                    {authors.map((author, index) => (
                        <ListGroupItem className="py-2 px-4" key={index}>
                            <AuthorCard
                                author={author.author.value}
                                // @ts-expect-error
                                papers={(author as ComparisonTopAuthor).info}
                                isVisibleGoogleScholar
                                isVisibleShowCitations
                            />
                        </ListGroupItem>
                    ))}

                    {!isLoading && !isLast && (
                        <ListGroupItem className="py-2 text-center" action role="button" tabIndex={0} onClick={loadNext}>
                            Load more...
                        </ListGroupItem>
                    )}
                </ListGroup>

                {!isLoading && authors?.length === 0 && (
                    <Alert color="info" className="m-3">
                        No authors found
                    </Alert>
                )}
                {isLoading && authors?.length === 0 && <AuthorsContentLoader />}
            </ModalBody>
        </Modal>
    );
};

export default ComparisonAuthorsModel;
