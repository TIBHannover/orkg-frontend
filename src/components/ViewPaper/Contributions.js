import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup } from 'reactstrap';
import { connect } from 'react-redux';
import { selectContribution } from '../../actions/viewPaper';
import styles from '../AddPaper/Contributions/Contributions.module.scss';
import Statements from '../AddPaper/Contributions/Statements/Statements';
import styled from 'styled-components';
import SimilarContributions from './SimilarContributions';
import PropTypes from 'prop-types';

const Title = styled.div`
    font-size:18px;
    font-weight:500;
    margin-top:30px;
    margin-bottom:5px;
`;

// TODO: right now, the reducer from addPaper is being used, since the setup of this page is very similar.
// Dependent on the future look/functionalitiy of this page, the reducers should split and renamed so viewing
// a paper is not needing a reducer that is called: addPaper (e.g. make a reducer for the statement browser?)
class Contributions extends Component {
    state = {
        selectedContribution: '',
    }

    componentDidMount = async () => {

    }

    handleSelectContribution = (contributionId) => {
        let contributionIsLoaded = this.props.resources.byId[contributionId] ? true : false;
        this.props.selectContribution({
            contributionId,
            contributionIsLoaded
        })
    }

    render() {
        if (this.props.selectedContribution === '' && this.props.contributions[0]) {
            this.handleSelectContribution(this.props.contributions[0]);
        }

        let selectedContributionId = this.props.selectedContribution;

        return (
            <div>
                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            <ul className={styles.contributionsList}>
                                {this.props.contributions.map((contributionId, index) => {
                                    return (
                                        <li className={contributionId === selectedContributionId ? styles.activeContribution : ''} key={contributionId}>
                                            <span className={styles.selectContribution} onClick={() => this.handleSelectContribution(contributionId)}>
                                                Contribution {index + 1}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Col>
                        <Col xs="9">
                            <div className={styles.contribution}>
                                <Form>
                                    <FormGroup>
                                        <Title style={{ marginTop: 0 }}>Research problems</Title>
                                        {this.props.researchProblems[selectedContributionId] && this.props.researchProblems[selectedContributionId].map((problem, index) => (
                                            <span key={index}>
                                                <span className="btn btn-link p-0 border-0 align-baseline">{problem.label}</span>
                                            </span>
                                        ))}
                                    </FormGroup>

                                    <FormGroup>
                                        <Title>Contribution data</Title>

                                        <Statements 
                                            enableEdit={false}
                                            resourceId={this.props.selectedContribution} 
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Title>Similar contributions</Title>

                                        <SimilarContributions />
                                    </FormGroup>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

Contributions.propTypes = {
    researchProblems: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    researchProblems: state.viewPaper.researchProblems,
    resources: state.addPaper.resources,
    selectedContribution: state.addPaper.selectedContribution,
});

const mapDispatchToProps = dispatch => ({
    selectContribution: (data) => dispatch(selectContribution(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);