import { Component } from 'react';
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
import styled, { withTheme } from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';
import Tippy from '@tippyjs/react';
import { getClassById } from 'services/backend/classes';
import classnames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { NavLink as RouterNavLink } from 'react-router-dom';
import TitleBar from 'components/TitleBar/TitleBar';
import { EditModeContainer, Title } from 'components/EditModeHeader/EditModeHeader';

const TabPaneStyled = styled(TabPane)`
    border: 1px solid #ced4da;
    border-top: 0;
`;

const NavItemStyled = styled(NavItem)`
    cursor: pointer;
`;

class Template extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '1',
            error: null,
            showHeaderBar: false,
            menuOpen: false
        };
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            this.props.loadTemplate(this.props.match.params.id);
        } else {
            this.getDefaultClass();
            this.props.setEditMode(true);
            document.title = `Create Contribution Template - ORKG`;
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.props.match.params.id && this.props.templateID) {
            this.props.history.push(reverse(ROUTES.TEMPLATE, { id: this.props.templateID }));
        }
        if (this.props.match.params.id && this.props.match.params.id !== prevProps.match.params.id) {
            this.props.loadTemplate(this.props.match.params.id);
        }
        if (this.props.label !== prevProps.label) {
            document.title = `${this.props.label ? this.props.label + ' - ' : ''}Contribution Template - ORKG`;
        }
    }

    getDefaultClass = () => {
        const targetClass = getParamFromQueryString(this.props.location.search, 'classID');
        if (targetClass) {
            getClassById(targetClass).then(classesData => {
                this.props.updateClass(classesData);
            });
        }
    };

    toggleTab = tab => {
        this.setState({
            activeTab: tab
        });
    };

    handleShowHeaderBar = isVisible => {
        this.setState({
            showHeaderBar: !isVisible
        });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    render() {
        if (!this.props.user && !this.props.match.params.id) {
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
                            {!this.props.editMode && !this.props.isSaving ? (
                                <RequireAuthentication component={Button} color="secondary" size="sm" onClick={() => this.props.setEditMode(true)}>
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button
                                    disabled={this.props.isSaving}
                                    style={{ marginLeft: 1 }}
                                    color="secondary-darker"
                                    size="sm"
                                    onClick={() => this.props.saveTemplate(this.props.template)}
                                >
                                    {this.props.isSaving && <Icon icon={faSpinner} spin />}
                                    {this.props.editMode && <Icon icon={faSave} />}
                                    {!this.props.isSaving ? ' Save' : ' Saving'}
                                </Button>
                            )}
                            {this.props.match.params.id && (
                                <ButtonDropdown
                                    className="flex-shrink-0"
                                    isOpen={this.state.menuOpen}
                                    toggle={() =>
                                        this.setState(prevState => ({
                                            menuOpen: !prevState.menuOpen
                                        }))
                                    }
                                >
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={RouterNavLink} exact to={reverse(ROUTES.RESOURCE, { id: this.props.match.params.id })}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            )}
                        </>
                    }
                >
                    {!this.props.match.params.id ? 'Create new template' : 'Template'}
                </TitleBar>
                <StyledContainer className="p-0">
                    {this.state.showHeaderBar && <TemplateEditorHeaderBar id={this.props.match.params.id} />}
                    {(this.props.editMode || this.props.isSaving) && (
                        <EditModeContainer className="box rounded-top">
                            <Title>{this.props.match.params.id ? 'Edit mode' : 'Create template'}</Title>
                        </EditModeContainer>
                    )}
                    <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${this.props.editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="mb-2">
                            {!this.props.editMode ? (
                                <h3 className="pb-2 mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {this.props.label}
                                </h3>
                            ) : (
                                ''
                            )}
                        </div>

                        <div className="mb-3">
                            <VisibilitySensor onChange={this.handleShowHeaderBar}>
                                <Nav tabs>
                                    <NavItemStyled>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '1' })}
                                            onClick={() => {
                                                this.toggleTab('1');
                                            }}
                                        >
                                            Description
                                        </NavLink>
                                    </NavItemStyled>
                                    <NavItemStyled>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '2' })}
                                            onClick={() => {
                                                this.toggleTab('2');
                                            }}
                                        >
                                            Properties
                                        </NavLink>
                                    </NavItemStyled>
                                    <NavItemStyled>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '3' })}
                                            onClick={() => {
                                                this.toggleTab('3');
                                            }}
                                        >
                                            Format
                                        </NavLink>
                                    </NavItemStyled>
                                </Nav>
                            </VisibilitySensor>
                            <TabContent activeTab={this.state.activeTab}>
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
    }
}

Template.propTypes = {
    location: PropTypes.object.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string
        })
    }),
    theme: PropTypes.object.isRequired,
    setEditMode: PropTypes.func.isRequired,
    loadTemplate: PropTypes.func.isRequired,
    saveTemplate: PropTypes.func.isRequired,
    editMode: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    templateID: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    updateClass: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        editMode: state.templateEditor.editMode,
        isLoading: state.templateEditor.isLoading,
        isSaving: state.templateEditor.isSaving,
        templateID: state.templateEditor.templateID,
        label: state.templateEditor.label,
        template: state.templateEditor
    };
};

const mapDispatchToProps = dispatch => ({
    setEditMode: data => dispatch(setEditMode(data)),
    loadTemplate: data => dispatch(loadTemplate(data)),
    saveTemplate: data => dispatch(saveTemplate(data)),
    updateClass: data => dispatch(updateClass(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(Template);
