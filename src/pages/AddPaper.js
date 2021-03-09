import { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { compose } from 'redux';
import ProgressBar from '../components/AddPaper/ProgressBar';
import GeneralData from '../components/AddPaper/GeneralData/GeneralData';
import ResearchField from '../components/AddPaper/ResearchField/ResearchField';
import Contributions from '../components/AddPaper/Contributions/Contributions';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestion, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import Finish from '../components/AddPaper/Finish/Finish';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { resetStatementBrowser } from '../actions/statementBrowser';
import { openTour, closeTour, blockNavigation, loadPaperData } from '../actions/addPaper';
import { Prompt } from 'react-router';
import GizmoGraphViewModal from '../components/ViewPaper/GraphView/GizmoGraphViewModal';
import env from '@beam-australia/react-env';

const Help = styled.div`
    box-sizing: border-box;
    margin: 25px;
    position: fixed;
    white-space: nowrap;
    z-index: 9998;
    padding-left: 0;
    list-style: none;
    padding: 0;
    bottom: ${props => (props.woochat ? '74px' : '24px')};
    right: ${props => (props.woochat ? '4px' : '24px')};
    color: #80869b;

    .text {
        cursor: pointer;
        display: inline-block;
        margin-left: 8px;
        font-weight: bold;
        line-height: 56px;
        font-size: large;
    }

    .white {
        color: #fff;
    }
`;

const HelpIcon = styled(Icon)`
    vertical-align: middle;
    height: 48px;
    width: 48px !important;
    z-index: 9999;
    background-color: ${props => props.theme.orkgPrimaryColor};
    display: inline-flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    position: relative;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.28);
    cursor: pointer;
    outline: none;
    padding: 12px;
    -webkit-user-drag: none;
    font-weight: bold;
    color: #f1f1f1;
    font-size: 18px;
`;

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

const SubtitleSeparator = styled.div`
    background: ${props => props.theme.darkblue};
    width: 2px;
    height: 30px;
    margin: 0 15px;
    content: '';
    display: block;
    opacity: 0.7;
`;

const PaperTitle = styled.div`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
    color: #62687d;
`;

class AddPaper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showGraphModal: false,
            dropdownOpen: false
        };
    }

    componentDidMount() {
        // Set document title
        document.title = 'Add paper - ORKG';
        this.props.resetStatementBrowser();
    }

    componentDidUpdate = prevProps => {
        //paperNewResourceId : means paper is saved
        if (
            !this.props.addPaper.shouldBlockNavigation &&
            prevProps.addPaper.shouldBlockNavigation &&
            prevProps.addPaper.currentStep !== 1 &&
            this.props.addPaper.currentStep === 1 &&
            !prevProps.addPaper.paperNewResourceId
        ) {
            console.log('Load data from the previous global state');
            this.props.loadPaperData({ addPaper: prevProps.addPaper, statementBrowser: prevProps.statementBrowser });
        }

        if (!this.props.addPaper.shouldBlockNavigation && this.props.currentStep > 1 && !this.props.addPaper.paperNewResourceId) {
            this.props.blockNavigation();
            window.onbeforeunload = () => true;
        }
        if (!this.props.addPaper.shouldBlockNavigation && prevProps.addPaper.shouldBlockNavigation !== this.props.addPaper.shouldBlockNavigation) {
            window.onbeforeunload = null;
        }
    };

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    toggleTour = () => {
        if (this.props.addPaper.isTourOpen) {
            this.props.closeTour();
        } else {
            this.props.openTour();
        }
    };

    render() {
        const { currentStep } = this.props;
        let currentStepDetails;

        switch (currentStep) {
            case 1:
            default:
                currentStepDetails = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <GeneralData />
                    </AnimationContainer>
                );
                break;
            case 2:
                currentStepDetails = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <ResearchField />
                    </AnimationContainer>
                );
                break;
            case 3:
                currentStepDetails = (
                    <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <Contributions />
                    </AnimationContainer>
                );
                break;
            case 4:
                currentStepDetails = (
                    <AnimationContainer key={5} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <Finish />
                    </AnimationContainer>
                );
                break;
        }

        return (
            <div>
                <Prompt when={this.props.addPaper.shouldBlockNavigation} message="You have unsaved changes, are you sure you want to leave?" />
                <Container className="p-0 mt-4 mb-4 d-flex align-items-center">
                    <h1 className="h4 flex-shrink-0 mb-0">Add paper</h1>

                    {this.props.currentStep > 1 && (
                        <>
                            <SubtitleSeparator />

                            <PaperTitle>{this.props.addPaper.title}</PaperTitle>
                        </>
                    )}

                    {/*<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} className="mb-4 mt-4 float-right" style={{ marginLeft: 'auto' }}>
                        <DropdownToggle color="darkblue" size="sm">
                            <Icon icon={faBars} className="mr-2" /> Options
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => this.toggle('showGraphModal')}>Show graph visualization</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>*/}

                    <Button
                        color="darkblue"
                        size="sm"
                        className="flex-shrink-0"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => this.toggle('showGraphModal')}
                    >
                        <Icon icon={faProjectDiagram} className="mr-1" /> View graph
                    </Button>

                    <div className="clearfix" />
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-md-5 pr-md-5 clearfix ">
                    <ProgressBar currentStep={currentStep} />

                    <hr />

                    <TransitionGroup exit={false}>{currentStepDetails}</TransitionGroup>
                </Container>

                <GizmoGraphViewModal
                    addPaperVisualization={true}
                    showDialog={this.state.showGraphModal}
                    toggle={() => this.toggle('showGraphModal')}
                />
                {/*the style display node will hide the help button when the graph view is activated*/}
                {this.props.currentStep !== 2 && (
                    <Help
                        style={this.state.showGraphModal ? { display: 'none' } : {}}
                        onClick={() => {
                            this.toggleTour();
                        }}
                        id="helpIcon"
                        woochat={env('CHATWOOT_WEBSITE_TOKEN')}
                    >
                        <HelpIcon icon={faQuestion} />
                    </Help>
                )}
            </div>
        );
    }
}

AddPaper.propTypes = {
    currentStep: PropTypes.number.isRequired,
    resetStatementBrowser: PropTypes.func.isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    blockNavigation: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    loadPaperData: PropTypes.func.isRequired,
    addPaper: PropTypes.object.isRequired,
    statementBrowser: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    currentStep: state.addPaper.currentStep,
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    openTour: () => dispatch(openTour()),
    closeTour: () => dispatch(closeTour()),
    blockNavigation: () => dispatch(blockNavigation()),
    loadPaperData: data => dispatch(loadPaperData(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme,
    withCookies
)(AddPaper);
