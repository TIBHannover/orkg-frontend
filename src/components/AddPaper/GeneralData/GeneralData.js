import React, { Component } from 'react';
import {
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    Button,
    ButtonGroup,
    FormFeedback,
    Table,
    Card,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { compose } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import AuthorsInput from '../../Utils/AuthorsInput';
import FormValidator from '../../Utils/FormValidator';
import { connect } from 'react-redux';
import { updateGeneralData, nextStep, openTour, closeTour } from '../../../actions/addPaper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { withCookies, Cookies } from 'react-cookie';
import styled, { withTheme } from 'styled-components';
import moment from 'moment';
import PropTypes from 'prop-types';
import Cite from 'citation-js';
import Tour from 'reactour';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const Container = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }

    &.fadeIn-exit.fadeIn-exit-active {
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

    &.slideDown-exit.slideDown-exit-active {
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
                message: "Please enter the DOI, Bibtex or select 'Manually' to enter the paper details yourself"
            }
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
            errors: null
        };

        // Hide the tour if a cookie 'taketour' exist
        if (this.props.cookies && this.props.cookies.get('taketour')) {
            this.state.isFirstVisit = false;
            this.props.closeTour();
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    disableBody = target => disableBodyScroll();
    enableBody = target => enableBodyScroll();

    //moved callback after stateUpdate into a function
    updateGlobalStateForVisualization = () => {
        this.props.updateGeneralData({
            title: this.state.paperTitle,
            authors: this.state.paperAuthors,
            publicationMonth: this.state.paperPublicationMonth,
            publicationYear: this.state.paperPublicationYear,
            doi: this.state.doi,
            entry: this.state.entry,
            showLookupTable: true
        });
    };

    //TODO this logic should be placed inside an action creator
    handleLookupClick = async () => {
        if (this.props.isTourOpen) {
            this.requestCloseTour();
        }
        this.setState({
            entry: this.state.entry.trim(),
            showLookupTable: false
        });

        this.lookup.current.blur();

        const validation = this.validator.validate({ entry: this.state.entry.trim() });
        this.setState({ validation });

        if (!validation.isValid) {
            return;
        }

        this.setState({
            isFetching: true
        });

        let entry;
        if (this.state.entry.trim().startsWith('http')) {
            entry = this.state.entry.trim().substring(this.state.entry.trim().indexOf('10.'));
        } else {
            entry = this.state.entry.trim();
        }

        await Cite.async(entry)
            .catch(e => {
                let validation;
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        validation = this.validator.setError({
                            field: 'entry',
                            message:
                                "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manually' to enter the paper details yourself"
                        });
                        break;
                    case 'Server responded with status code 404':
                        validation = this.validator.setError({
                            field: 'entry',
                            message: 'No paper has been found'
                        });
                        break;
                    default:
                        validation = this.validator.setError({
                            field: 'entry',
                            message: 'An error occurred, reload the page and try again'
                        });
                        break;
                }
                this.setState({
                    isFetching: false,
                    validation,
                    errors: null
                });
                return null;
            })
            .then(paper => {
                if (paper) {
                    let paperTitle = '',
                        paperAuthors = [],
                        paperPublicationMonth = '',
                        paperPublicationYear = '',
                        doi = '';
                    try {
                        paperTitle = paper.data[0].title;
                        if (paper.data[0].subtitle && paper.data[0].subtitle.length > 0) {
                            // include the subtitle
                            paperTitle = `${paperTitle}: ${paper.data[0].subtitle[0]}`;
                        }
                        if (paper.data[0].author) {
                            paperAuthors = paper.data[0].author.map((author, index) => {
                                let fullname = [author.given, author.family].join(' ').trim();
                                if (!fullname) {
                                    fullname = author.literal ? author.literal : '';
                                }
                                const newAuthor = {
                                    label: fullname,
                                    id: fullname,
                                    orcid: author.ORCID ? author.ORCID : ''
                                };
                                return newAuthor;
                            });
                        }
                        if (paper.data[0].issued['date-parts'][0][1]) {
                            paperPublicationMonth = paper.data[0].issued['date-parts'][0][1];
                        }
                        if (paper.data[0].issued['date-parts'][0][0]) {
                            paperPublicationYear = paper.data[0].issued['date-parts'][0][0];
                        }
                        doi = paper.data[0].DOI ? paper.data[0].DOI : '';
                    } catch (e) {
                        console.log('Error setting paper data: ', e);
                    }

                    this.setState(
                        {
                            isFetching: false,
                            showLookupTable: true,
                            paperTitle,
                            paperAuthors,
                            paperPublicationMonth,
                            paperPublicationYear,
                            doi: doi,
                            errors: null
                        },
                        this.updateGlobalStateForVisualization
                    );
                }
            });
    };

    handleInputChange = e => {
        if (this.props.isTourOpen) {
            this.requestCloseTour();
        }
        this.setState(
            {
                [e.target.name]: e.target.value
            },
            this.updateGlobalStateForVisualization
        );
    };

    handleMonthChange = e => {
        this.setState(
            {
                [e.target.name]: parseInt(e.target.value)
            },
            this.updateGlobalStateForVisualization
        );
    };

    handleDataEntryClick = selection => {
        this.setState(
            {
                dataEntry: selection
            },
            this.updateGlobalStateForVisualization
        );
    };

    handleAuthorsChange = tags => {
        tags = tags ? tags : [];
        this.setState(
            {
                paperAuthors: tags
            },
            this.updateGlobalStateForVisualization
        );
    };

    handleSkipTour = () => {
        this.props.cookies.set('taketour', 'skip', { path: process.env.PUBLIC_URL, maxAge: 604800 });
        this.toggle('isFirstVisit');
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.props.cookies.set('taketourClosed', true);
            this.setState({ showHelpButton: true }, () => this.props.openTour());
        }
    };

    takeTour = () => {
        this.props.cookies.set('taketour', 'take', { path: process.env.PUBLIC_URL, maxAge: 604800 });
        this.toggle('isFirstVisit');
        this.props.openTour();
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    requestCloseTour = () => {
        this.enableBody();
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ showHelpButton: true });
        }
    };

    handleNextClick = () => {
        // TODO do some sort of validation, before proceeding to the next step
        const errors = [];

        const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, entry, showLookupTable } = this.state;

        if (!paperTitle || paperTitle.trim().length < 1) {
            errors.push('Please enter the title of your paper or click on "Lookup" if you entered the doi.');
        }

        if (errors.length === 0) {
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
        } else {
            this.setState({ errors: errors });
        }
    };

    submitHandler = e => {
        e.preventDefault();
    };

    handleLearnMore = step => {
        this.props.openTour(step);
    };

    render() {
        return (
            <div>
                <h2 className="h4 mt-4">General paper data</h2>

                <Modal isOpen={this.state.isFirstVisit} toggle={() => this.toggle('isFirstVisit')}>
                    <ModalHeader toggle={() => this.toggle('isFirstVisit')}>A very warm welcome</ModalHeader>
                    <ModalBody>
                        <p>Great to have you on board! </p>
                        <p>
                            We would love to help you to get started. We've added a guided tour that covers all necessary steps to add your paper to
                            the Open Research Knowledge Graph.
                        </p>
                        <p>Can we show you around?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.handleSkipTour}>
                            Skip
                        </Button>
                        <Button color="primary" onClick={this.takeTour}>
                            Show me how
                        </Button>{' '}
                    </ModalFooter>
                </Modal>

                <ButtonGroup id="entryOptions" className="float-right" style={{ marginTop: '-30px' }}>
                    <Button size="sm" color={this.state.dataEntry === 'doi' ? 'primary' : 'light'} onClick={() => this.handleDataEntryClick('doi')}>
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

                <TransitionGroup exit={false}>
                    {(() => {
                        switch (this.state.dataEntry) {
                            case 'doi':
                                return (
                                    <Container key={1} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                        <div>
                                            <Form className="mt-4" onSubmit={this.submitHandler}>
                                                <FormGroup>
                                                    <Label for="paperDoi">
                                                        <Tooltip
                                                            message={
                                                                <span>
                                                                    Automatically fetch the details of your paper by providing a DOI or a BibTeX
                                                                    entry.{' '}
                                                                    <span
                                                                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                                                        onClick={() => this.handleLearnMore(0)}
                                                                    >
                                                                        Learn more
                                                                    </span>
                                                                </span>
                                                            }
                                                        >
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
                                                            onKeyPress={target => {
                                                                target.charCode === 13 && this.handleLookupClick();
                                                            }}
                                                        />
                                                        <FormFeedback className="order-1">{this.state.validation.entry.message}</FormFeedback>{' '}
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
                                                                {!this.state.isFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                                            </Button>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </FormGroup>
                                            </Form>

                                            <TransitionGroup>
                                                {this.state.showLookupTable ? (
                                                    <Container key={1} classNames="slideDown" timeout={{ enter: 500, exit: 300 }}>
                                                        <div className="mt-5">
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
                                                        </div>
                                                    </Container>
                                                ) : (
                                                    ''
                                                )}
                                            </TransitionGroup>
                                        </div>
                                    </Container>
                                );
                            default:
                                //Manually
                                return (
                                    <Container key={2} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
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
                                                        <AuthorsInput handler={this.handleAuthorsChange} value={this.state.paperAuthors} />
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
                                                                    <option value="" key="">
                                                                        Month
                                                                    </option>
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
                                                                    <option value="" key="">
                                                                        Year
                                                                    </option>
                                                                    {range(1900, moment().year())
                                                                        .reverse()
                                                                        .map(year => (
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
                </TransitionGroup>
                <hr className="mt-5 mb-3" />
                {this.state.errors && this.state.errors.length > 0 && (
                    <ul className="float-left mb-4 text-danger">
                        {this.state.errors.map((e, index) => {
                            return <li key={index}>{e}</li>;
                        })}
                    </ul>
                )}
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick} data-test="nextStep">
                    Next step
                </Button>
                {!this.state.showHelpButton && (
                    <Tour
                        onAfterOpen={this.disableBody}
                        onBeforeClose={this.enableBody}
                        steps={[
                            ...(this.state.dataEntry === 'doi'
                                ? [
                                      {
                                          selector: '#doiInputGroup',
                                          content:
                                              'Start by entering the DOI or the BibTeX of the paper you want to add. Then, click on "Lookup" to fetch paper meta-data automatically.',
                                          style: { borderTop: '4px solid #E86161' },
                                          action: node => (node ? node.focus() : null)
                                      }
                                  ]
                                : []),
                            {
                                selector: '#entryOptions',
                                content:
                                    'In case you don\'t have the DOI, you can enter the general paper data manually. Do this by pressing the "Manually" button on the right.',
                                style: { borderTop: '4px solid #E86161' }
                            }
                        ]}
                        showNumber={false}
                        accentColor={this.props.theme.orkgPrimaryColor}
                        rounded={10}
                        onRequestClose={this.requestCloseTour}
                        isOpen={this.props.isTourOpen}
                        startAt={this.props.tourStartAt}
                        maskClassName="reactourMask"
                    />
                )}
                {this.state.showHelpButton && (
                    <Tour
                        disableInteraction={false}
                        onAfterOpen={this.disableBody}
                        onBeforeClose={this.enableBody}
                        steps={[
                            {
                                selector: '#helpIcon',
                                content: 'If you want to start the tour again at a later point, you can do so from this button.',
                                style: { borderTop: '4px solid #E86161' }
                            }
                        ]}
                        showNumber={false}
                        accentColor={this.props.theme.orkgPrimaryColor}
                        rounded={10}
                        onRequestClose={() => {
                            this.enableBody();
                            this.props.closeTour();
                            this.setState({ showHelpButton: false });
                        }}
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
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    showLookupTable: PropTypes.bool.isRequired,
    updateGeneralData: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourStartAt: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
    entry: state.addPaper.entry,
    doi: state.addPaper.doi,
    title: state.addPaper.title,
    authors: state.addPaper.authors,
    showLookupTable: state.addPaper.showLookupTable,
    publicationMonth: state.addPaper.publicationMonth,
    publicationYear: state.addPaper.publicationYear,
    isTourOpen: state.addPaper.isTourOpen,
    tourStartAt: state.addPaper.tourStartAt
});

const mapDispatchToProps = dispatch => ({
    updateGeneralData: data => dispatch(updateGeneralData(data)),
    nextStep: () => dispatch(nextStep()),
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
)(GeneralData);
