import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Modal } from '@heroui/react';
import { AuthorRecordRepresentation } from '@orkg/orkg-client';
import { Dispatch, SetStateAction } from 'react';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
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
        <div className="px-3" key={`rpAuthor${index}`}>
            <div className="flex items-center py-2">
                <div className="shrink-0 basis-8 pr-2 text-gray-500 text-xl ml-2">{index + 1}.</div>
                <div className="grow">
                    <AuthorCard author={author.authorName} paperAmount={author.paperCount} isVisibleGoogleScholar isVisibleShowCitations />
                </div>
            </div>
        </div>
    );

    return (
        <Modal.Backdrop
            isOpen={openModal}
            onOpenChange={(open) => {
                if (!open) {
                    setOpenModal(false);
                    setPage(0);
                    setPageSize(10);
                }
            }}
            isDismissable
        >
            <Modal.Container>
                <Modal.Dialog className="mt-20 max-w-4xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>
                            <FontAwesomeIcon icon={faAward} className="text-accent mr-2" /> Top authors
                        </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <Alert status="accent" className="mt-2 mb-4 rounded-2xl">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Engaged researchers</Alert.Title>
                                <Alert.Description>
                                    The authors listed below are sorted by the number of papers per author. The list can be used to find suitable
                                    peer-reviewers.
                                </Alert.Description>
                            </Alert.Content>
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
                            listGroupProps={{ className: 'py-2' }}
                            prefixParams="authorStatistics_"
                            noDataComponent={<div className="my-6">No authors yet</div>}
                        />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ResearchProblemAuthorsModal;
