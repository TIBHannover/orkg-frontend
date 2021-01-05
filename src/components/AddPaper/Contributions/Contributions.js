import React, { Component } from 'react';
import { Row, Col, Button } from 'reactstrap';
import ContributionItemList from './ContributionItemList';
import ContributionsHelpTour from './ContributionsHelpTour';
import Tooltip from 'components/Utils/Tooltip';
import { StyledHorizontalContributionsList } from './styled';
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
} from 'actions/addPaper';
import Abstract from 'components/AddPaper/Abstract/Abstract';
import Confirm from 'reactstrap-confirm';
import Contribution from './Contribution';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faMagic, faPlus } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';
import PropTypes from 'prop-types';
import { updateSettings } from 'actions/statementBrowser';

const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter-active {
        opacity: 1;
        transition: 0.7s opacity;
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
            this.props.updateSettings({
                openExistingResourcesInDialog: true
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
            publishedIn: this.props.publishedIn,
            url: this.props.url,
            selectedResearchField: this.props.selectedResearchField,
            contributions: this.props.contributions,
            resources: this.props.resources,
            properties: this.props.properties,
            values: this.props.values
        });
        this.props.nextStep();
    };

    toggleDeleteContribution = async id => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            // delete the contribution and select the first one in the remaining list
            const selectedId = this.props.contributions.allIds.filter(i => i !== id)[0];
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
        this.props.selectContribution(this.props.contributions.byId[contributionId]);
    };

    handleChange = (contributionId, label) => {
        const contribution = this.props.contributions.byId[contributionId];
        this.props.updateContributionLabel({
            label: label,
            contributionId: contributionId,
            resourceId: contribution.resourceId
        });
    };

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        const selectedResourceId = this.props.selectedContribution;

        return (
            <div>
                <div className="d-flex align-items-center mt-4 mb-5">
                    <h2 className="h4 flex-shrink-0">
                        <Tooltip
                            message={
                                <span>
                                    Specify the research contributions that this paper makes. A paper can have multiple contributions and each
                                    contribution addresses at least one research problem.{' '}
                                    <div
                                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                        onClick={() => this.handleLearnMore(1)}
                                        onKeyDown={e => {
                                            if (e.keyCode === 13) {
                                                this.handleLearnMore(1);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        Learn more
                                    </div>
                                </span>
                            }
                        >
                            Specify research contributions
                        </Tooltip>
                    </h2>
                    <Button onClick={this.props.toggleAbstractDialog} outline size="sm" className="flex-shrink-0 ml-auto" color="darkblue">
                        <Icon icon={faMagic} /> Abstract annotator
                    </Button>
                </div>
                <Row noGutters={true}>
                    <Col md="9">
                        <StyledHorizontalContributionsList id="contributionsList">
                            {this.props.contributions.allIds.map((contributionId, index) => {
                                const contribution = this.props.contributions.byId[contributionId];

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
                                        enableEdit={true}
                                    />
                                );
                            })}

                            <li className="addContribution">
                                <div
                                    onClick={this.props.createContribution}
                                    onKeyDown={e => {
                                        if (e.keyCode === 13) {
                                            this.props.createContribution();
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <Tippy content="Add contribution">
                                        <span>
                                            <Icon size="xs" icon={faPlus} />
                                        </span>
                                    </Tippy>
                                </div>
                            </li>
                        </StyledHorizontalContributionsList>
                    </Col>

                    <TransitionGroup className="col-md-9" exit={false}>
                        <AnimationContainer classNames="fadeIn" timeout={{ enter: 700, exit: 0 }} key={selectedResourceId}>
                            <div>
                                <Contribution id={selectedResourceId} />
                            </div>
                        </AnimationContainer>
                    </TransitionGroup>
                </Row>

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
    publishedIn: PropTypes.string,
    url: PropTypes.string,
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
    updateSettings: PropTypes.func.isRequired,
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
        publishedIn: state.addPaper.publishedIn,
        url: state.addPaper.url,
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
    toggleAbstractDialog: () => dispatch(toggleAbstractDialog()),
    updateSettings: data => dispatch(updateSettings(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);
