import React, { Component } from 'react';
import { Button, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, ButtonGroup } from 'reactstrap';
import GeneralSettings from 'components/ContributionTemplates/Tabs/GeneralSettings/GeneralSettings';
import TemplateEditorHeaderBar from 'components/ContributionTemplates/TemplateEditorHeaderBar';
import ComponentsTab from 'components/ContributionTemplates/Tabs/ComponentsTab/ComponentsTab';
import Unauthorized from 'pages/Unauthorized';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import Format from 'components/ContributionTemplates/Tabs/Format/Format';
import { StyledContainer } from 'components/ContributionTemplates/styled';
import { setEditMode, loadTemplate, saveTemplate, setIsLoading, doneLoading, setClass } from 'actions/addTemplate';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getParamFromQueryString } from 'utils';
import styled, { withTheme } from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';
import { EditModeHeader, Title } from 'pages/ViewPaper';
import { submitGetRequest, classesUrl } from 'network';
import classnames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';

const TabPaneStyled = styled(TabPane)`
    border: 1px solid #ced4da;
    border-top: 0;
`;

const NavItemStyled = styled(NavItem)`
    cursor: pointer;
`;

class ContributionTemplate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '1',
            error: null,
            showHeaderBar: false
        };
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            this.props.loadTemplate(this.props.match.params.id);
        } else {
            this.getDefaultClass();
            this.props.setEditMode(true);
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.props.match.params.id && this.props.templateID) {
            this.props.history.push(reverse(ROUTES.CONTRIBUTION_TEMPLATE, { id: this.props.templateID }));
        }
        if (this.props.match.params.id && this.props.match.params.id !== prevProps.match.params.id) {
            this.props.loadTemplate(this.props.match.params.id);
        }
    }

    getDefaultClass = () => {
        const targetClass = getParamFromQueryString(this.props.location.search, 'classID');
        if (targetClass) {
            submitGetRequest(classesUrl + encodeURIComponent(targetClass)).then(classesData => {
                this.props.setClass(classesData);
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

    render() {
        if (!this.props.user && !this.props.match.params.id) {
            return <Unauthorized />;
        }

        return (
            <StyledContainer className="clearfix">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">{!this.props.match.params.id ? 'Create new template' : 'Template'}</h1>
                {this.state.showHeaderBar && <TemplateEditorHeaderBar id={this.props.match.params.id} />}
                {(this.props.editMode || this.props.isSaving) && (
                    <EditModeHeader className="box rounded-top">
                        <Title>{this.props.match.params.id ? 'Edit mode' : 'Create template'}</Title>
                        <ButtonGroup size="sm">
                            <Button
                                className="float-left"
                                disabled={this.props.isSaving}
                                style={{ marginLeft: 1 }}
                                color="light"
                                onClick={() => this.props.saveTemplate(this.props.template)}
                            >
                                {this.props.isSaving && <Icon icon={faSpinner} spin />}
                                {!this.props.isSaving ? ' Save' : ' Saving'}
                            </Button>
                        </ButtonGroup>
                    </EditModeHeader>
                )}
                <div className={`box clearfix pt-4 pb-4 pl-5 pr-5 ${this.props.editMode ? 'rounded-bottom' : 'rounded'}`}>
                    <div className="mb-2">
                        {!this.props.editMode ? (
                            <h3 className="pb-2 mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {this.props.label}
                                <RequireAuthentication
                                    component={Button}
                                    className="float-right"
                                    color="darkblue"
                                    size="sm"
                                    onClick={() => this.props.setEditMode(true)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
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
        );
    }
}

ContributionTemplate.propTypes = {
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
    setIsLoading: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    templateID: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    doneLoading: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    setClass: PropTypes.func.isRequired,
    user: PropTypes.object
};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        editMode: state.addTemplate.editMode,
        isLoading: state.addTemplate.isLoading,
        isSaving: state.addTemplate.isSaving,
        templateID: state.addTemplate.templateID,
        label: state.addTemplate.label,
        template: state.addTemplate
    };
};

const mapDispatchToProps = dispatch => ({
    setEditMode: data => dispatch(setEditMode(data)),
    loadTemplate: data => dispatch(loadTemplate(data)),
    setIsLoading: () => dispatch(setIsLoading()),
    doneLoading: () => dispatch(doneLoading()),
    saveTemplate: data => dispatch(saveTemplate(data)),
    setClass: data => dispatch(setClass(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(ContributionTemplate);
