import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import pluralize from 'pluralize';
import { Dispatch, SetStateAction } from 'react';
import { Alert, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import AuthorsContentLoader from '@/components/TopAuthors/AuthorsContentLoader';
import useResearchProblemAuthors from '@/components/TopAuthors/hooks/useTopAuthors';
import { ResearchProblemTopAuthor } from '@/services/backend/problems';

type ResearchProblemAuthorsModalProps = {
    researchProblemId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ResearchProblemAuthorsModal = ({ researchProblemId, openModal, setOpenModal }: ResearchProblemAuthorsModalProps) => {
    const { authors, isLoading, isLast, loadNext } = useResearchProblemAuthors({
        researchProblemId,
        pageSize: 5,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <FontAwesomeIcon icon={faAward} className="text-primary ms-2" /> Top authors
            </ModalHeader>
            <ModalBody className="p-0">
                <Alert color="info" className="m-3">
                    The authors listed below are engaged researchers. They are sorted by the number of papers per author. The list can be used to find
                    suitable peer-reviewers.
                </Alert>
                <ListGroup flush className="overflow-hidden rounded">
                    {authors.map((author, index) => (
                        <ListGroupItem className="pt-2 pb-2" key={`rp${index}`}>
                            <div className="d-flex align-items-center">
                                <div className="pe-2 text-muted h5 mb-0 ms-2" style={{ flexBasis: '2em' }}>
                                    {index + 1}.
                                </div>
                                <div className="flex-grow-1">
                                    <AuthorCard
                                        author={author.author.value}
                                        // @ts-expect-error
                                        paperAmount={pluralize('paper', (author as ResearchProblemTopAuthor).papers, true)}
                                        isVisibleGoogleScholar
                                        isVisibleShowCitations
                                    />
                                </div>
                            </div>
                        </ListGroupItem>
                    ))}

                    {!isLoading && !isLast && (
                        <ListGroupItem className="py-2 text-center" action role="button" tabIndex={0} onClick={loadNext}>
                            Load more...
                        </ListGroupItem>
                    )}
                </ListGroup>
                {!isLoading && authors?.length === 0 && <div className="mt-4 mb-4">No authors yet</div>}
                {isLoading && authors?.length === 0 && <AuthorsContentLoader />}
            </ModalBody>
        </Modal>
    );
};

export default ResearchProblemAuthorsModal;
