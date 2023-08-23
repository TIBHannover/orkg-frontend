import { faDiagramProject, faEllipsisV, faPen, faQuestionCircle, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { EditModeContainer, Title } from 'components/EditModeHeader/EditModeHeader';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ItemMetadata from 'components/Search/ItemMetadata';
import ExportCitation from 'components/ExportCitation/ExportCitation';
import ShaclFlowModal from 'components/Templates/ShaclFlow/ShaclFlowModal';
import TabsContainer from 'components/Templates/TabsContainer';
import TemplateEditorHeaderBar from 'components/Templates/TemplateEditorHeaderBar';
import useContributor from 'components/hooks/useContributor';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink as RouterNavLink, useNavigate, useParams } from 'react-router-dom';
import VisibilitySensor from 'react-visibility-sensor';
import { Button, ButtonDropdown, ButtonGroup, Container, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { loadTemplate, saveTemplate, setDiagramMode, setEditMode } from 'slices/templateEditorSlice';
import { CLASSES } from 'constants/graphSettings';

const Template = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const {
        editMode,
        diagramMode,
        isSaving,
        isLoading,
        hasFailed,
        label,
        created_by: createdBy,
        created_at: createdAt,
        observatory_id: observatoryId,
        organization_id: organizationId,
    } = useSelector(state => state.templateEditor);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const [showExportCitation, setShowExportCitation] = useState(false);

    const handleShowHeaderBar = isVisible => {
        setShowHeaderBar(!isVisible);
    };

    const { contributor } = useContributor({ userId: createdBy });

    useEffect(() => {
        if (id) {
            dispatch(loadTemplate(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        document.title = `${label ? `${label} - ` : ''}Contribution Template - ORKG`;
    }, [label]);

    if (!isLoading && hasFailed) {
        return <NotFound />;
    }

    return (
        <>
            <TitleBar
                titleAddition={
                    <Tippy content="Open help center">
                        <span>
                            <a href="https://orkg.org/about/19/Templates" target="_blank" rel="noopener noreferrer">
                                <Icon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1 }} className="text-secondary p-0" />
                            </a>
                        </span>
                    </Tippy>
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
                                    onClick={() => dispatch(setEditMode(true))}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Button
                                    style={{ marginLeft: 1 }}
                                    className="float-end"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => dispatch(setDiagramMode(true))}
                                >
                                    <Icon icon={faDiagramProject} /> View diagram
                                </Button>
                            </ButtonGroup>
                        ) : (
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
                                    const tID = await dispatch(saveTemplate());
                                    if (tID) {
                                        navigate(reverse(ROUTES.TEMPLATE, { id: tID }));
                                    }
                                }}
                                isLoading={isSaving}
                                loadingMessage="Saving"
                            >
                                <Icon icon={faSave} className="ms-1" /> Save
                            </ButtonWithLoading>
                        )}
                        <ButtonDropdown className="flex-shrink-0" isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end>
                                <DropdownItem onClick={() => setShowExportCitation(v => !v)}>Export citation</DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </>
                }
            >
                Template
            </TitleBar>
            <VisibilitySensor onChange={handleShowHeaderBar}>
                <Container className="p-0">
                    {(editMode || isSaving) && (
                        <EditModeContainer className="box rounded-top">
                            <Title>Edit mode</Title>
                        </EditModeContainer>
                    )}

                    <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="mb-2">
                            <>
                                <h3 className="pb-2 mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {label}
                                </h3>
                                <ItemMetadata
                                    item={{
                                        id,
                                        created_by: createdBy,
                                        created_at: createdAt,
                                        organization_id: organizationId,
                                        observatory_id: observatoryId,
                                    }}
                                    showCreatedAt={true}
                                    showCreatedBy={true}
                                    showProvenance={true}
                                    editMode={editMode}
                                />
                            </>
                        </div>
                    </div>
                </Container>
            </VisibilitySensor>
            {showHeaderBar && <TemplateEditorHeaderBar />}
            <TabsContainer id={id} />
            {diagramMode && <ShaclFlowModal />}
            {showExportCitation && (
                <ExportCitation
                    id={id}
                    title={label}
                    authors={[contributor?.display_name]}
                    classId={CLASSES.TEMPLATE}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation(v => !v)}
                />
            )}
        </>
    );
};

export default Template;
