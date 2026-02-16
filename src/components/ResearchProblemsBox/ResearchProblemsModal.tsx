import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ResourceRepresentation, VisibilityFilter } from '@orkg/orkg-client';
import { useQueryState } from 'nuqs';
import { Dispatch, FC, SetStateAction } from 'react';
import { toast } from 'react-toastify';

import useAuthentication from '@/components/hooks/useAuthentication';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import ResearchProblemCard from '@/components/ResearchProblemsBox/ResearchProblemCard';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
        } catch (error) {
            toast.error('error deleting a research problem');
        }
    };

    const renderListItem = (rp: ResourceRepresentation, lastItem?: boolean, index: number = 0) => (
        <div key={`rp${rp.id}`} className="p-2">
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
            {!lastItem && <hr className="mb-0 mt-3" />}
        </div>
    );

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <div className="d-flex justify-content-end mb-2 me-2">
                    <div>Research problems</div>
                    <div className="mb-0 ms-2 me-2">
                        <Input
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
                            bsSize="sm"
                            type="select"
                            name="problems_visibility"
                            disabled={isLoading}
                        >
                            <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                            <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                            <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
                        </Input>
                    </div>
                    {id !== RESOURCES.RESEARCH_FIELD_MAIN && by === 'ResearchField' && (
                        <div className="d-flex rounded" style={{ fontSize: '0.875rem', padding: '0.25rem 0' }}>
                            <FormGroup check className="mb-0">
                                <Label check className="mb-0">
                                    <Input
                                        onChange={(e) => setIncludeSubfields(e.target.checked)}
                                        checked={includeSubfields}
                                        type="checkbox"
                                        disabled={isLoading}
                                    />
                                    Include subfields
                                </Label>
                            </FormGroup>
                        </div>
                    )}
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
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
            </ModalBody>
        </Modal>
    );
};

export default ResearchProblemsModal;
