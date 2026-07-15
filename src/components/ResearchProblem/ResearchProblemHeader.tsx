import { faEllipsisV, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Dropdown, Separator, Skeleton } from '@heroui/react';
import Link from 'next/link';
import { FC, useState } from 'react';
import useSWR from 'swr';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import CheckClasses from '@/components/CheckClasses/CheckClasses';
import CheckSlug from '@/components/CheckSlug/CheckSlug';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import FeaturedMark from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Contributors from '@/components/ResearchProblem/Contributors';
import ExternalDescription from '@/components/ResearchProblem/ExternalDescription';
import useResearchProblem from '@/components/ResearchProblem/hooks/useResearchProblem';
import ResearchFieldsBox from '@/components/ResearchProblem/ResearchFieldBox/ResearchFieldsBox';
import SuperResearchProblemBox from '@/components/ResearchProblem/SuperResearchProblemBox/SuperResearchProblemBox';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import AuthorsBox from '@/components/TopAuthors/AuthorsBox';
import Container from '@/components/Ui/Structure/Container';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResearchFields, newResearchFieldUrl as researchFieldUrl } from '@/services/backend/researchFields';
import { Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchProblemData = Partial<Resource> & {
    description?: string;
    sameAs?: { label: string } | null;
    subProblems?: Resource[];
};

type UseResearchProblemResult = {
    researchProblemData: ResearchProblemData;
    superProblems: Resource[];
    isLoading: boolean;
    isFailedLoading: boolean;
    loadResearchProblemData: (id: string) => void;
};

type ResearchProblemHeaderProps = {
    id: string;
};

const ResearchProblemHeader: FC<ResearchProblemHeaderProps> = ({ id }) => {
    const [editMode, setEditMode] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const { researchProblemData, superProblems, isLoading, isFailedLoading, loadResearchProblemData } = useResearchProblem({
        id,
    }) as UseResearchProblemResult;

    const { data: researchFields, isLoading: isLoadingResearchFields } = useSWR(
        id ? [{ researchProblem: id, sort: ['research_problem_count,desc'] }, researchFieldUrl, 'getResearchFields'] : null,
        ([params]) => getResearchFields(params),
    );

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: researchProblemData?.unlisted ?? false,
        featured: researchProblemData?.featured ?? false,
    });

    const subProblems =
        !showMoreFields && researchProblemData.subProblems && researchProblemData.subProblems.length > 0
            ? researchProblemData.subProblems.slice(0, 9)
            : (researchProblemData.subProblems ?? []);

    return (
        <>
            {!isLoading && !isFailedLoading && researchProblemData.label && (
                <CheckSlug label={researchProblemData.label} route={ROUTES.RESEARCH_PROBLEM} />
            )}
            {!isLoading && !isFailedLoading && researchProblemData.id && (
                <CheckClasses classes={researchProblemData.classes} targetClass={CLASSES.PROBLEM} resourceId={researchProblemData.id} />
            )}
            {isLoading && (
                <>
                    <Container className="mt-6 mb-6">
                        <Skeleton className="w-full h-5 rounded" />
                    </Container>
                    <Container className="mt-6 mb-6">
                        <div className="box rounded p-4 text-left flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </Container>
                </>
            )}
            <Breadcrumbs researchFieldId={!isLoadingResearchFields && researchFields?.content?.length ? researchFields.content[0].id : null} />
            {!isLoading && !isFailedLoading && (
                <>
                    <TitleBar
                        titleAddition={
                            <>
                                <SubTitle>Research problem</SubTitle>
                                <FeaturedMark size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />{' '}
                                <div className="inline-block ml-1">
                                    <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </div>
                            </>
                        }
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    className="button--orkg-secondary"
                                    onPress={() => setEditMode((v) => !v)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`} textValue="View resource">
                                                View resource
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </>
                        }
                        wrap={false}
                    >
                        {researchProblemData.label}
                    </TitleBar>
                    {editMode && (
                        <DataBrowserDialog
                            show={editMode}
                            isEditMode
                            toggleModal={() => setEditMode((v) => !v)}
                            id={id}
                            onCloseModal={() => loadResearchProblemData(id)}
                        />
                    )}
                    <Container>
                        <div className="box rounded p-4">
                            <h2 className="text-xl">Description</h2>
                            {researchProblemData.description && <div className="mb-6">{researchProblemData.description}</div>}
                            {!researchProblemData.description && <div className="mb-2">No description for this research problem yet</div>}
                            {researchProblemData.sameAs && (
                                <ExternalDescription
                                    query={researchProblemData.sameAs ? researchProblemData.sameAs.label : (researchProblemData.label ?? '')}
                                />
                            )}

                            {researchProblemData.subProblems && researchProblemData.subProblems.length > 0 && (
                                <>
                                    <Separator className="my-6" />

                                    <h2 className="text-xl">Subproblems</h2>
                                    <div>
                                        {subProblems.map((subfield) => (
                                            <Link
                                                key={`index${subfield.id}`}
                                                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                    researchProblemId: subfield.id,
                                                    slug: subfield.label,
                                                })}
                                            >
                                                <Chip className="mr-2 mb-2">{subfield.label}</Chip>
                                            </Link>
                                        ))}
                                        {researchProblemData.subProblems.length > 9 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowMoreFields((v) => !v)}
                                                className="p-0 ml-2 bg-transparent border-0 text-accent hover:underline text-sm"
                                            >
                                                {showMoreFields ? 'Show less subproblems' : 'Show more subproblems'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            <Separator className="my-6" />
                            <Contributors researchProblemId={id} />
                        </div>
                    </Container>
                    <Container className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AuthorsBox researchProblemId={id} />
                            <ResearchFieldsBox isLoading={isLoadingResearchFields} researchFields={researchFields?.content ?? []} />
                            <SuperResearchProblemBox isLoading={isLoadingResearchFields} superProblems={superProblems} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
};

export default ResearchProblemHeader;
