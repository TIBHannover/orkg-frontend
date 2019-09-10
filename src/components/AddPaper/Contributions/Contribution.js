import React, { Component } from 'react';
import { Form, FormGroup, Label, Modal, ModalHeader, ModalBody } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import ResearchProblemInput from './ResearchProblemInput';
import { StyledContribution } from './styled';
import StatementBrowser from '../../StatementBrowser/Statements';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { updateResearchProblems, openTour, closeTour, updateTourCurrentStep, } from '../../../actions/addPaper';
import { withCookies, Cookies } from 'react-cookie';
import { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import Tour from 'reactour';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

class Contribution extends Component {

    state = {
        showVideoDialog: false,
    }

    componentDidMount() {
        // check if a cookie of take a tour exist 
        if (this.props.cookies && this.props.cookies.get('taketour') === 'take' && !this.props.cookies.get('showedContributions')) {
            this.props.openTour();
            this.props.cookies.set('showedContributions', true, { path: '/', maxAge: 604800 });
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    disableBody = target => disableBodyScroll(target)
    enableBody = target => enableBodyScroll(target)

    requestCloseTour = () => {
        this.enableBody();
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ isClosed: true });
        }
    };

    handleResearchProblemsChange = (problemsArray) => {
        problemsArray = problemsArray ? problemsArray : [];
        this.props.updateResearchProblems({
            problemsArray,
            contributionId: this.props.id,
        });
    }

    handleLearnMore = (step) => {
        this.props.openTour(step);
    }

    toggleVideoDialog = () => {
        this.props.closeTour();
        this.setState(prevState => ({
            showVideoDialog: !prevState.showVideoDialog,
        }));
    }

    render() {
        return (
            <StyledContribution>
                <Form>
                    <FormGroup>
                        <Label>
                            <Tooltip message={<span>Specify the research problems that this contribution addresses. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(0)}>Learn more</span></span>}>Research problems</Tooltip>
                        </Label>
                        <ResearchProblemInput handler={this.handleResearchProblemsChange} value={this.props.researchProblems} />
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <Tooltip message={<span>Provide details about this contribution by making statements. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(2)}>Learn more</span></span>}>Contribution data</Tooltip>
                        </Label>

                        <StatementBrowser
                            enableEdit={true}
                            openExistingResourcesInDialog={true}
                        />
                    </FormGroup>
                </Form>
                <Tour
                    onAfterOpen={this.disableBody}
                    onBeforeClose={this.enableBody}
                    steps={[
                        {
                            selector: '#researchProblemFormControl',
                            content:
                                <span>
                                    Specify the research problem that this contribution addresses. Normally, a research problem consists of <strong>very few words</strong> (around 2 or 3).
                                    <br /><br />
                                    Examples of research problems:
                                    <ul>
                                        <li>Named entity recognition</li>
                                        <li>HCI performance evaluations</li>
                                        <li>Triple store benchmarking</li>
                                    </ul>
                                </span>,
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '#contributionsList',
                            content: <span>You can enter multiple contributions, and you can specify a name for each contribution. It's just a handy label. <br /><br />Some papers only have one research contribution, while others have multiple. If you are not sure about this, it is fine to just use one contribution.</span>,
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '.listGroupEnlarge',
                            content: <span>Entering contribution data is the most important part of adding a paper (this part takes around 10-20 minutes). In this section you enter the data relevant to your paper. The challenge here is to capture the most important aspects of your paper and to represent this here. <br /><br />The data is entered in a <strong>property and value </strong> structure. First you choose a property (e.g. method) and afterwards you add a value to this property (e.g. semi-structured interviews). <br /><br /><span className="btn btn-link p-0" onClick={this.toggleVideoDialog}>Open example video</span></span>,
                            style: { borderTop: '4px solid #E86161' },
                        },
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={this.props.tourStartAt}
                    maskClassName="reactourMask"
                />

                <Modal isOpen={this.state.showVideoDialog} toggle={this.toggleVideoDialog} size="lg">
                    <ModalHeader toggle={this.toggleVideoDialog}>How to add contribution data</ModalHeader>
                    <ModalBody>
                        <iframe width="100%" height="480" src="https://www.youtube.com/embed/BhI-gngCl0k?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="ORKG - How to add contribution data" />
                        <hr />
                        <a href="https://labs.tib.eu/orkg/paper/R1020" target="_blank" rel="noopener noreferrer">View paper that has been used in this example <Icon size="sm" icon={faExternalLinkAlt} /></a>
                    </ModalBody>
                </Modal>
            </StyledContribution>
        );
    }
}

Contribution.propTypes = {
    id: PropTypes.string.isRequired,
    updateResearchProblems: PropTypes.func.isRequired,
    researchProblems: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    updateTourCurrentStep: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourCurrentStep: PropTypes.number.isRequired,
    tourStartAt: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        researchProblems: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].researchProblems : [],
        isTourOpen: state.addPaper.isTourOpen,
        tourCurrentStep: state.addPaper.tourCurrentStep,
        tourStartAt: state.addPaper.tourStartAt,
    }
};

const mapDispatchToProps = dispatch => ({
    updateResearchProblems: (data) => dispatch(updateResearchProblems(data)),
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
    openTour: (data) => dispatch(openTour(data)),
    closeTour: () => dispatch(closeTour()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(Contribution);