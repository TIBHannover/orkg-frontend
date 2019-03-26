import React, { Component } from 'react';
import { Button, Card, ListGroup, ListGroupItem, CardDeck } from 'reactstrap';
import styles from './ResearchField.module.scss';
import { getStatementsBySubject } from '../../../network';

/**
 * Component for selecting the research field of a paper
 * This might be redundant in the future, if the research field can be derived from the research problem
 */
class GeneralData extends Component {
    // TODO: make an initial selector, in case the page is visited when the 'back' button is pressed 
    // alternative would be to save the complete state of this component in the parent's state 
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