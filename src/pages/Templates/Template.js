import { useEffect, useState } from 'react';
import { Button, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import GeneralSettings from 'components/Templates/Tabs/GeneralSettings/GeneralSettings';
import TemplateEditorHeaderBar from 'components/Templates/TemplateEditorHeaderBar';
import ComponentsTab from 'components/Templates/Tabs/ComponentsTab/ComponentsTab';
import Unauthorized from 'pages/Unauthorized';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import Format from 'components/Templates/Tabs/Format/Format';
import { StyledContainer } from 'components/Templates/styled';
import { setEditMode, loadTemplate, saveTemplate, updateClass } from 'slices/templateEditorSlice';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faSpinner, faQuestionCircle, faEllipsisV, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import { getParamFromQueryString } from 'utils';
import styled from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';
import Tippy from '@tippyjs/react';
import { getClassById } from 'services/backend/classes';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { NavLink as RouterNavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import TitleBar from 'components/TitleBar/TitleBar';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import LoadingOverlay from 'react-loading-overlay';
import { MISC } from 'constants/graphSettings';
import { EditModeContainer, Title } from 'components/EditModeHeader/EditModeHeader';

const TabPaneStyled = styled(TabPane)`
    border: 1px solid #ced4da;
    border-top: 0;
`;

const NavItemStyled = styled(NavItem)`
    cursor: pointer;
`;

const Template = () => {
    const location = useLocation();
    const { id } = useParams();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const editMode = useSelector(state => state.templateEditor.editMode);
    const isSaving = useSelector(state => state.templateEditor.isSaving);
    const isLoading = useSelector(state => state.templateEditor.isLoading);
    const templateID = useSelector(state => state.templateEditor.templateID);
    const label = useSelector(state => state.templateEditor.label);
    const createdBy = useSelector(state => state.templateEditor.created_by);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('1');
    const [showHeaderBar, setShowHeaderBar] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const getDefaultClass = () => {
            const targetClass = getParamFromQueryString(location.search, 'classID');
            if (targetClass) {
                getClassById(targetClass).then(classesData => {
                    dispatch(updateClass(classesData));
                });
            }
        };
        if (id) {
            dispatch(loadTemplate(id));
        } else {
            if (templateID) {
                navigate(reverse(ROUTES.TEMPLATE, { id: templateID }));
            }
            getDefaultClass();
            dispatch(setEditMode(true));
            document.title = 'Create Contribution Template - ORKG';
        }
    }, [dispatch, location.search, navigate, id, templateID]);

    useEffect(() => {
        document.title = `${label ? `${label} - ` : ''}Contribution Template - ORKG`;
    }, [label]);

    const toggleTab = tab => {
        setActiveTab(tab);
    };

    const handleShowHeaderBar = isVisible => {
        setShowHeaderBar(!isVisible);
    };

    if (!user && !id) {
        return <Unauthorized />;
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
                            <RequireAuthentication
                                disabled={isLoading}
                                component={Button}
                                color="secondary"
                                size="sm"
                                onClick={() => dispatch(setEditMode(true))}
                            >
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                        ) : (
                            <Button
                                disabled={isSaving}
                                style={{ marginLeft: 1 }}
                                color="secondary-darker"
                                size="sm"
                                onClick={() => {
                                    window.scrollTo({
                                        behavior: 'smooth',
                                        top: 0,
                                    });
                                    dispatch(saveTemplate());
                                }}
                            >
                                {isSaving && <Icon icon={faSpinner} spin />}
                                {editMode && <Icon icon={faSave} />}
                                {!isSaving ? ' Save' : ' Saving'}
                            </Button>
                        )}
                        {id && (
                            <ButtonDropdown className="flex-shrink-0" isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem tag={RouterNavLink} end to={reverse(ROUTES.RESOURCE, { id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        )}
                    </>
                }
            >
                {!id ? 'Create new template' : 'Template'}
            </TitleBar>

            <StyledContainer className="p-0">
                <LoadingOverlay
                    active={isLoading || isSaving}
                    spinner
                    text={
                        <>
                            {!isSaving && isLoading && 'Loading...'}
                            {isSaving && (
                                <>
                                    <h4>Saving...</h4>
                                    <br />
                                    Please <b>do not </b>leave this page until the save process is finished.
                                </>
                            )}
                        </>
                    }
                    styles={{
                        content: base => ({
                            ...base,
                            marginTop: '30%',
                        }),
                        overlay: base => ({
                            ...base,
                            borderRadius: 7,
                            overflow: 'hidden',
                            background: 'rgba(215, 215, 215, 0.7)',
                            color: '#282828',
                            '& svg circle': {
                                stroke: '#282828',
                            },
                        }),
                    }}
                >
                    <>
                        {showHeaderBar && <TemplateEditorHeaderBar />}
                        {(editMode || isSaving) && (
                            <EditModeContainer className="box rounded-top">
                                <Title>{id ? 'Edit mode' : 'Create template'}</Title>
                            </EditModeContainer>
                        )}
                        <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                            <div className="mb-2">
                                {!editMode && (
                                    <>
                                        <h3 className="pb-2 mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {label}
                                        </h3>
                                        {createdBy !== MISC.UNKNOWN_ID && (
                                            <small className="d-inline-block me-2">
                                                <Icon icon={faUser} /> Created by{' '}
                                                <span className="ms-1">
                                                    <UserAvatar size={24} userId={createdBy} showDisplayName={true} />
                                                </span>
                                            </small>
                                        )}
                                        <hr />
                                    </>
                                )}
                            </div>

                            <div className="mb-3">
                                <VisibilitySensor onChange={handleShowHeaderBar}>
                                    <Nav tabs>
                                        <NavItemStyled>
                                            <NavLink
                                                className={classnames({ active: activeTab === '1' })}
                                                onClick={() => {
                                                    toggleTab('1');
                                                }}
                                            >
                                                Description
                                            </NavLink>
                                        </NavItemStyled>
                                        <NavItemStyled>
                                            <NavLink
                                                className={classnames({ active: activeTab === '2' })}
                                                onClick={() => {
                                                    toggleTab('2');
                                                }}
                                            >
                                                Properties
                                            </NavLink>
                                        </NavItemStyled>
                                        <NavItemStyled>
                                            <NavLink
                                                className={classnames({ active: activeTab === '3' })}
                                                onClick={() => {
                                                    toggleTab('3');
                                                }}
                                            >
                                                Format
                                            </NavLink>
                                        </NavItemStyled>
                                    </Nav>
                                </VisibilitySensor>
                                <TabContent activeTab={activeTab}>
                                    <TabPaneStyled tabId="1">
                                        <Row>
                                            <Col sm="12">
                                                <GeneralSettings />
                                            </Col>
                                        </Row>
                                    </TabPaneStyled>
                                    <TabPaneStyled tabId="2">
                                        <Row>
                                            <Col sm="12">
                                                <ComponentsTab />
                                            </Col>
                                        </Row>
                                    </TabPaneStyled>
                                    <TabPaneStyled tabId="3">
                                        <Row>
                                            <Col sm="12">
                                                <Format />
                                            </Col>
                                        </Row>
                                    </TabPaneStyled>
                                </TabContent>
                            </div>
                        </div>
                    </>
                </LoadingOverlay>
            </StyledContainer>
        </>
    );
};

export default Template;
