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
import { faPen, faSpinner, faQuestionCircle, faEllipsisV, faSave } from '@fortawesome/free-solid-svg-icons';
import { getParamFromQueryString } from 'utils';
import styled from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';
import Tippy from '@tippyjs/react';
import { getClassById } from 'services/backend/classes';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { NavLink as RouterNavLink } from 'react-router-dom';
import TitleBar from 'components/TitleBar/TitleBar';
import { EditModeContainer, Title } from 'components/EditModeHeader/EditModeHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const TabPaneStyled = styled(TabPane)`
    border: 1px solid #ced4da;
    border-top: 0;
`;

const NavItemStyled = styled(NavItem)`
    cursor: pointer;
`;

const Template = () => {
    const location = useLocation();
    const params = useParams();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const editMode = useSelector(state => state.templateEditor.editMode);
    const isSaving = useSelector(state => state.templateEditor.isSaving);
    const templateID = useSelector(state => state.templateEditor.templateID);
    const label = useSelector(state => state.templateEditor.label);
    const template = useSelector(state => state.templateEditor);
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
        if (params.id) {
            dispatch(loadTemplate(params.id));
        } else {
            if (templateID) {
                navigate(reverse(ROUTES.TEMPLATE, { id: templateID }));
            }
            getDefaultClass();
            dispatch(setEditMode(true));
            document.title = `Create Contribution Template - ORKG`;
        }
    }, [dispatch, location.search, navigate, params.id, templateID]);

    useEffect(() => {
        document.title = `${label ? label + ' - ' : ''}Contribution Template - ORKG`;
    }, [label]);

    const toggleTab = tab => {
        setActiveTab(tab);
    };

    const handleShowHeaderBar = isVisible => {
        setShowHeaderBar(!isVisible);
    };

    if (!user && !params.id) {
        return <Unauthorized />;
    }

    return (
        <>
            <TitleBar
                titleAddition={
                    <Tippy content="Open help center">
                        <span>
                            <a
                                href="https://www.orkg.org/orkg/help-center/article/9/Templates_for_structuring_contribution_descriptions"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1 }} className="text-secondary p-0" />
                            </a>
                        </span>
                    </Tippy>
                }
                buttonGroup={
                    <>
                        {!editMode && !isSaving ? (
                            <RequireAuthentication component={Button} color="secondary" size="sm" onClick={() => dispatch(setEditMode(true))}>
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                        ) : (
                            <Button
                                disabled={isSaving}
                                style={{ marginLeft: 1 }}
                                color="secondary-darker"
                                size="sm"
                                onClick={() => dispatch(saveTemplate(template))}
                            >
                                {isSaving && <Icon icon={faSpinner} spin />}
                                {editMode && <Icon icon={faSave} />}
                                {!isSaving ? ' Save' : ' Saving'}
                            </Button>
                        )}
                        {params.id && (
                            <ButtonDropdown className="flex-shrink-0" isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem tag={RouterNavLink} exact to={reverse(ROUTES.RESOURCE, { id: params.id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        )}
                    </>
                }
            >
                {!params.id ? 'Create new template' : 'Template'}
            </TitleBar>
            <StyledContainer className="p-0">
                {showHeaderBar && <TemplateEditorHeaderBar id={params.id} />}
                {(editMode || isSaving) && (
                    <EditModeContainer className="box rounded-top">
                        <Title>{params.id ? 'Edit mode' : 'Create template'}</Title>
                    </EditModeContainer>
                )}
                <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                    <div className="mb-2">
                        {!editMode ? (
                            <h3 className="pb-2 mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {label}
                            </h3>
                        ) : (
                            ''
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
            </StyledContainer>
        </>
    );
};

export default Template;
