import { faEllipsisV, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Dropdown, Skeleton } from '@heroui/react';
import Link from 'next/link';
import { FC, useState } from 'react';

import CheckClasses from '@/components/CheckClasses/CheckClasses';
import CheckSlug from '@/components/CheckSlug/CheckSlug';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useAuthentication from '@/components/hooks/useAuthentication';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useResearchField from '@/components/ResearchField/hooks/useResearchField';
import ExternalDescription from '@/components/ResearchProblem/ExternalDescription';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import Contributors from '@/components/TopContributors/Contributors';
import Container from '@/components/Ui/Structure/Container';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchFieldData = Resource & {
    description?: string;
    sameAs?: { label: string } | null;
};

type SubResearchField = {
    id: string;
    label: string;
};

type ResearchFieldHeaderProps = {
    id: string;
};

const ResearchFieldHeader: FC<ResearchFieldHeaderProps> = ({ id }) => {
    const [editMode, setEditMode] = useState(false);
    const { isCurationAllowed } = useAuthentication();
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField() as [
        ResearchFieldData,
        SubResearchField[],
        boolean,
        boolean,
        (rfId: string) => void,
    ];

    const visibleSubResearchFields = !showMoreFields && subResearchFields?.length > 0 ? subResearchFields.slice(0, 9) : subResearchFields;

    return (
        <>
            {!isLoading && !isFailedLoading && <CheckSlug label={researchFieldData.label} route={ROUTES.RESEARCH_FIELD} />}
            {!isLoading && !isFailedLoading && (
                <CheckClasses classes={researchFieldData.classes} targetClass={CLASSES.RESEARCH_FIELD} resourceId={researchFieldData.id} />
            )}
            {isLoading && (
                <>
                    <Container className="mt-6 mb-6">
                        <Skeleton className="w-full h-5 rounded" />
                    </Container>
                    <Container className="mb-6">
                        <div className="p-4 box rounded flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </Container>
                </>
            )}
            {!isLoading && !isFailedLoading && (
                <>
                    {editMode && (
                        <DataBrowserDialog
                            isEditMode
                            show={editMode}
                            toggleModal={() => setEditMode((v) => !v)}
                            id={id}
                            label={researchFieldData.label}
                            onCloseModal={() => loadResearchFieldData(id)}
                        />
                    )}
                    <TitleBar
                        titleAddition={<SubTitle>Research field</SubTitle>}
                        buttonGroup={
                            <>
                                {isCurationAllowed && (
                                    <RequireAuthentication
                                        component={Button}
                                        size="sm"
                                        className="button--orkg-secondary"
                                        onPress={() => setEditMode((v) => !v)}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu aria-label="Options">
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
                        {researchFieldData.label}
                    </TitleBar>

                    <Container>
                        <div className="p-4 box rounded">
                            {(researchFieldData.description || researchFieldData.sameAs) && (
                                <>
                                    {researchFieldData.description && (
                                        <>
                                            <h2 className="text-xl">Description</h2>
                                            <p className="m-0">{researchFieldData.description}</p>
                                        </>
                                    )}
                                    {researchFieldData.sameAs && (
                                        <ExternalDescription
                                            query={researchFieldData.sameAs ? researchFieldData.sameAs.label : researchFieldData.label}
                                        />
                                    )}
                                    {researchFieldData.description && <hr className="my-4" />}
                                </>
                            )}
                            {subResearchFields && subResearchFields.length > 0 && (
                                <>
                                    <h2 className="text-xl">Subfields</h2>
                                    <div>
                                        {visibleSubResearchFields.map((subfield) => (
                                            <Link
                                                key={`index${subfield.id}`}
                                                href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                    researchFieldId: subfield.id,
                                                    slug: subfield.label,
                                                })}
                                            >
                                                <Chip className="mr-2 mb-2">{subfield.label}</Chip>
                                            </Link>
                                        ))}
                                        {subResearchFields.length > 9 && (
                                            <Button onPress={() => setShowMoreFields((v) => !v)} variant="ghost" size="sm" className="p-0 ml-2">
                                                {showMoreFields ? 'Show less subfields' : 'Show more subfields'}
                                            </Button>
                                        )}
                                    </div>

                                    <hr className="my-4" />
                                </>
                            )}

                            <Contributors researchFieldId={id} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
};

export default ResearchFieldHeader;
