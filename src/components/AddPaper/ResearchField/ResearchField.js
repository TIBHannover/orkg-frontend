import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../ProgressBar';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import TagsInput from '../../Utils/TagsInput';
import FormValidator from '../../Utils/FormValidator';

/**
 * Component for selecting the research field of a paper
 * This might be redundant in the future, if the research field can be derived from the research problem
 */
class GeneralData extends Component {
    constructor(props) {
        super(props);

        this.state = {
        
        }
    }

    handleNextClick = () => {
        this.props.setParentState({
            step: 3,
        });
    }

    handlePreviousClick = () => {
        this.props.setParentState({
            step: 1,
        });
    }

    render() {
        
        return (
            <div>
                <h2 className="h4 mt-4">Select the research field</h2>

                
                <hr className="mt-5 mb-3" />

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.handlePreviousClick}>Previous step</Button>
            </div>
        );
    }
}

export default GeneralData;