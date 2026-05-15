'use client';

import { faClose, faDiagramProject, faEllipsisV, faPen, faQuestionCircle, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Modal, Tooltip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import EditableHeader from '@/components/EditableHeader';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import ExportCitation from '@/components/ExportCitation/ExportCitation';
import useContributor from '@/components/hooks/useContributor';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useExportSHACL from '@/components/Templates/ShaclFlow/hooks/useExportSHACL';
import ShaclFlowModal from '@/components/Templates/ShaclFlow/ShaclFlowModal';
import TabsContainer from '@/components/Templates/TabsContainer';
import TemplateEditorHeaderBar from '@/components/Templates/TemplateEditorHeaderBar';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Thing } from '@/services/backend/things';
import { loadTemplate, saveTemplate, setDiagramMode, updateLabel } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

const Template = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { isEditMode: editMode, toggleIsEditMode } = useIsEditMode();

    const {
        diagramMode,
        isSaving,
        isLoading,
        failureStatus,
        hasFailed,
        label,
        id: loadedId,
        created_by: createdBy,
        created_at: createdAt,
        observatory_id: observatoryId,
        organization_id: organizationId,
        extraction_method: extractionMethod,
    } = useSelector((state: RootStore) => state.templateEditor);
    const router = useRouter();
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const [showExportCitation, setShowExportCitation] = useState(false);

    const handleShowHeaderBar = (isVisible: boolean) => {
        setShowHeaderBar(!isVisible);
    };

    const { exportSHACL, isConvertingToSHACL } = useExportSHACL();

    const { contributor } = useContributor({ userId: createdBy ?? undefined });

    useEffect(() => {
        if (id && loadedId !== id) {
            // @ts-expect-error - TODO: not typed yet!
            dispatch(loadTemplate(id));
        }
    }, [loadedId, dispatch, id]);

    useEffect(() => {
        document.title = `${label ? `${label} - ` : ''}Template - ORKG`;
    }, [label]);

    if (!isLoading && hasFailed && failureStatus === 500) {
        return <InternalServerError error={new Error('Loading template failed')} />;
    }

    if (!isLoading && hasFailed) {
        return <NotFound />;
    }

    const handleChangeLabel = (value: string) => {
        dispatch(updateLabel(value));
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <Tooltip>
                        <Tooltip.Trigger>
                            <a href="https://orkg.org/about/19/Templates" target="_blank" rel="noopener noreferrer" className="inline-flex">
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary text-[22px] leading-none" />
                            </a>
                        </Tooltip.Trigger>
                        <Tooltip.Content showArrow>
                            <Tooltip.Arrow />
                            Open help center
                        </Tooltip.Content>
                    </Tooltip>
                }
                buttonGroup={
                    <>
                        {!editMode && !isSaving ? (
                            <>
                                <RequireAuthentication
                                    isDisabled={isLoading}
                                    component={Button}
                                    className="button--orkg-secondary !h-8"
                                    size="sm"
                                    onPress={() => toggleIsEditMode(true)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Button className="button--orkg-secondary !h-8" size="sm" onPress={() => dispatch(setDiagramMode(true))}>
                                    <FontAwesomeIcon icon={faDiagramProject} /> View diagram
                                </Button>
                            </>
                        ) : (
                            <>
                                <ButtonWithLoading
                                    isDisabled={isSaving}
                                    className="button--orkg-secondary-darker !h-8"
                                    size="sm"
                                    onPress={async () => {
                                        window.scrollTo({
                                            behavior: 'smooth',
                                            top: 0,
                                        });
                                        // @ts-expect-error - TODO: not typed yet!
                                        const tID = await dispatch(saveTemplate(toggleIsEditMode));
                                        if (tID) {
                                            router.push(reverse(ROUTES.TEMPLATE, { id: tID }));
                                        }
                                    }}
                                    isLoading={isSaving}
                                    loadingMessage="Saving"
                                >
                                    <FontAwesomeIcon icon={faSave} /> Save
                                </ButtonWithLoading>
                                <Button
                                    className="button--orkg-secondary !h-8"
                                    size="sm"
                                    onPress={() => {
                                        // @ts-expect-error - TODO: not typed yet!
                                        dispatch(loadTemplate(id));
                                        toggleIsEditMode(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faClose} /> Cancel
                                </Button>
                            </>
                        )}
                        <Dropdown>
                            <Button size="sm" className="button--orkg-secondary !h-8" isIconOnly aria-label="More options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu>
                                    <Dropdown.Item onAction={() => setShowExportCitation((v) => !v)} textValue="Export citation">
                                        Export citation
                                    </Dropdown.Item>
                                    <Dropdown.Item onAction={exportSHACL} textValue="Export as SHACL">
                                        {!isConvertingToSHACL ? 'Export as SHACL' : 'Exporting...'}
                                    </Dropdown.Item>
                                    <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`} textValue="View resource">
                                        View resource
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                        <Modal.Backdrop isOpen={isConvertingToSHACL}>
                            <Modal.Container>
                                <Modal.Dialog>
                                    <Modal.Header>
                                        <Modal.Heading>Export as SHACL</Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body className="p-6">
                                        <div className="text-center">
                                            <FontAwesomeIcon icon={faSpinner} spin className="text-muted" /> Loading
                                        </div>
                                    </Modal.Body>
                                </Modal.Dialog>
                            </Modal.Container>
                        </Modal.Backdrop>
                    </>
                }
            >
                Template
            </TitleBar>
            <InView as="div" initialInView={false} onChange={(inView) => handleShowHeaderBar(inView)}>
                <EditModeHeader isVisible={editMode || isSaving} />
                <Container>
                    <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${editMode || isSaving ? 'rounded-b' : 'rounded'}`}>
                        <div className="mb-6">
                            {!editMode ? (
                                <h3 className="text-[1.3rem] font-bold leading-tight m-0 flex flex-wrap items-center gap-2 break-words">
                                    <span className="break-words">{label}</span>
                                </h3>
                            ) : (
                                <EditableHeader id={id} value={label} onChange={handleChangeLabel} entityType={ENTITIES.RESOURCE} />
                            )}
                        </div>
                        <ItemMetadata
                            item={
                                {
                                    id,
                                    label,
                                    created_by: createdBy,
                                    created_at: createdAt,
                                    organization_id: organizationId,
                                    observatory_id: observatoryId,
                                    extraction_method: extractionMethod,
                                } as unknown as Thing
                            }
                            showCreatedAt
                            showCreatedBy
                            showProvenance
                            showExtractionMethod
                            editMode={editMode}
                        />
                    </div>
                </Container>
            </InView>
            {showHeaderBar && <TemplateEditorHeaderBar />}
            <TabsContainer id={id} />
            {diagramMode && <ShaclFlowModal />}
            {showExportCitation && (
                <ExportCitation
                    id={id}
                    title={label}
                    authors={[{ literal: contributor?.displayName ?? '' }]}
                    classId={CLASSES.NODE_SHAPE}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation((v) => !v)}
                />
            )}
        </>
    );
};

export default Template;
