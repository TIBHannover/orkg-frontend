import React, { Component } from 'react';
import { Container } from 'reactstrap';
import ProgressBar from './ProgressBar';
import GeneralData from './GeneralData/GeneralData';
import ResearchField from './ResearchField/ResearchField';
import Contributions from './Contributions/Contributions';
import Finish from './Finish/Finish';
import { connect } from 'react-redux';

class AddPaper extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { currentStep } = this.props;
        let currentStepDetails;

        switch (currentStep) {
            case 1:
                currentStepDetails = <GeneralData /> 
                break;
            case 2:
                currentStepDetails = <ResearchField />
                break;
            case 3:
                currentStepDetails = <Contributions />
                break;
            case 4:
                currentStepDetails = <Finish />
                break;
        }

        // FOR DEBUGGING
        //currentStepDetails = <Contributions />
        //currentStepDetails = <Finish />

        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Add paper</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <ProgressBar currentStep={currentStep} />
                    <hr />

                    {currentStepDetails}
                </Container>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.addPaper // TODO: scope this reducer, also in other files
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPaper);