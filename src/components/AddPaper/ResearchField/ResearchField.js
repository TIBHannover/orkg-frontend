import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, fas, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../ProgressBar';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import TagsInput from '../../Utils/TagsInput';
import FormValidator from '../../Utils/FormValidator';
import styles from './ResearchField.module.scss';
import { getStatementsBySubject } from '../../../network';

/**
 * Component for selecting the research field of a paper
 * This might be redundant in the future, if the research field can be derived from the research problem
 */
class GeneralData extends Component {
    // TODO: make an initial selector, in case the page is visited when the 'back' button is pressed 
    constructor(props) {
        super(props);

        this.state = {
            researchFields: [],
            selectedResearchField: null,
            showError: false,
        }
    }

    componentDidMount() {
        this.getFields('R11', 0);
    }

    handleNextClick = () => {
        // TODO validation: check if a research field is selected
        if (this.state.selectedResearchField == 'R11') {
            this.setState({
                showError: true
            });

            return;
        }

        this.props.setParentState({
            step: 3,
            researchField: this.state.selectedResearchField
        });
    }

    handlePreviousClick = () => {
        this.props.setParentState({
            step: 1,
        });
    }

    getFields(fieldId, level) {
        getStatementsBySubject(fieldId).then((res) => {
            let researchFields = [];

            res.forEach((elm) => {
                researchFields.push({
                    'label': elm.object.label,
                    'id': elm.object.id,
                    'active': false,
                });
            });

            let researchFieldsNew = this.state.researchFields;
            researchFieldsNew[level] = researchFields;

            // add active to selected field
            if (researchFieldsNew[level - 1] !== undefined) {
                researchFieldsNew[level - 1].forEach((elm, index) => {
                    researchFieldsNew[level - 1][index]['active'] = elm.id === fieldId;
                });
            }

            // hide all higher level research fields (in case a lower level research field has been selected again)
            researchFieldsNew.forEach((elm, index) => {
                if (index > level) {
                    delete researchFieldsNew[index];
                }
            });

            this.setState({
                researchFields: researchFieldsNew,
                selectedResearchField: fieldId
            });

        });
    }

    handleFieldClick(fieldId, currentLevel) {
        this.getFields(fieldId, currentLevel + 1);
    }

    render() {
        let errorMessageClasses = 'text-danger mt-2';
        errorMessageClasses += !this.state.showError ? ' d-none' : '';

        return (
            <div>
                <h2 className="h4 mt-4 mb-5">Select the research field</h2>

                <CardDeck>
                    {this.state.researchFields.length > 0 && this.state.researchFields.map((fields, level) => {
                        return fields.length > 0 ? <Card key={level} className={`${styles.fieldSelector}`}>
                            <ListGroup className={styles.listGroup} flush>
                                {fields.map((field) => (
                                    <ListGroupItem className={`${styles.listGroupItem}`} active={field.active}
                                        key={field.id}
                                        onClick={() => this.handleFieldClick(field.id, level)}>
                                        {field.label}
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </Card>
                            : ''
                    })}
                </CardDeck>
                <p className={errorMessageClasses}>Please select the research field</p>
                
                <hr className="mt-5 mb-3" />
                {/*<strong>Selected research field</strong> <br />
                <span >{this.state.selectedResearchField}</span>*/}

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.handlePreviousClick}>Previous step</Button>
            </div>
        );
    }
}

export default GeneralData;