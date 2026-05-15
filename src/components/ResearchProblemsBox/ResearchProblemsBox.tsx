import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Skeleton, toast } from '@heroui/react';
import { ResourceRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddResearchProblem from '@/components/Observatory/AddResearchProblem';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ResearchProblemsModal from '@/components/ResearchProblemsBox/ResearchProblemsModal';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { updateResource } from '@/services/backend/resources';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchProblemsBoxProps = {
    id: string;
    by: 'ResearchField' | 'Observatory';
    isEditMode?: boolean;
};

const ResearchProblemsBox: FC<ResearchProblemsBoxProps> = ({ id, by = 'ResearchField', isEditMode = false }) => {
    const {
        data: problems,
        isLoading,
        totalElements,
        mutate,
    } = usePaginate({
        fetchFunction: getResearchProblems,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getResearchProblems',
        prefixParams: 'researchProblemsBox_',
        fetchExtraParams: {
            ...(by === 'ResearchField' ? { researchField: id } : { observatoryId: id }),
            ...(by === 'ResearchField' ? { includeSubfields: true } : {}),
            sort: ['created_at,desc'],
        },
        defaultPageSize: 10,
    });

    const deleteResearchProblem = async (researchProblem: ResourceRepresentation) => {
        try {
            await updateResource(researchProblem.id, { observatory_id: MISC.UNKNOWN_ID, organization_id: MISC.UNKNOWN_ID });
            mutate();
            toast.success('Research problem deleted successfully');
        } catch {
            toast.danger('error deleting a research problem');
        }
    };
    const [openModal, setOpenModal] = useState(false);
    const { user } = useAuthentication();
    const [showAddResearchProblemDialog, setShowAddResearchProblemDialog] = useState(false);

    const canEdit = isEditMode && !!user && user.isCurationAllowed && by === 'Observatory';
    const visibleProblems = problems?.slice(0, 5);

    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            <div className="flex items-center gap-2">
                <h2 className="text-xl mb-0 grow">Research problems</h2>
                {canEdit && (
                    <>
                        <Button variant="outline" size="sm" onPress={() => setShowAddResearchProblemDialog((v) => !v)}>
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Add
                        </Button>
                        <AddResearchProblem
                            showDialog={showAddResearchProblemDialog}
                            toggle={() => setShowAddResearchProblemDialog((v) => !v)}
                            id={id}
                            afterSubmit={() => mutate()}
                        />
                    </>
                )}
            </div>
            <hr className="mt-2" />
            <div className="grow">
                {!isLoading && visibleProblems && visibleProblems.length > 0 && (
                    <ul className="flex flex-col gap-1 m-0 p-0 list-none">
                        {visibleProblems.map((rp) => (
                            <li key={`rp${rp.id}`} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-b-0">
                                <Link
                                    href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}
                                    className="grow text-sm hover:text-accent transition-colors break-words"
                                >
                                    {rp.label}
                                </Link>
                                {canEdit && (
                                    <ActionButton
                                        title="Delete this research problem from the observatory"
                                        icon={faTrash}
                                        requireConfirmation
                                        confirmationMessage="Are you sure?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: () => deleteResearchProblem(rp),
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {!isLoading && totalElements === 0 && <div className="text-center my-6 text-muted text-sm">No research problems yet</div>}
            </div>
            {isLoading && (
                <div className="mt-4 mb-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Skeleton className="w-5/6 h-2 rounded" />
                        <Skeleton className="w-1/2 h-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="w-5/6 h-2 rounded" />
                        <Skeleton className="w-1/2 h-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="w-5/6 h-2 rounded" />
                        <Skeleton className="w-1/2 h-1.5 rounded" />
                    </div>
                </div>
            )}
            {!isLoading && problems && problems.length > 5 && (
                <div className="text-center mt-3">
                    <Button size="sm" variant="tertiary" onPress={() => setOpenModal((v) => !v)}>
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} id={id} by={by} />}
                </div>
            )}
        </div>
    );
};

export default ResearchProblemsBox;
