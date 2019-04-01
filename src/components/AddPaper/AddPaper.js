import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from './ProgressBar';
import GeneralData from './GeneralData/GeneralData';
import ResearchField from './ResearchField/ResearchField';
import Contributions from './Contributions/Contributions';
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
        }

        // FOR DEBUGGING
        //currentStepDetails = <Contributions />

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
    ...state.addPaper
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPaper);