import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Checkbox, Label, ListBox, Modal, Select, toast } from '@heroui/react';
import { ResourceRepresentation, VisibilityFilter } from '@orkg/orkg-client';
import { useQueryState } from 'nuqs';
import { Dispatch, FC, SetStateAction } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import ResearchProblemCard from '@/components/ResearchProblemsBox/ResearchProblemCard';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { MISC, RESOURCES } from '@/constants/graphSettings';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { updateResource } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

type ResearchProblemsModalProps = {
    id: string;
    by: 'ResearchField' | 'Observatory';
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ResearchProblemsModal: FC<ResearchProblemsModalProps> = ({ id, by = 'ResearchField', openModal, setOpenModal }) => {
    const { isCurationAllowed } = useAuthentication();
    const [visibility, setVisibility] = useQueryState<VisibilityFilter>('problems_visibility', {
        defaultValue: VisibilityFilter.AllListed,
        parse: (value) => value as VisibilityFilter,
    });
    const [includeSubfields, setIncludeSubfields] = useQueryState<boolean>('problems_include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });
    const {
        data: problems,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        pageSize,
        setPage,
        setPageSize,
        totalPages,
        error,
        mutate,
    } = usePaginate({
        fetchFunction: getResearchProblems,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getResearchProblems',
        prefixParams: 'researchProblems_',
        fetchExtraParams: {
            ...(by === 'ResearchField' ? { researchField: id } : { observatoryId: id }),
            ...(by === 'ResearchField' ? { includeSubfields } : {}),
            sort: ['created_at,desc'],
            visibility,
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

    const renderListItem = (rp: ResourceRepresentation) => (
        <div key={`rp${rp.id}`} className="px-2 py-3 border-b border-border last:border-b-0">
            <ResearchProblemCard
                problem={rp as unknown as Resource}
                options={
                    isCurationAllowed && by === 'Observatory'
                        ? [
                              {
                                  label: 'Delete this research problem from the observatory',
                                  action: () => deleteResearchProblem(rp),
                                  icon: faTrash,
                                  requireConfirmation: true,
                              },
                          ]
                        : []
                }
            />
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
                        <div className="flex flex-row flex-nowrap items-center gap-4 mt-3">
                            <Select
                                aria-label="Visibility filter"
                                value={visibility}
                                onChange={(key) => setVisibility(key as VisibilityFilter)}
                                isDisabled={isLoading}
                                className="flex flex-row items-center gap-2"
                            >
                                <Label className="text-sm whitespace-nowrap">Show</Label>
                                <Select.Trigger className="min-w-40">
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id={VISIBILITY_FILTERS.ALL_LISTED} textValue="Recently added">
                                            Recently added
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id={VISIBILITY_FILTERS.FEATURED} textValue="Featured">
                                            Featured
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id={VISIBILITY_FILTERS.UNLISTED} textValue="Unlisted">
                                            Unlisted
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                            {id !== RESOURCES.RESEARCH_FIELD_MAIN && by === 'ResearchField' && (
                                <Checkbox
                                    isSelected={includeSubfields}
                                    onChange={(isSelected) => setIncludeSubfields(isSelected)}
                                    isDisabled={isLoading}
                                >
                                    <Checkbox.Content className="text-sm whitespace-nowrap">
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        Include subfields
                                    </Checkbox.Content>
                                </Checkbox>
                            )}
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <ListPaginatedContent<ResourceRepresentation>
                                renderListItem={renderListItem}
                                pageSize={pageSize}
                                label="research problems"
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
                                prefixParams="researchProblems_"
                            />
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ResearchProblemsModal;
