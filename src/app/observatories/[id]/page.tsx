'use client';

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import useAuthentication from '@/components/hooks/useAuthentication';
import EditObservatory from '@/components/Observatory/EditObservatory';
import MembersBox from '@/components/Observatory/MembersBox';
import ObservatoryModal from '@/components/Observatory/ObservatoryModal/ObservatoryModal';
import ObservatoryTabsContainer from '@/components/Observatory/ObservatoryTabsContainer';
import OrganizationsBox from '@/components/Observatory/OrganizationsBox';
import ReadMore from '@/components/ReadMore/ReadMore';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ResearchProblemsBox from '@/components/ResearchProblemsBox/ResearchProblemsBox';
import { SubTitle } from '@/components/styled';
import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';

const Observatory = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthentication();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDialogInfo, setShowDialogInfo] = useState(false);

    const {
        data: observatory,
        isLoading,
        error,
        mutate: mutateObservatory,
    } = useSWR(id ? [id, observatoriesUrl, 'getObservatoryById'] : null, ([params]) => getObservatoryById(params));

    const orgIds = observatory?.organization_ids ?? [];
    const { data: organizationsList, isLoading: isLoadingOrganizations } = useSWR(
        orgIds.length > 0 ? [orgIds, organizationsUrl, 'getOrganization'] : null,
        ([ids]) => Promise.all(ids.map((oid) => getOrganization(oid))),
    );

    useEffect(() => {
        if (observatory?.name) {
            document.title = `${observatory.name} - Details`;
        }
    }, [observatory?.name]);

    if (!isLoading && error) {
        return error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />;
    }

    if (isLoading || !observatory) {
        return <div className="max-w-container mx-auto px-3 mt-12 box rounded-lg p-6">Loading ...</div>;
    }

    return (
        <>
            <Breadcrumbs researchFieldId={observatory.research_field?.id ?? null} />
            <TitleBar
                titleAddition={<SubTitle>Observatory</SubTitle>}
                buttonGroup={
                    <RequireAuthentication
                        component={Button}
                        className="button--orkg-secondary shrink-0"
                        size="sm"
                        onPress={() => (!!user && user.isCurationAllowed ? toggleIsEditMode() : setShowDialogInfo((v) => !v))}
                    >
                        {isEditMode ? (
                            <>
                                <FontAwesomeIcon icon={faTimes} /> Stop Editing
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPen} /> Edit
                            </>
                        )}
                    </RequireAuthentication>
                }
                wrap={false}
            >
                {observatory.name}
            </TitleBar>
            <EditModeHeader isVisible={isEditMode} />
            <div className="max-w-container mx-auto px-3">
                <div className={`box p-6 mb-4 relative ${isEditMode ? 'rounded-t-none' : ''}`}>
                    <div className="flex justify-between gap-4">
                        {observatory.description && (
                            <div className="grow whitespace-pre-wrap break-words">
                                <ReadMore text={observatory.description} />
                            </div>
                        )}
                        {observatory.sdgs?.length > 0 && (
                            <div className="shrink-0">
                                <SdgBox sdgs={observatory.sdgs} maxWidth="100%" handleSave={() => {}} />
                            </div>
                        )}
                    </div>
                    {isEditMode && (
                        <div className="flex">
                            <Button className="button--orkg-secondary mt-2 ml-auto" size="sm" onPress={() => setShowEditDialog((v) => !v)}>
                                <FontAwesomeIcon icon={faPen} /> Edit data
                            </Button>
                        </div>
                    )}
                </div>

                <OrganizationsBox
                    isEditMode={isEditMode}
                    observatoryId={observatory.id}
                    organizations={organizationsList ?? []}
                    isLoadingOrganizations={orgIds.length > 0 && isLoadingOrganizations}
                    mutateObservatory={mutateObservatory}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
                    <ResearchProblemsBox isEditMode={isEditMode} id={observatory.id} by="Observatory" />
                    <MembersBox isEditMode={isEditMode} observatoryId={observatory.id} organizationsList={organizationsList ?? []} />
                </div>

                <div className="mt-4">
                    <ObservatoryTabsContainer id={observatory.id} />
                </div>
            </div>

            <EditObservatory
                showDialog={showEditDialog}
                toggle={() => setShowEditDialog((v) => !v)}
                label={observatory.name}
                id={observatory.id}
                description={observatory.description}
                researchField={observatory.research_field}
                updateObservatoryMetadata={() => mutateObservatory()}
                sdgs={observatory.sdgs}
            />
            <ObservatoryModal isOpen={showDialogInfo} toggle={() => setShowDialogInfo((v) => !v)} />
        </>
    );
};

export default Observatory;
