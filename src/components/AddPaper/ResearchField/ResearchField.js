import React, { Component } from 'react';
import { Button, Card, ListGroup, ListGroupItem, CardDeck } from 'reactstrap';
import { getStatementsBySubject } from '../../../network';
import { connect } from 'react-redux';
import { updateResearchField, nextStep, previousStep } from '../../../actions/addPaper';
import { CSSTransitionGroup } from 'react-transition-group'
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ListGroupItemStyled = styled(ListGroupItem)`
    transition: 0.3s background-color,  0.3s border-color;
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
    cursor: pointer;
    border-radius: 0 !important; //overwrite bootstrap border radius since a card is used to display the lists

    &.fadeIn-enter, &.fadeIn-appear {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active, &.fadeIn-appear.fadeIn-appear-active {
        opacity:1;
        transition:0.5s opacity;
    }
`;

const FieldSelector = styled(Card)`
    max-width: 260px;
    height: 300px;
    overflow-y: auto;
`;

/**
 * Component for selecting the research field of a paper
 * This might be redundant in the future, if the research field can be derived from the research problem
 */

class ResearchField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showError: false,
        }
    }

    componentDidMount() {
        // select the main field is none is selected yet (i.e. first time visiting this step)
        if (this.props.selectedResearchField === '') {
            this.getFields(process.env.REACT_APP_RESEARCH_FIELD_MAIN, 0);
        }
    }

    handleNextClick = () => {
        // TODO validation: check if a research field is selected
        if (this.props.selectedResearchField === process.env.REACT_APP_RESEARCH_FIELD_MAIN) {
            this.setState({
                showError: true
            });

            return;
        }

        this.props.nextStep();
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

            let researchFieldsNew = [...this.props.researchFields];
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

            this.props.updateResearchField({
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
                    {this.props.researchFields.length > 0 && this.props.researchFields.map((fields, level) => {
                        return fields.length > 0 ? (
                            <FieldSelector className="fieldSelector" key={level}>
                                <ListGroup flush>
                                    <CSSTransitionGroup
                                        transitionName="fadeIn"
                                        transitionEnterTimeout={500}
                                        transitionLeave={false}
                                        transitionAppear={true}
                                        transitionAppearTimeout={500}
                                    >
                                        {fields.map((field) => (
                                            <ListGroupItemStyled
                                                key={field.id}
                                                active={field.active}
                                                onClick={() => this.handleFieldClick(field.id, level)}
                                            >
                                                {field.label}
                                            </ListGroupItemStyled>
                                        ))}
                                    </CSSTransitionGroup>
                                </ListGroup>
                            </FieldSelector>
                        ) : ''
                    })}
                </CardDeck>
                <p className={errorMessageClasses}>Please select the research field</p>

                <hr className="mt-5 mb-3" />
                {/*<strong>Selected research field</strong> <br />
                <span >{this.state.selectedResearchField}</span>*/}

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
            </div>
        );
    }
}

ResearchField.propTypes = {
    selectedResearchField: PropTypes.string.isRequired,
    researchFields: PropTypes.array.isRequired,
    updateResearchField: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    selectedResearchField: state.addPaper.selectedResearchField,
    researchFields: state.addPaper.researchFields,
});

const mapDispatchToProps = dispatch => ({
    updateResearchField: (data) => dispatch(updateResearchField(data)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResearchField);