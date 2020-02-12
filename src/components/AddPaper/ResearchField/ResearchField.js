import React, { Component } from 'react';
import { Button, Card, ListGroup, ListGroupItem, CardDeck } from 'reactstrap';
import { getStatementsBySubject } from '../../../network';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { updateResearchField, nextStep, previousStep, openTour, closeTour } from '../../../actions/addPaper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled, { withTheme } from 'styled-components';
import { withCookies, Cookies } from 'react-cookie';
import PropTypes from 'prop-types';
import Tour from 'reactour';
import Tooltip from '../../Utils/Tooltip';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const ListGroupItemTransition = styled(CSSTransition)`
    &.fadeIn-enter,
    &.fadeIn-appear {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active,
    &.fadeIn-appear.fadeIn-appear-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    transition: 0.3s background-color, 0.3s border-color;
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
    cursor: pointer;
    border-radius: 0 !important; //overwrite bootstrap border radius since a card is used to display the lists
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
            showError: false
        };

        // check if a cookie of take a tour exist
        if (this.props.cookies && this.props.cookies.get('taketour') === 'take' && !this.props.cookies.get('showedReaseachFiled')) {
            this.props.openTour();
            this.props.cookies.set('showedReaseachFiled', true, { path: process.env.PUBLIC_URL, maxAge: 604800 });
        }
    }

    componentDidMount() {
        // select the main field is none is selected yet (i.e. first time visiting this step)
        if (this.props.selectedResearchField === '') {
            this.getFields(process.env.REACT_APP_RESEARCH_FIELD_MAIN, 0);
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    disableBody = target => disableBodyScroll(target);
    enableBody = target => enableBodyScroll(target);

    handleNextClick = () => {
        // TODO validation: check if a research field is selected
        if (this.props.selectedResearchField === process.env.REACT_APP_RESEARCH_FIELD_MAIN) {
            this.setState({
                showError: true
            });

            return;
        }

        this.props.nextStep();
    };

    getFields(fieldId, level) {
        getStatementsBySubject({ id: fieldId }).then(res => {
            let researchFields = [];

            res.forEach(elm => {
                researchFields.push({
                    label: elm.object.label,
                    id: elm.object.id,
                    active: false
                });
            });

            // sort research fields alphabetically
            researchFields = researchFields.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

            const researchFieldsNew = [...this.props.researchFields];
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
        if (this.props.isTourOpen) {
            this.requestCloseTour();
        }
        this.getFields(fieldId, currentLevel + 1);
    }

    requestCloseTour = () => {
        this.enableBody();
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ isClosed: true });
        }
    };

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        let errorMessageClasses = 'text-danger mt-2 pl-2';
        errorMessageClasses += !this.state.showError ? ' d-none' : '';

        return (
            <div>
                <h2 className="h4 mt-4 mb-5">
                    <Tooltip
                        message={
                            <span>
                                Select the more appropriate research field for the paper.{' '}
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(0)}>
                                    Learn more
                                </span>
                            </span>
                        }
                    >
                        Select the research field
                    </Tooltip>
                </h2>

                <CardDeck>
                    {this.props.researchFields.length > 0 &&
                        this.props.researchFields.map((fields, level) => {
                            return fields.length > 0 ? (
                                <FieldSelector className="fieldSelector" key={level}>
                                    <ListGroup flush>
                                        <TransitionGroup exit={false}>
                                            {fields.map(field => (
                                                <ListGroupItemTransition key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                                    <ListGroupItemStyled active={field.active} onClick={() => this.handleFieldClick(field.id, level)}>
                                                        {field.label}
                                                    </ListGroupItemStyled>
                                                </ListGroupItemTransition>
                                            ))}
                                        </TransitionGroup>
                                    </ListGroup>
                                </FieldSelector>
                            ) : (
                                ''
                            );
                        })}
                </CardDeck>
                <p className={errorMessageClasses} style={{ borderLeft: '4px red solid' }}>
                    Please select the research field
                </p>

                <hr className="mt-5 mb-3" />
                {/*<strong>Selected research field</strong> <br />
                <span >{this.state.selectedResearchField}</span>*/}

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>
                    Next step
                </Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>
                    Previous step
                </Button>
                <Tour
                    onAfterOpen={this.disableBody}
                    onBeforeClose={this.enableBody}
                    disableInteraction={false}
                    steps={[
                        {
                            selector: '.fieldSelector',
                            content:
                                'Select a close research field to the paper from the list. The research field can be selected from a hierarchical structure of fields and their subfields.',
                            style: { borderTop: '4px solid #E86161' }
                        }
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={this.props.tourStartAt}
                    showButtons={false}
                    showNavigation={false}
                    maskClassName="reactourMask"
                />
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
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourStartAt: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
    selectedResearchField: state.addPaper.selectedResearchField,
    researchFields: state.addPaper.researchFields,
    isTourOpen: state.addPaper.isTourOpen,
    tourStartAt: state.addPaper.tourStartAt
});

const mapDispatchToProps = dispatch => ({
    updateResearchField: data => dispatch(updateResearchField(data)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    openTour: data => dispatch(openTour(data)),
    closeTour: () => dispatch(closeTour())
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme,
    withCookies
)(ResearchField);
