import React, { Component } from 'react';
import {
    Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, Modal,
    ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { compose } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import AuthorsInput from '../../Utils/AuthorsInput';
import FormValidator from '../../Utils/FormValidator';
import { connect } from 'react-redux';
import { updateGeneralData, nextStep, openTour, closeTour, updateTourCurrentStep } from '../../../actions/addPaper';
import { CSSTransitionGroup } from 'react-transition-group';
import { withCookies, Cookies } from 'react-cookie';
import styled, { withTheme } from 'styled-components';
import moment from 'moment';
import PropTypes from 'prop-types';
import Cite from 'citation-js';
import Tour from 'reactour';

const Container = styled.div`
  &.fadeIn-enter {
    opacity: 0;
  }

  &.fadeIn-enter.fadeIn-enter-active {
    opacity: 1;
    transition: 1s opacity;
  }

  &.fadeIn-leave.fadeIn-leave-active {
    display: none;
  }

  &.slideDown-enter {
    max-height: 0;
    overflow: hidden;
  }

  &.slideDown-enter.slideDown-enter-active {
    max-height: 1000px;
    transition: 1s;
  }

  &.slideDown-leave.slideDown-leave-active {
    display: none;
  }
`;

class GeneralData extends Component {
    constructor(props) {
        super(props);

        this.validator = new FormValidator([
            {
                field: 'entry',
                method: 'isEmpty',
                validWhen: false,
                message:
                    'Please enter the DOI, Bibtex or select \'Manually\' to enter the paper details yourself',
            },
        ]);

        this.lookup = React.createRef();

        this.state = {
            isFirstVisit: true,
            showHelpButton: false,
            entry: this.props.entry,
            doi: this.props.doi,
            isFetching: false,
            dataEntry: 'doi',
            showLookupTable: this.props.showLookupTable,
            paperTitle: this.props.title,
            paperAuthors: this.props.authors,
            paperPublicationMonth: this.props.publicationMonth,
            paperPublicationYear: this.props.publicationYear,
            validation: this.validator.valid(),
        };

        // Hide the tour if a cookie 'taketour' exist 
        if (this.props.cookies.get('taketour')) {
            this.state.isFirstVisit = false;
            this.props.closeTour();
        }
    }

    //TODO this logic should be placed inside an action creator
    handleLookupClick = async () => {
        this.setState({
            entry: this.state.entry.trim(),
            showLookupTable: false,
        });

        this.lookup.current.blur();

        let validation = this.validator.validate({ entry: this.state.entry });
        this.setState({ validation });

        if (!validation.isValid) {
            return;
        }

        this.setState({
            isFetching: true,
        });

        await Cite.async(this.state.entry)
            .catch((e) => {
                let validation;
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        validation = this.validator.setError({
                            field: 'entry',
                            message:
                                'This format is not supported or recognized. Please enter a valid DOI or Bibtex or select \'Manually\' to enter the paper details yourself',
                        });
                        break;
                    case 'Server responded with status code 404':
                        validation = this.validator.setError({
                            field: 'entry',
                            message: 'No paper has been found',
                        });
                        break;
                    default:
                        validation = this.validator.setError({
                            field: 'entry',
                            message: 'An error occurred, reload the page and try again',
                        });
                        break;
                }
                this.setState({
                    isFetching: false,
                    paperTitle: this.state.entry, // Probably the user entered a paper title
                    validation,
                });
                return null;
            })
            .then((paper) => {
                if (paper) {
                    let paperTitle = '',
                        paperAuthors = [],
                        paperPublicationMonth = null,
                        paperPublicationYear = null,
                        doi = '';
                    try {
                        paperTitle = paper.data[0].title;
                        paperAuthors = paper.data[0].author.map((author, index) => {
                            let fullname = [author.given, author.family].join(' ').trim();
                            if (!fullname) {
                                fullname = author.literal ? author.literal : '';
                            }
                            const newAuthor = {
                                label: fullname,
                                id: fullname,
                            };
                            return newAuthor;
                        });
                        paperPublicationMonth = paper.data[0].issued['date-parts'][0][1];
                        paperPublicationYear = paper.data[0].issued['date-parts'][0][0];
                        doi = paper.data[0].DOI;
                    } catch (e) {
                        console.log('Error setting paper data: ', e);
                    }

                    this.setState({
                        isFetching: false,
                        showLookupTable: true,
                        paperTitle,
                        paperAuthors,
                        paperPublicationMonth,
                        paperPublicationYear,
                        doi: doi,
                    });
                }
            });
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleMonthChange = (e) => {
        this.setState({
            [e.target.name]: parseInt(e.target.value),
        });
    };

    handleDataEntryClick = (selection) => {
        this.setState({
            dataEntry: selection,
        });
    };

    handleAuthorsChange = (tags) => {
        tags = tags ? tags : [];
        this.setState({
            paperAuthors: tags,
        });
    };

    handleSkipTour = () => {
        this.props.cookies.set('taketour', 'skip');
        this.toggle('isFirstVisit');
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.props.cookies.set('taketourClosed', true)
            this.setState({ showHelpButton: true }, () => this.props.openTour());
        }
    };

    takeTour = () => {
        this.props.cookies.set('taketour', 'take')
        this.toggle('isFirstVisit')
        this.props.openTour();
    };

    toggle = (type) => {
        this.setState((prevState) => ({
            [type]: !prevState[type],
        }));
    };

    requestCloseTour = () => {
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ showHelpButton: true });
        }
    };

    handleNextClick = () => {
        // TODO do some sort of validation, before proceeding to the next step
        let {
            paperTitle,
            paperAuthors,
            paperPublicationMonth,
            paperPublicationYear,
            doi,
            entry,
            showLookupTable,
        } = this.state;

        this.props.updateGeneralData({
            title: paperTitle,
            authors: paperAuthors,
            publicationMonth: paperPublicationMonth,
            publicationYear: paperPublicationYear,
            doi: doi,
            entry: entry,
            showLookupTable: showLookupTable
        });

        this.props.nextStep();
    };

    submitHandler = (e) => {
        e.preventDefault();
    };

    handleLearnMore = (step) => {
        this.props.openTour(step);
    }

    render() {

        return (
            <div>
                <h2 className="h4 mt-4">General paper data</h2>

                <Modal isOpen={this.state.isFirstVisit} toggle={() => this.toggle('isFirstVisit')}>
                    <ModalHeader toggle={() => this.toggle('isFirstVisit')}>A very warm welcome</ModalHeader>
                    <ModalBody>
                        <p>Great to have you on board! </p>
                        <p>We would love to help you to get started. We've added a guided tour that covers all necessary steps to add your paper to the Open Research Knowledge Graph. You can stop the tour at any time by clicking the 'Skip'-button.</p>
                        <p>Can we show you around?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.handleSkipTour}>Skip</Button>
                        <Button color="primary" onClick={this.takeTour}>Start a tour</Button>{' '}
                    </ModalFooter>
                </Modal>

                <ButtonGroup id="entryOptions" className="float-right" style={{ marginTop: '-30px' }}>
                    <Button
                        size="sm"
                        color={this.state.dataEntry === 'doi' ? 'primary' : 'light'}
                        onClick={() => this.handleDataEntryClick('doi')}
                    >
                        By DOI
                    </Button>
                    <Button
                        size="sm"
                        color={this.state.dataEntry === 'manually' ? 'primary' : 'light'}
                        onClick={() => this.handleDataEntryClick('manually')}
                    >
                        Manually
                    </Button>
                </ButtonGroup>

                <CSSTransitionGroup
                    transitionName="fadeIn"
                    transitionEnterTimeout={500}
                    transitionLeave={false}
                >
                    {(() => {
                        switch (this.state.dataEntry) {
                            case 'doi':
                                return (
                                    <Container key={1}>
                                        <Form className="mt-4" onSubmit={this.submitHandler}>
                                            <FormGroup>
                                                <Label for="paperDoi">
                                                    <Tooltip message={<span>Automatically fetch the details of your paper by providing a DOI or a BibTeX entry. <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => this.handleLearnMore(0)}>Learn more</span></span>}>
                                                        Paper DOI or BibTeX
                                                    </Tooltip>
                                                </Label>
                                                <InputGroup id="doiInputGroup">
                                                    <Input
                                                        type="text"
                                                        name="entry"
                                                        id="paperDoi"
                                                        value={this.state.entry}
                                                        onChange={this.handleInputChange}
                                                        invalid={this.state.validation.entry.isInvalid}
                                                        onKeyPress={(target) => { target.charCode === 13 && this.handleLookupClick(); }}
                                                    />
                                                    <FormFeedback className="order-1">
                                                        {this.state.validation.entry.message}
                                                    </FormFeedback>{' '}
                                                    {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                                                    <InputGroupAddon addonType="append">
                                                        <Button
                                                            outline
                                                            color="primary"
                                                            innerRef={this.lookup}
                                                            style={{ minWidth: 130 }}
                                                            onClick={this.handleLookupClick}
                                                            disabled={this.state.isFetching}
                                                            data-test="lookupDoi"
                                                        >
                                                            {!this.state.isFetching ? (
                                                                'Lookup'
                                                            ) : (
                                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                                )}
                                                        </Button>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </FormGroup>
                                        </Form>

                                        <CSSTransitionGroup
                                            transitionName="slideDown"
                                            transitionEnterTimeout={500}
                                            transitionLeaveTimeout={300}
                                        >
                                            {this.state.showLookupTable ? (
                                                <Container key={1} className="mt-5">
                                                    <h3 className="h4 mb-3">
                                                        Lookup result
                                                  <Button
                                                            className={'pull-right ml-1'}
                                                            outline
                                                            size="sm"
                                                            onClick={() => this.handleDataEntryClick('manually')}
                                                        >
                                                            Edit
                                                  </Button>
                                                    </h3>
                                                    <Card body>
                                                        <Table className="mb-0">
                                                            <tbody>
                                                                <tr className="table-borderless">
                                                                    <td>
                                                                        <strong>Paper title:</strong> {this.state.paperTitle}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Authors:</strong>{' '}
                                                                        {this.state.paperAuthors.map((author, index) => (
                                                                            <span key={index}>
                                                                                {this.state.paperAuthors.length > index + 1
                                                                                    ? author.label + ', '
                                                                                    : author.label}
                                                                            </span>
                                                                        ))}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Publication date:</strong>{' '}
                                                                        {this.state.paperPublicationMonth
                                                                            ? moment(this.state.paperPublicationMonth, 'M').format('MMMM')
                                                                            : ''}{' '}
                                                                        {this.state.paperPublicationYear}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </Card>
                                                </Container>
                                            ) : (
                                                    ''
                                                )}
                                        </CSSTransitionGroup>
                                    </Container>
                                );
                            default:
                                //Manually
                                return (
                                    <Container key={2}>
                                        <Form className="mt-4" onSubmit={this.submitHandler}>
                                            <FormGroup>
                                                <Label for="paperTitle">
                                                    <Tooltip message="The main title of the paper">Paper title</Tooltip>
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="paperTitle"
                                                    id="paperTitle"
                                                    value={this.state.paperTitle}
                                                    onChange={this.handleInputChange}
                                                />
                                                <FormFeedback />
                                            </FormGroup>
                                            <Row form>
                                                <Col md={6} className="pr-3">
                                                    <FormGroup>
                                                        <Label for="paperAuthors">
                                                            <Tooltip message="The author or authors of the paper. Enter both the first and last name">
                                                                Paper authors
                                                            </Tooltip>
                                                        </Label>
                                                        <AuthorsInput
                                                            handler={this.handleAuthorsChange}
                                                            value={this.state.paperAuthors}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6} className="pl-3">
                                                    <FormGroup>
                                                        <Label for="paperCreationDate">
                                                            <Tooltip message="The publication date of the paper, in the form of month and year">
                                                                Publication date
                                                            </Tooltip>
                                                        </Label>
                                                        <Row form>
                                                            <Col md={6}>
                                                                <Input
                                                                    type="select"
                                                                    name="paperPublicationMonth"
                                                                    aria-label="Select publication month"
                                                                    value={this.state.paperPublicationMonth}
                                                                    onChange={this.handleMonthChange}
                                                                >
                                                                    {moment.months().map((el, index) => {
                                                                        return (
                                                                            <option value={index + 1} key={index + 1}>
                                                                                {el}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </Input>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Input
                                                                    type="select"
                                                                    name="paperPublicationYear"
                                                                    aria-label="Select publication year"
                                                                    value={this.state.paperPublicationYear}
                                                                    onChange={this.handleInputChange}
                                                                >
                                                                    {range(1900, moment().year())
                                                                        .reverse()
                                                                        .map((year) => (
                                                                            <option key={year}>{year}</option>
                                                                        ))}
                                                                </Input>
                                                            </Col>
                                                        </Row>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Container>
                                );
                        }
                    })()}
                </CSSTransitionGroup>
                <hr className="mt-5 mb-3" />

                <Button
                    color="primary"
                    className="float-right mb-4"
                    onClick={this.handleNextClick}
                    data-test="nextStep"
                >
                    Next step
                </Button>
                {!this.state.showHelpButton && (
                    <Tour
                        steps={[
                            {
                                selector: '#doiInputGroup',
                                content: 'Start by entering the DOI or the BibTeX of the paper you want to add. Then, click on "Lookup" to fetch paper meta-data automatically.',
                                style: { borderTop: '4px solid #E86161' },
                            },
                            {
                                selector: '#entryOptions',
                                content: 'In case you don\'t have the DOI, you can enter the general paper data manually. Do this by pressing the "Manually" button on the right.',
                                style: { borderTop: '4px solid #E86161' },
                            }
                        ]}
                        showNumber={false}
                        accentColor={this.props.theme.orkgPrimaryColor}
                        rounded={10}
                        onRequestClose={this.requestCloseTour}
                        isOpen={this.props.isTourOpen}
                        startAt={0}
                        getCurrentStep={curr => this.props.updateTourCurrentStep(curr)}
                        maskClassName="reactourMask"
                    />
                )}
                {this.state.showHelpButton && (
                    <Tour
                        steps={[
                            {
                                selector: '#helpIcon',
                                content: 'If you want to start the tour again at a later point, you can do so from this button.',
                                style: { borderTop: '4px solid #E86161' },
                            },
                        ]}
                        showNumber={false}
                        accentColor={this.props.theme.orkgPrimaryColor}
                        rounded={10}
                        onRequestClose={() => { this.props.closeTour(); this.setState({ showHelpButton: false }); }}
                        isOpen={this.state.showHelpButton}
                        startAt={0}
                        showButtons={false}
                        showNavigation={false}
                        maskClassName="reactourMask"
                    />
                )}


            </div>
        );
    }
}

GeneralData.propTypes = {
    entry: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.number.isRequired,
    publicationYear: PropTypes.number.isRequired,
    showLookupTable: PropTypes.bool.isRequired,
    updateGeneralData: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    updateTourCurrentStep: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
    entry: state.addPaper.entry,
    doi: state.addPaper.doi,
    title: state.addPaper.title,
    authors: state.addPaper.authors,
    showLookupTable: state.addPaper.showLookupTable,
    publicationMonth: state.addPaper.publicationMonth,
    publicationYear: state.addPaper.publicationYear,
    isTourOpen: state.addPaper.isTourOpen,
    tourCurrentStep: state.addPaper.tourCurrentStep,
});

const mapDispatchToProps = (dispatch) => ({
    updateGeneralData: (data) => dispatch(updateGeneralData(data)),
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
    nextStep: () => dispatch(nextStep()),
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
)(GeneralData);
