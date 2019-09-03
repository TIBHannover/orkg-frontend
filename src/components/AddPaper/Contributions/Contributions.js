import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../Utils/Tooltip';
import { StyledContributionsList, StyledContentEditable } from './styled';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
    nextStep, previousStep, createContribution, deleteContribution,
    openTour, closeTour, updateTourCurrentStep, selectContribution, updateContributionLabel, saveAddPaper
} from '../../../actions/addPaper';
import Confirm from 'reactstrap-confirm';
import Contribution from './Contribution';
import { CSSTransitionGroup } from 'react-transition-group'
import styled, { withTheme } from 'styled-components';
import { withCookies, Cookies } from 'react-cookie';
import PropTypes from 'prop-types';
import Tour from 'reactour';


const AnimationContainer = styled.div`
    transition: 0.3s background-color,  0.3s border-color;

    &.fadeIn-enter {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity:1;
        transition:0.5s opacity;
    }
`;

class Contributions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: {}
        };
        this.inputRefs = {}

        // check if a cookie of take a tour exist 
        if (this.props.cookies.get('taketour') === 'take' && this.props.tourCurrentStep === 0 && !this.props.cookies.get('showedContributions')) {
            this.props.openTour();
            this.props.cookies.set('showedContributions', true);
        }

    }

    componentDidMount() {
        // if there is no contribution yet, create the first one
        if (this.props.contributions.allIds.length === 0) {
            this.props.createContribution({
                selectAfterCreation: true,
                prefillStatements: true,
                researchField: this.props.selectedResearchField,
            });
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

    toggleEditLabelContribution = (contributionId, e) => {
        if (this.state.editing[contributionId]) {
            this.setState({ editing: { ...this.state.editing, [contributionId]: false } })
        } else {
            // enable editing and focus on the input
            this.setState({ editing: { ...this.state.editing, [contributionId]: true } }, () => { this.inputRefs[contributionId].focus(); })
        }
    };

    pasteAsPlainText = event => {
        event.preventDefault()
        const text = event.clipboardData.getData('text/plain')
        document.execCommand('insertHTML', false, text)
    }

    handleSelectContribution = (contributionId) => {
        const resourceId = this.props.contributions.byId[contributionId].resourceId;

        this.props.selectContribution({
            id: contributionId,
            resourceId
        });
    }

    handleChange = (contributionId, e) => {
        this.props.updateContributionLabel({
            label: e.target.value,
            contributionId: contributionId,
        });
    };

    requestCloseTour = () => {
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ isClosed: true });
        }
    };

    render() {
        let selectedResourceId = this.props.selectedContribution;

        return (
            <div>
                <h2 className="h4 mt-4 mb-5"><Tooltip message="Specify the research contributions that this paper makes. A paper can have multiple contributions and each contribution addresses at least one research problem">Specify research contributions</Tooltip></h2>

                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            <StyledContributionsList id="contributionsList">
                                {this.props.contributions.allIds.map((contribution, index) => {
                                    let contributionId = this.props.contributions.byId[contribution]['id'];

                                    return (
                                        <li className={contributionId === this.props.selectedContribution ? 'activeContribution' : ''} key={contributionId}>
                                            <span className={'selectContribution'} onClick={() => this.handleSelectContribution(contributionId)}>
                                                {/* TODO: add the contenteditable into a seperate component */}
                                                <StyledContentEditable
                                                    innerRef={(input) => { this.inputRefs[contribution] = input; }}
                                                    html={this.props.contributions.byId[contribution]['label']}
                                                    disabled={!this.state.editing[contribution]}
                                                    onChange={(e) => this.handleChange(contributionId, e)}
                                                    tagName="span"
                                                    onPaste={this.pasteAsPlainText}
                                                    onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                                    onBlur={(e) => this.toggleEditLabelContribution(contributionId)}
                                                    onFocus={(e) => setTimeout(() => { document.execCommand('selectAll', false, null) }, 0)} // Highlights the entire label when edit
                                                />
                                                {!this.state.editing[contribution] && (
                                                    <>
                                                        {this.props.contributions.allIds.length !== 1 && (
                                                            <span className={`deleteContribution float-right mr-1 ${contributionId !== this.props.selectedContribution && 'd-none'}`}>
                                                                <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                                                                    <Icon icon={faTrash} onClick={() => this.toggleDeleteContribution(contributionId)} />
                                                                </Tooltip>
                                                            </span>
                                                        )}
                                                        <span className={`deleteContribution float-right mr-1 ${contributionId !== this.props.selectedContribution && 'd-none'}`}>
                                                            <Tooltip message="Edit the contribution label" hideDefaultIcon={true}>
                                                                <Icon icon={faPen} onClick={(e) => this.toggleEditLabelContribution(contributionId, e)} />
                                                            </Tooltip>
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                        </li>
                                    )
                                })}

                                <li className={'addContribution text-primary'}>
                                    <span onClick={this.props.createContribution}>+ Add another contribution</span>
                                </li>
                            </StyledContributionsList>
                        </Col>

                        <CSSTransitionGroup
                            transitionName="fadeIn"
                            transitionEnterTimeout={500}
                            transitionLeave={false}
                            component="div"
                            className="col-9"
                        >
                            <AnimationContainer
                                key={selectedResourceId}
                            >
                                <Contribution id={selectedResourceId} />
                            </AnimationContainer>
                        </CSSTransitionGroup>
                    </Row>
                </Container>

                <hr className="mt-5 mb-3" />
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Finish</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
                <Tour
                    steps={[
                        {
                            selector: '#researchProblemFormControl',
                            content: 'Specify the research problem that this contribution addresses.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '#contributionsList',
                            content: ' You can enter multiple contributions, and you can specify a name for each contribution. It\'s just a handy label.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '.listGroupEnlarge',
                            content: 'Contribution data can be added here. This data is added in a property value structure.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={0}
                    getCurrentStep={curr => { this.props.updateTourCurrentStep(curr); }}
                />
            </div>
        );
    }
}

Contributions.propTypes = {
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.number.isRequired,
    publicationYear: PropTypes.number.isRequired,
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
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    updateTourCurrentStep: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourCurrentStep: PropTypes.number.isRequired,
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
        values: state.statementBrowser.values,
        isTourOpen: state.addPaper.isTourOpen,
        tourCurrentStep: state.addPaper.tourCurrentStep,
    }
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    createContribution: (data) => dispatch(createContribution(data)),
    deleteContribution: (id) => dispatch(deleteContribution(id)),
    selectContribution: (id) => dispatch(selectContribution(id)),
    updateContributionLabel: (data) => dispatch(updateContributionLabel(data)),
    saveAddPaper: (data) => dispatch(saveAddPaper(data)),
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
    openTour: () => dispatch(openTour()),
    closeTour: () => dispatch(closeTour()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(Contributions);