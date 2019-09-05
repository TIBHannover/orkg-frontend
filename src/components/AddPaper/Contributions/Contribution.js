import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
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

class Contribution extends Component {

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

    render() {
        return (
            <StyledContribution>
                <Form>
                    <FormGroup>
                        <Label>
                            <Tooltip message={<span>Specify the research problems that this contribution addresses. Normally, a research problem consists of very few words (around 2 or 3). <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(0)}>Learn more</span></span>}>Research problems</Tooltip>
                        </Label>
                        <ResearchProblemInput handler={this.handleResearchProblemsChange} value={this.props.researchProblems} />
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <Tooltip message={<span>Provide details about this contribution by making statements. Some suggestions are already displayed, you can use this when it is useful, or delete it when it is not. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(2)}>Learn more</span></span>}>Contribution data</Tooltip>
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
                    startAt={this.props.tourStartAt}
                    maskClassName="reactourMask"
                />
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