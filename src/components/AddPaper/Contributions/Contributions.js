import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../Utils/Tooltip';
import TagsInput from '../../Utils/TagsInput';
import styles from './Contributions.module.scss';
import Statements from './Statements/Statements';
import { connect } from 'react-redux';
import { nextStep, previousStep, createContribution, deleteContribution, selectContribution, updateResearchProblems, saveAddPaper } from '../../../actions/addPaper';
import Confirm from 'reactstrap-confirm';

class Contributions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            researchProblems: [],
            collapse: false, //replace
            dropdownOpen: false, //replace
        }

        // if there is no contribution yet, create the first one
        if (this.props.contributions.allIds.length === 0) {
            this.props.createContribution({selectAfterCreation: true});
        }
    }

    handleNextClick = () => {
        // save add paper 
        this.props.saveAddPaper({
            title: this.props.title,
            authors: this.props.authors,
            publicationMonth: this.props.publicationMonth,
            publicationYear: this.props.publicationYear,
            doi: this.props.doi,
            selectedResearchField: this.props.selectedResearchField,
            contributions: this.props.contributions,
            resources: this.props.resources,
            properties: this.props.properties,
            values: this.props.values,
        });
        this.props.nextStep();
    }

    toggleDeleteContribution = async (id) => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            this.props.deleteContribution(id);
        }
    }

    handleResearchProblemsChange = (problemsArray) => {
        this.props.updateResearchProblems({
            problemsArray,
            contributionId: this.props.selectedContribution
        });
    }

    handleSelectContribution = (contributionId) => {
        this.props.selectContribution(contributionId);
    }

    render() {
        let selectedResourceId = this.props.selectedContribution;

        return (
            <div>
                <h2 className="h4 mt-4 mb-5">Specify research contributions</h2>

                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            <ul className={styles.contributionsList}>
                                {this.props.contributions.allIds.map((contribution, index) => {
                                    let contributionId = this.props.contributions.byId[contribution]['id'];

                                    return <li className={contributionId === this.props.selectedContribution ? styles.activeContribution : ''} key={contributionId}>
                                        <span className={styles.selectContribution} onClick={() => this.handleSelectContribution(contributionId)}>
                                            Contribution {index + 1}
                                            <span className={`${styles.deleteContribution} float-right mr-1 ${contributionId !== this.props.selectedContribution && 'd-none'}`}>
                                                <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                                                    <Icon icon={faTrash} onClick={() => this.toggleDeleteContribution(contributionId)} />
                                                </Tooltip>
                                            </span>
                                        </span>
                                    </li>
                                })}

                                <li className={`${styles.addContribution} text-primary`}>
                                    <span onClick={this.props.createContribution}>+ Add another contribution</span>
                                </li>
                            </ul>
                        </Col>
                        <Col xs="9">
                            <div className={styles.contribution}>
                                <Form>
                                    <FormGroup>
                                        <Label>
                                            <Tooltip message="Specify the research problems that this contributions addresses. Normally, a research problem consists of very few words (around 2 or 3)">Research problems</Tooltip>
                                        </Label>
                                        <TagsInput handler={this.handleResearchProblemsChange} value={this.props.researchProblems} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>
                                            <Tooltip message="Provide details about this contribution by making statements. Some suggestions are already displayed, you can use this when it is useful, or delete it when it is not">Statements</Tooltip>
                                        </Label>

                                        <Statements enableEdit={true}
                                            resourceId={selectedResourceId} />

                                    </FormGroup>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <hr className="mt-5 mb-3" />
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        ...state.addPaper,
        researchProblems: state.addPaper.contributions.byId[state.addPaper.selectedContribution] ? state.addPaper.contributions.byId[state.addPaper.selectedContribution].researchProblems : []
    }
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    createContribution: (data) => dispatch(createContribution(data)),
    deleteContribution: (id) => dispatch(deleteContribution(id)),
    selectContribution: (id) => dispatch(selectContribution(id)),
    updateResearchProblems: (data) => dispatch(updateResearchProblems(data)),
    saveAddPaper: (data) => dispatch(saveAddPaper(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);