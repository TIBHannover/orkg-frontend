import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthorRecordRepresentation } from '@orkg/orkg-client';
import { Dispatch, SetStateAction } from 'react';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Alert from '@/components/Ui/Alert/Alert';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { getAuthorStatisticsByResearchProblemId, researchProblemsUrl } from '@/services/backend/research-problems';

type ResearchProblemAuthorsModalProps = {
    researchProblemId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ResearchProblemAuthorsModal = ({ researchProblemId, openModal, setOpenModal }: ResearchProblemAuthorsModalProps) => {
    const {
        data: authors,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getAuthorStatisticsByResearchProblemId,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getAuthorStatisticsByResearchProblemId',
        prefixParams: 'authorStatistics_',
        fetchExtraParams: {
            id: researchProblemId,
            sort: ['paper_count,desc'],
        },
        defaultPageSize: 10,
    });

    const renderListItem = (author: AuthorRecordRepresentation, lastItem?: boolean, index: number = 0) => (
        <div className="px-2" key={`rpAuthor${index}`}>
            <div className="d-flex align-items-center py-2">
                <div className="pe-2 text-muted h5 mb-0 ms-2" style={{ flexBasis: '2em' }}>
                    {index + 1}.
                </div>{' '}
                <div className="flex-grow-1">
                    <AuthorCard author={author.authorName} paperAmount={author.paperCount} isVisibleGoogleScholar isVisibleShowCitations />{' '}
                </div>
            </div>
            {!lastItem && <hr className="mb-0 mt-1" />}
        </div>
    );

    return (
        <Modal
            isOpen={openModal}
            toggle={() => setOpenModal((v) => !v)}
            size="lg"
            onExit={() => {
                setPage(0);
                setPageSize(10);
            }}
        >
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <FontAwesomeIcon icon={faAward} className="text-primary ms-2" /> Top authors
            </ModalHeader>
            <ModalBody className="p-0 px-2">
                <Alert color="info" className="m-3">
                    The authors listed below are engaged researchers. They are sorted by the number of papers per author. The list can be used to find
                    suitable peer-reviewers.
                </Alert>
                <ListPaginatedContent<AuthorRecordRepresentation>
                    renderListItem={renderListItem}
                    pageSize={pageSize}
                    label="top authors"
                    isLoading={isLoading}
                    items={authors ?? []}
                    hasNextPage={hasNextPage}
                    page={page}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalElements={totalElements}
                    error={error}
                    totalPages={totalPages}
                    boxShadow={false}
                    flush={false}
                    listGroupProps={{ className: 'pt-2 pb-2' }}
                    prefixParams="authorStatistics_"
                    noDataComponent={<div className="mt-4 mb-4">No authors yet</div>}
                />
            </ModalBody>
        </Modal>
    );
};

export default ResearchProblemAuthorsModal;
