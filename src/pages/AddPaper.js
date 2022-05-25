import { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { compose } from 'redux';
import ProgressBar from 'components/AddPaper/ProgressBar';
import GeneralData from 'components/AddPaper/GeneralData/GeneralData';
import ResearchField from 'components/AddPaper/ResearchField/ResearchField';
import Contributions from 'components/AddPaper/Contributions/Contributions';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestion, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import Finish from 'components/AddPaper/Finish/Finish';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { resetStatementBrowser } from 'slices/statementBrowserSlice';
import { openTour, closeTour, blockNavigation, loadPaperDataAction as loadPaperData } from 'slices/addPaperSlice';
// import { Prompt } from 'react-router';
import GizmoGraphViewModal from 'components/ViewPaper/GraphView/GizmoGraphViewModal';
import env from '@beam-australia/react-env';
import TitleBar from 'components/TitleBar/TitleBar';
import { SubTitle } from 'components/styled';

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
    height: 28px;
    width: 28px !important;
    z-index: 9999;
    background-color: ${props => props.theme.primary};
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

class AddPaper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showGraphModal: false,
            dropdownOpen: false,
        };
    }

    componentDidMount() {
        // Set document title
        document.title = 'Add paper - ORKG';
        this.props.resetStatementBrowser();
    }

    componentDidUpdate = prevProps => {
        // paperNewResourceId : means paper is saved
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
            this.props.blockNavigation({ status: true });
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
            [type]: !prevState[type],
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
                {/*
                <Prompt when={this.props.addPaper.shouldBlockNavigation} message="You have unsaved changes, are you sure you want to leave?" />
                 */}

                <TitleBar
                    titleAddition={this.props.currentStep > 1 && <SubTitle>{this.props.addPaper.title}</SubTitle>}
                    buttonGroup={
                        <Button
                            color="secondary"
                            size="sm"
                            className="flex-shrink-0"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => this.toggle('showGraphModal')}
                        >
                            <Icon icon={faProjectDiagram} className="me-1" /> View graph
                        </Button>
                    }
                    wrap={false}
                >
                    Add paper
                </TitleBar>

                <Container className="box rounded pt-4 pb-4 ps-md-5 pe-md-5 clearfix ">
                    <ProgressBar currentStep={currentStep} />

                    <hr />

                    <TransitionGroup exit={false}>{currentStepDetails}</TransitionGroup>
                </Container>

                <GizmoGraphViewModal
                    addPaperVisualization={true}
                    showDialog={this.state.showGraphModal}
                    toggle={() => this.toggle('showGraphModal')}
                />
                {/* the style display node will hide the help button when the graph view is activated */}
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
    statementBrowser: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    currentStep: state.addPaper.currentStep,
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser,
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    openTour: () => dispatch(openTour()),
    closeTour: () => dispatch(closeTour()),
    blockNavigation: data => dispatch(blockNavigation(data)),
    loadPaperData: data => dispatch(loadPaperData(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies,
)(AddPaper);
