'use client';

import { faClose, faDiagramProject, faEllipsisV, faPen, faQuestionCircle, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    ButtonDropdown,
    ButtonGroup,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalHeader,
} from 'reactstrap';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import EditableHeader from '@/components/EditableHeader';
import { EditModeContainer, Title } from '@/components/EditModeHeader/EditModeHeader';
import ExportCitation from '@/components/ExportCitation/ExportCitation';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useContributor from '@/components/hooks/useContributor';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useExportSHACL from '@/components/Templates/ShaclFlow/hooks/useExportSHACL';
import ShaclFlowModal from '@/components/Templates/ShaclFlow/ShaclFlowModal';
import TabsContainer from '@/components/Templates/TabsContainer';
import TemplateEditorHeaderBar from '@/components/Templates/TemplateEditorHeaderBar';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { loadTemplate, saveTemplate, setDiagramMode, updateLabel } from '@/slices/templateEditorSlice';

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
    } = useSelector((state) => state.templateEditor);
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const [showExportCitation, setShowExportCitation] = useState(false);

    const handleShowHeaderBar = (isVisible) => {
        setShowHeaderBar(!isVisible);
    };

    const { exportSHACL, isConvertingToSHACL } = useExportSHACL();

    const { contributor } = useContributor({ userId: createdBy });

    useEffect(() => {
        if (id && loadedId !== id) {
            dispatch(loadTemplate(id));
        }
    }, [loadedId, dispatch, id]);

    useEffect(() => {
        document.title = `${label ? `${label} - ` : ''}Template - ORKG`;
    }, [label]);

    if (!isLoading && hasFailed && failureStatus === 500) {
        return <InternalServerError error="Loading template failed" />;
    }

    if (!isLoading && hasFailed) {
        return <NotFound />;
    }

    const handleChangeLabel = (value) => {
        dispatch(updateLabel(value));
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <Tooltip content="Open help center">
                        <span>
                            <a href="https://orkg.org/about/19/Templates" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1 }} className="text-secondary p-0" />
                            </a>
                        </span>
                    </Tooltip>
                }
                buttonGroup={
                    <>
                        {!editMode && !isSaving ? (
                            <ButtonGroup size="sm">
                                <RequireAuthentication
                                    disabled={isLoading}
                                    component={Button}
                                    color="secondary"
                                    size="sm"
                                    onClick={() => toggleIsEditMode(true)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Button
                                    style={{ marginLeft: 1 }}
                                    className="float-end"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => dispatch(setDiagramMode(true))}
                                >
                                    <FontAwesomeIcon icon={faDiagramProject} /> View diagram
                                </Button>
                            </ButtonGroup>
                        ) : (
                            <ButtonGroup size="sm">
                                <ButtonWithLoading
                                    disabled={isSaving}
                                    style={{ marginLeft: 1 }}
                                    color="secondary-darker"
                                    size="sm"
                                    onClick={async () => {
                                        window.scrollTo({
                                            behavior: 'smooth',
                                            top: 0,
                                        });
                                        const tID = await dispatch(saveTemplate(toggleIsEditMode));
                                        if (tID) {
                                            router.push(reverse(ROUTES.TEMPLATE, { id: tID }));
                                        }
                                    }}
                                    isLoading={isSaving}
                                    loadingMessage="Saving"
                                >
                                    <FontAwesomeIcon icon={faSave} className="ms-1" /> Save
                                </ButtonWithLoading>
                                <Button
                                    style={{ marginLeft: 1 }}
                                    color="secondary"
                                    size="sm"
                                    onClick={() => {
                                        dispatch(loadTemplate(id));
                                        toggleIsEditMode(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faClose} className="ms-1" /> Cancel
                                </Button>
                            </ButtonGroup>
                        )}
                        <ButtonDropdown className="flex-shrink-0" isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end="true">
                                <DropdownItem onClick={() => setShowExportCitation((v) => !v)}>Export citation</DropdownItem>
                                <DropdownItem onClick={exportSHACL}>{!isConvertingToSHACL ? 'Export as SHACL' : 'Exporting...'}</DropdownItem>
                                <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                        <Modal isOpen={isConvertingToSHACL} backdrop="static">
                            <ModalHeader>Export as SHACL</ModalHeader>
                            <ModalBody>
                                <div className="text-center mt-4 mb-4">
                                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                                </div>
                            </ModalBody>
                        </Modal>
                    </>
                }
            >
                Template
            </TitleBar>
            <InView as="div" onChange={(inView) => handleShowHeaderBar(inView)}>
                <Container className="p-0">
                    {(editMode || isSaving) && (
                        <EditModeContainer className="box rounded-top">
                            <Title>Edit mode</Title>
                        </EditModeContainer>
                    )}

                    <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="mb-2">
                            {!editMode ? (
                                <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {label}
                                </h3>
                            ) : (
                                <EditableHeader id={id} value={label} onChange={handleChangeLabel} entityType={ENTITIES.RESOURCE} />
                            )}
                            <ItemMetadata
                                item={{
                                    id,
                                    created_by: createdBy,
                                    created_at: createdAt,
                                    organization_id: organizationId,
                                    observatory_id: observatoryId,
                                    extraction_method: extractionMethod,
                                }}
                                showCreatedAt
                                showCreatedBy
                                showProvenance
                                showExtractionMethod
                                editMode={editMode}
                            />
                        </div>
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
                    authors={[contributor?.display_name]}
                    classId={CLASSES.NODE_SHAPE}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation((v) => !v)}
                />
            )}
        </>
    );
};

export default Template;
