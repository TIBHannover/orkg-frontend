import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import ContributionItemList from './ContributionItemList';
import ContributionsHelpTour from './ContributionsHelpTour';
import Tooltip from '../../Utils/Tooltip';
import { StyledContributionsList } from './styled';
import { connect } from 'react-redux';
import {
    nextStep,
    previousStep,
    createContribution,
    deleteContribution,
    selectContribution,
    updateContributionLabel,
    saveAddPaper,
    openTour,
    toggleAbstractDialog
} from '../../../actions/addPaper';
import Abstract from './../Abstract/Abstract';
import Confirm from 'reactstrap-confirm';
import Contribution from './Contribution';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

class Contributions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: {}
        };
        this.inputRefs = {};
    }

    componentDidMount() {
        // if there is no contribution yet, create the first one
        if (this.props.contributions.allIds.length === 0) {
            this.props.createContribution({
                selectAfterCreation: true,
                prefillStatements: true,
                researchField: this.props.selectedResearchField
            });
        }
    }

    handleNextClick = async () => {
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
            values: this.props.values
        });
        this.props.nextStep();
    };

    toggleDeleteContribution = async id => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            // delete the contribution and select the first one in the remaining list
            let selectedId = this.props.contributions.allIds.filter(i => i !== id)[0];
            this.props.deleteContribution({ id, selectAfterDeletion: this.props.contributions.byId[selectedId] });
        }
    };

    toggleEditLabelContribution = (contributionId, e) => {
        if (this.state.editing[contributionId]) {
            this.setState({ editing: { ...this.state.editing, [contributionId]: false } });
        } else {
            // enable editing and focus on the input
            this.setState({ editing: { ...this.state.editing, [contributionId]: true } }, () => {
                this.inputRefs[contributionId].focus();
            });
        }
    };

    pasteAsPlainText = event => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, text);
    };

    handleSelectContribution = contributionId => {
        const resourceId = this.props.contributions.byId[contributionId].resourceId;

        this.props.selectContribution({
            id: contributionId,
            resourceId
        });
    };

    handleChange = (contributionId, label) => {
        this.props.updateContributionLabel({
            label: label,
            contributionId: contributionId
        });
    };

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        let selectedResourceId = this.props.selectedContribution;

        return (
            <div>
                <div className={'d-flex align-items-center mt-4 mb-5'}>
                    <h2 className="h4 flex-shrink-0">
                        <Tooltip
                            message={
                                <span>
                                    Specify the research contributions that this paper makes. A paper can have multiple contributions and each
                                    contribution addresses at least one research problem.{' '}
                                    <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(1)}>
                                        Learn more
                                    </span>
                                </span>
                            }
                        >
                            Specify research contributions
                        </Tooltip>
                    </h2>
                    <Button onClick={this.props.toggleAbstractDialog} outline size={'sm'} className="flex-shrink-0 ml-auto" color="darkblue">
                        <Icon icon={faMagic} /> Abstract annotator
                    </Button>
                </div>
                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            <StyledContributionsList id="contributionsList">
                                {this.props.contributions.allIds.map((contributionId, index) => {
                                    let contribution = this.props.contributions.byId[contributionId];

                                    return (
                                        <ContributionItemList
                                            handleChangeContributionLabel={this.handleChange}
                                            isSelected={contributionId === selectedResourceId}
                                            canDelete={this.props.contributions.allIds.length !== 1}
                                            selectedContributionId={this.state.selectedContribution}
                                            contribution={contribution}
                                            key={contributionId}
                                            toggleDeleteContribution={this.toggleDeleteContribution}
                                            handleSelectContribution={this.handleSelectContribution}
                                        />
                                    );
                                })}

                                <li className={'addContribution text-primary'}>
                                    <span onClick={this.props.createContribution}>+ Add another contribution</span>
                                </li>
                            </StyledContributionsList>
                        </Col>

                        <TransitionGroup className="col-9" exit={false}>
                            <AnimationContainer classNames="fadeIn" timeout={{ enter: 500, exit: 0 }} key={selectedResourceId}>
                                <Contribution id={selectedResourceId} />
                            </AnimationContainer>
                        </TransitionGroup>
                    </Row>
                </Container>

                <hr className="mt-5 mb-3" />

                <Abstract />

                <ContributionsHelpTour />

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>
                    Finish
                </Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>
                    Previous step
                </Button>
            </div>
        );
    }
}

Contributions.propTypes = {
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    doi: PropTypes.string.isRequired,
    selectedResearchField: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    createContribution: PropTypes.func.isRequired,
    deleteContribution: PropTypes.func.isRequired,
    selectContribution: PropTypes.func.isRequired,
    updateContributionLabel: PropTypes.func.isRequired,
    saveAddPaper: PropTypes.func.isRequired,
    openTour: PropTypes.func.isRequired,
    toggleAbstractDialog: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        title: state.addPaper.title,
        authors: state.addPaper.authors,
        publicationMonth: state.addPaper.publicationMonth,
        publicationYear: state.addPaper.publicationYear,
        doi: state.addPaper.doi,
        selectedResearchField: state.addPaper.selectedResearchField,
        contributions: state.addPaper.contributions,
        selectedContribution: state.addPaper.selectedContribution,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values
    };
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    createContribution: data => dispatch(createContribution(data)),
    deleteContribution: data => dispatch(deleteContribution(data)),
    selectContribution: id => dispatch(selectContribution(id)),
    updateContributionLabel: data => dispatch(updateContributionLabel(data)),
    saveAddPaper: data => dispatch(saveAddPaper(data)),
    openTour: data => dispatch(openTour(data)),
    toggleAbstractDialog: () => dispatch(toggleAbstractDialog())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);
