import React, { Component } from 'react';
import { Container, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { compose } from 'redux';
import ProgressBar from './ProgressBar';
import GeneralData from './GeneralData/GeneralData';
import ResearchField from './ResearchField/ResearchField';
import Contributions from './Contributions/Contributions';
import Abstract from './Abstract/Abstract';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestion, faBars } from '@fortawesome/free-solid-svg-icons';
import Finish from './Finish/Finish';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import { CSSTransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import { resetStatementBrowser } from '../../actions/statementBrowser';
import { openTour, closeTour } from '../../actions/addPaper';
import GraphViewModal from '../ViewPaper/GraphViewModal';

const Help = styled.div`
    box-sizing: border-box;
    margin: 25px;
    position: fixed;
    white-space: nowrap;
    z-index: 9998;
    padding-left: 0;
    list-style: none;
    padding: 0;
    bottom: 24px;
    right: 24px;
    color: '#80869b';
`;

const HelpIcon = styled(Icon)`
    vertical-align: middle;
    height: 56px;
    width: 56px;
    z-index: 9999;
    background-color: ${(props) => props.theme.orkgPrimaryColor};
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
    padding: 0;
    -webkit-user-drag: none;
    font-weight: bold;
    color: #f1f1f1;
    font-size: 18px;
`;

const AnimationContainer = styled.div`
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

    toggleDropdown = () => {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    };

    toggle = (type) => {
        this.setState((prevState) => ({
            [type]: !prevState[type],
        }));
    };

    toggleTour = () => {
        if (this.props.isTourOpen) {
            this.props.closeTour();
        } else {
            this.props.openTour();
        }
    };

    render() {
        let { currentStep } = this.props;
        let currentStepDetails;

        switch (currentStep) {
            case 1:
            default:
                currentStepDetails = (
                    <AnimationContainer key={1}>
                        <GeneralData />
                    </AnimationContainer>
                );
                break;
            case 2:
                currentStepDetails = (
                    <AnimationContainer key={2}>
                        <ResearchField />
                    </AnimationContainer>
                );
                break;
            case 3:
                currentStepDetails = <AnimationContainer key={3}><Abstract /></AnimationContainer>
                break;
            case 4:
                currentStepDetails = <AnimationContainer key={4}><Contributions /></AnimationContainer>
                break;
            case 5:
                currentStepDetails = <AnimationContainer key={5}><Finish /></AnimationContainer>
                break;
        }

        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4 float-left">Add paper</h1>

                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} className="mb-4 mt-4 float-right" style={{ marginLeft: 'auto' }}>
                        <DropdownToggle color="darkblue" size="sm">
                            <Icon icon={faBars} className="mr-2" /> Options
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => this.toggle('showGraphModal')}>Show graph visualization</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <div className="clearfix" />
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <ProgressBar currentStep={currentStep} />

                    <hr />

                    <CSSTransitionGroup transitionName="fadeIn" transitionEnterTimeout={700} transitionLeave={false}>
                        {currentStepDetails}
                    </CSSTransitionGroup>
                </Container>

                <GraphViewModal
                    showDialog={this.state.showGraphModal}
                    toggle={() => this.toggle('showGraphModal')}
                //paperId={this.props.match.params.resourceId}
                />

                <Help onClick={() => {
                    this.toggleTour();
                }} id="helpIcon"
                >
                    <HelpIcon
                        style={{ padding: '12px', height: '48px', width: '48px' }}
                        icon={faQuestion}
                    />
                    <div style={{ cursor: 'pointer', display: 'inline-block', marginLeft: '8px', fontWeight: 'bold', lineHeight: '56px', fontSize: 'large' }}>Help</div>
                </Help>


            </div>
        );
    }
}

AddPaper.propTypes = {
    currentStep: PropTypes.number.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    resetStatementBrowser: PropTypes.func.isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    currentStep: state.addPaper.currentStep,
    isTourOpen: state.addPaper.isTourOpen,
});

const mapDispatchToProps = (dispatch) => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
    openTour: () => dispatch(openTour()),
    closeTour: () => dispatch(closeTour()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(AddPaper);
