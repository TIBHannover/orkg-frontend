import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from './ProgressBar';
import GeneralData from './GeneralData/GeneralData';
import ResearchField from './ResearchField/ResearchField';


class AddPaper extends Component {
    constructor(props) {
        super(props);

        this.handleNextClick = this.handleNextClick.bind(this);
        //this.handleAuthorsChange = this.handleAuthorsChange.bind(this);

        this.state = {
            step: 1,
        }
    }

    handleNextClick(newState) {
        this.setState((prevState, props) => ({
            ...prevState,
            ...newState,
        }),() => { console.log('New state', this.state); });
    }

    render() {
        let currentStepDetails;

        switch (this.state.step) {
            case 1:
                currentStepDetails = <GeneralData setParentState={this.handleNextClick} /> /* pass the state to the child to load data on previous step */
                break;
            case 2:
                currentStepDetails = <ResearchField setParentState={this.handleNextClick} />
                break;
        }

        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Add paper</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <ProgressBar currentStep={this.state.step} />
                    <hr />

                    {currentStepDetails}

                    
                </Container>
            </div>
        );
    }
}

export default AddPaper;