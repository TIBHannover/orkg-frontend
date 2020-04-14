import React, { Component } from 'react';
import { Button, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { setEditMode, loadTemplate, saveTemplate, setIsLoading, doneLoading } from 'actions/addTemplate';
import { faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled, { withTheme } from 'styled-components';
import ROUTES from 'constants/routes.js';
import { StyledContainer } from './styled';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import GeneralSettings from './Tabs/GeneralSettings/GeneralSettings';
import ComponentsTab from './Tabs/ComponentsTab/ComponentsTab';

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
            error: null
        };
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            this.props.loadTemplate(this.props.match.params.id);
        } else {
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

    toggleTab = tab => {
        this.setState({
            activeTab: tab
        });
    };

    render() {
        return (
            <StyledContainer className="clearfix">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">{!this.props.match.params.id ? 'Create new template' : 'Template'}</h1>
                {this.props.match.params.id && this.props.editMode && (
                    <EditModeHeader className="box">
                        <Title>Edit mode</Title>
                    </EditModeHeader>
                )}
                <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                    <div className={'mb-2'}>
                        {!this.props.editMode ? (
                            <h3 className={'pb-2 mb-3'} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {this.props.label}
                                <Button className="float-right" color="darkblue" size="sm" onClick={() => this.props.setEditMode(true)}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            </h3>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className={'mb-3'}>
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
                        </TabContent>
                    </div>
                    {(this.props.editMode || this.props.isSaving) && (
                        <>
                            <Button
                                disabled={this.props.isSaving}
                                color="primary"
                                className="float-right mb-4"
                                onClick={() => this.props.saveTemplate(this.props.template)}
                            >
                                {this.props.isSaving && <Icon icon={faSpinner} spin />}
                                {!this.props.isSaving ? ' Save Template' : ' Saving'}
                            </Button>
                        </>
                    )}
                </div>
            </StyledContainer>
        );
    }
}

ContributionTemplate.propTypes = {
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
    template: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
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
    saveTemplate: data => dispatch(saveTemplate(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(ContributionTemplate);
