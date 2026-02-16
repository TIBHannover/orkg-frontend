import { ResourceRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';

import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import ROUTES from '@/constants/routes';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { reverseWithSlug } from '@/utils';

type ResearchProblemsModalProps = {
    organizationId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ResearchProblemsModal: FC<ResearchProblemsModalProps> = ({ organizationId, openModal, setOpenModal }) => {
    const {
        data: problems,
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
        fetchFunction: getResearchProblems,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getResearchProblems',
        prefixParams: 'researchProblems_',
        fetchExtraParams: {
            addressedByOrganization: organizationId,
        },
        defaultPageSize: 15,
    });

    const renderListItem = (rp: ResourceRepresentation, lastItem?: boolean, index: number = 0) => (
        <div key={`p${rp.id}`} className="px-2">
            <div className="d-flex align-items-center py-2">
                <div className="flex-grow-1">
                    <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>{rp.label}</Link>
                </div>
            </div>
            {!lastItem && <hr className="mb-0 mt-1" />}
        </div>
    );

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <div className="d-flex justify-content-end mb-2 me-2">
                    <div>Research problems</div>
                </div>
            </ModalHeader>
            <ModalBody className="p-2">
                <ListPaginatedContent<ResourceRepresentation>
                    renderListItem={renderListItem}
                    pageSize={pageSize}
                    label="research problem"
                    isLoading={isLoading}
                    items={problems ?? []}
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
                    prefixParams="researchProblems_"
                    noDataComponent={<div className="mt-4 mb-4">No research problems yet</div>}
                />
            </ModalBody>
        </Modal>
    );
};

export default ResearchProblemsModal;
