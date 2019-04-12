import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Button } from 'reactstrap';
import { getStatementsBySubject, getResource } from '../../network';
import { connect } from 'react-redux';
import { selectContribution } from '../../actions/viewPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars } from '@fortawesome/free-solid-svg-icons';
import styles from '../AddPaper/Contributions/Contributions.module.scss';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../Utils/Tooltip';
//import Statements from './Statements';
import Statements from '../AddPaper/Contributions/Statements/Statements';

// TODO: right now, the reducer from addPaper is being used, since the setup of this page is very similar.
// Dependent on the future look/functionalitiy of this page, the reducers should split and renamed so viewing
// a paper is not needing a reducer that is called: addPaper (e.g. make a reducer for the statement browser?)
class Contributions extends Component {
    state = {
        selectedContribution: null,
    }

    componentDidMount = async () => {

    }
    
    handleSelectContribution = (contributionId) => {
        let contributionIsLoaded = this.props.addPaper.resources.byId[contributionId] ? true : false;
        this.props.selectContribution({
            contributionId, 
            contributionIsLoaded
        })
    }

    render() {
        if (this.props.addPaper.selectedContribution === null && this.props.contributions[0]) {
            this.handleSelectContribution(this.props.contributions[0]);
        }

        let selectedContributionId = this.props.addPaper.selectedContribution;

        return <div>
            <Container>
                <Row noGutters={true}>
                    <Col xs="3">
                        <ul className={styles.contributionsList}>
                            {this.props.contributions.map((contributionId, index) => {
                                return <li className={contributionId === selectedContributionId ? styles.activeContribution : ''} key={contributionId}>
                                    <span className={styles.selectContribution} onClick={() => this.handleSelectContribution(contributionId)}>
                                        Contribution {index + 1}
                                    </span>
                                </li>
                            })}
                        </ul>
                    </Col>
                    <Col xs="9">
                        <div className={styles.contribution}>
                            <Form>
                                <FormGroup>
                                    <Label>
                                        <strong>Research problem</strong>
                                    </Label>
                                    {this.props.viewPaper.researchProblems[selectedContributionId] && this.props.viewPaper.researchProblems[selectedContributionId].map((problem, index) => (
                                        <span key={index}>
                                            <br />
                                            <span className="btn btn-link p-0 border-0 align-baseline">{problem.label}</span>
                                        </span>
                                    ))}
                                </FormGroup>
                                <FormGroup>
                                    <Label>
                                        <strong>Statements</strong>
                                    </Label>

                                    <Statements enableEdit={false}
                                        resourceId={this.props.addPaper.selectedContribution} />
                                </FormGroup>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>;
    }
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
    addPaper: state.addPaper,
});

const mapDispatchToProps = dispatch => ({
    selectContribution: (data) => dispatch(selectContribution(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);