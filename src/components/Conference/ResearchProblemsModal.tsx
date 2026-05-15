import { Modal } from '@heroui/react';
import { ResourceRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';

import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import ROUTES from '@/constants/routes';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { reverseWithSlug } from '@/utilsTyped';

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

    const renderListItem = (rp: ResourceRepresentation, lastItem?: boolean) => (
        <div key={`p${rp.id}`} className="px-2">
            <Link
                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}
                className="block py-3 rounded hover:bg-default/50 px-2 transition-colors text-sm"
            >
                {rp.label}
            </Link>
            {!lastItem && <hr className="m-0 border-border" />}
        </div>
    );

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
                        <Modal.Heading>Research problems</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-2">
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
                            listGroupProps={{ className: 'py-2' }}
                            prefixParams="researchProblems_"
                            noDataComponent={<div className="my-6">No research problems yet</div>}
                        />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ResearchProblemsModal;
