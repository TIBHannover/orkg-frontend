import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Skeleton } from '@heroui/react';
import pluralize from 'pluralize';
import { Dispatch, FC, SetStateAction } from 'react';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import { getContributorsByResearchProblemId, researchProblemsUrl } from '@/services/backend/research-problems';

type ContributorsModalProps = {
    researchProblemId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ContributorsModal: FC<ContributorsModalProps> = ({ researchProblemId, openModal, setOpenModal }) => {
    const {
        data: contributors,
        isLoading,
        totalElements,
        error,
    } = usePaginate({
        fetchFunction: getContributorsByResearchProblemId,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getContributorsByResearchProblemId',
        fetchExtraParams: {
            id: researchProblemId,
            sort: ['total_count,desc'],
        },
        defaultPageSize: 30,
    });

    return (
        <Modal.Backdrop
            isOpen={openModal}
            onOpenChange={(open) => {
                if (!open) setOpenModal(false);
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-4xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>
                            <FontAwesomeIcon icon={faAward} className="text-accent mr-2" />
                            Top 30 Contributors
                        </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="pl-4 pr-4">
                            {!isLoading &&
                                contributors &&
                                contributors.map((contributor, index) => (
                                    <div className="pt-2 pb-2" key={`rp${index}`}>
                                        <div className="flex">
                                            <div className="pl-6 pr-6 pt-2">{index + 1}.</div>
                                            <div>
                                                <ContributorCard
                                                    id={contributor.contributorId}
                                                    subTitle={`${pluralize('contribution', contributor.totalCount, true)}`}
                                                />
                                            </div>
                                        </div>
                                        {contributors.length - 1 !== index && <hr className="mb-0 mt-4" />}
                                    </div>
                                ))}
                            {!isLoading && !error && contributors?.length === 0 && (
                                <div className="mt-6 mb-6">
                                    No contributors yet.
                                    <i> Be the first contributor!</i>
                                </div>
                            )}
                            {!isLoading && error && <div className="mt-6 mb-6 text-red-600">Something went wrong while loading contributors.</div>}
                            {isLoading && (
                                <div className="mt-6 mb-6 flex">
                                    <div className="w-0.5 bg-gray-200 mr-4 shrink-0" />
                                    <div className="flex flex-col gap-4 grow">
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-3/4 h-2 rounded" />
                                            <Skeleton className="w-1/2 h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-3/4 h-2 rounded" />
                                            <Skeleton className="w-3/4 h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-1/2 h-2 rounded" />
                                            <Skeleton className="w-3/4 h-1.5 rounded" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ContributorsModal;
