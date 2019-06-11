import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import ResearchProblemInput from './ResearchProblemInput';
import styles from './Contributions.module.scss';
import StatementBrowser from '../../StatementBrowser/Statements';
import { connect } from 'react-redux';
import { updateResearchProblems } from '../../../actions/addPaper';
import PropTypes from 'prop-types';

class Contribution extends Component {
    handleResearchProblemsChange = (problemsArray) => {
        this.props.updateResearchProblems({
            problemsArray,
            contributionId: this.props.id,
        });
    }

    render() {
        return (
            <div className={styles.contribution}>
                <Form>
                    <FormGroup>
                        <Label>
                            <Tooltip message="Specify the research problems that this contribution addresses. Normally, a research problem consists of very few words (around 2 or 3)">Research problems</Tooltip>
                        </Label>
                        <ResearchProblemInput handler={this.handleResearchProblemsChange} value={this.props.researchProblems} />
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <Tooltip message="Provide details about this contribution by making statements. Some suggestions are already displayed, you can use this when it is useful, or delete it when it is not">Contribution data</Tooltip>
                        </Label>

                        <StatementBrowser 
                            enableEdit={true}
                            openExistingResourcesInDialog={true}
                        />
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

Contribution.propTypes = {
    id: PropTypes.string.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    researchProblems: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        researchProblems: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].researchProblems : []
    }
};

const mapDispatchToProps = dispatch => ({
    updateResearchProblems: (data) => dispatch(updateResearchProblems(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contribution);