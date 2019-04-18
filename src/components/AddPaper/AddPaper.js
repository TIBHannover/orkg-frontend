import React, { Component } from 'react';
import { Container } from 'reactstrap';
import ProgressBar from './ProgressBar';
import GeneralData from './GeneralData/GeneralData';
import ResearchField from './ResearchField/ResearchField';
import Contributions from './Contributions/Contributions';
import Finish from './Finish/Finish';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { CSSTransitionGroup } from 'react-transition-group'

const AnimationContainer = styled.div`
    &.fadeIn-enter {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity:1;
        transition:1s opacity;
    }
`;

class AddPaper extends Component {
    render() {
        let { currentStep } = this.props;
        let currentStepDetails;

        switch (currentStep) {
            case 1:
            default:
                currentStepDetails = <AnimationContainer key={1}><GeneralData /></AnimationContainer>
                break;
            case 2:
                currentStepDetails = <AnimationContainer key={2}><ResearchField /></AnimationContainer>
                break;
            case 3:
                currentStepDetails = <AnimationContainer key={3}><Contributions /></AnimationContainer>
                break;
            case 4:
                currentStepDetails = <AnimationContainer key={4}><Finish /></AnimationContainer>
                break;
        }

        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Add paper</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <ProgressBar currentStep={currentStep} />
                    <hr />
                    <CSSTransitionGroup
                        transitionName="fadeIn"
                        transitionEnterTimeout={700}
                        transitionLeave={false}>
                            {currentStepDetails}
                    </CSSTransitionGroup>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.addPaper // TODO: scope this reducer, also in other files
});

export default connect(
    mapStateToProps,
    null
)(AddPaper);