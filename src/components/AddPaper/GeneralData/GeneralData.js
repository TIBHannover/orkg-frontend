import { useState, useEffect, useRef, useContext } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { range } from 'utils';
import Tooltip from 'components/Utils/Tooltip';
import AuthorsInput from 'components/Utils/AuthorsInput';
import Joi from 'joi';
import { useSelector, useDispatch } from 'react-redux';
import { updateGeneralData, nextStep, openTour, closeTour } from 'actions/addPaper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useCookies } from 'react-cookie';
import styled, { ThemeContext } from 'styled-components';
import moment from 'moment';
import Cite from 'citation-js';
import Tour from 'reactour';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import { getPaperData } from 'utils';
import { getStatementsBySubject } from 'services/backend/statements';
import { getPaperByDOI } from 'services/backend/misc';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import ExistingDoiModal from './ExistingDoiModal';
import { parseCiteResult } from 'utils';
import env from '@beam-australia/react-env';

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

const GeneralData = () => {
    const { entry, doi, title, publishedIn, url, authors, showLookupTable, publicationMonth, publicationYear, isTourOpen, tourStartAt } = useSelector(
        state => state.addPaper
    );
    const dispatch = useDispatch();
    const refLookup = useRef(null);
    const theme = useContext(ThemeContext);
    const location = useLocation();
    const [cookies, setCookie] = useCookies(['takeTourClosed', 'takeTour']);
    // Hide the tour if a cookie 'takeTour' exist
    const [isFirstVisit, setIsFirstVisit] = useState(!!!(cookies && cookies.takeTour));
    const [showHelpButton, setShowHelpButton] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [dataEntry, setDataEntry] = useState('doi');
    const [validation, setValidation] = useState(null);
    const [errors, setErrors] = useState(null);
    const [existingPaper, setExistingPaper] = useState(null);

    const disableBody = target =>
        disableBodyScroll(target, {
            reserveScrollBarGap: true
        });
    const enableBody = target => enableBodyScroll(target);

    useEffect(() => {
        const entryParam = queryString.parse(location.search).entry;
        if (entryParam && !entry) {
            dispatch(updateGeneralData({ entry: entryParam }));
            handleLookupClick();
        }

        return () => {
            clearAllBodyScrollLocks();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //TODO this logic should be placed inside an action creator
    const handleLookupClick = async () => {
        if (isTourOpen) {
            requestCloseTour();
        }
        dispatch(updateGeneralData({ showLookupTable: false }));

        refLookup.current.blur();

        const { error } = Joi.string()
            .required()
            .messages({
                'string.empty': `Please enter the DOI, Bibtex or select 'Manually' to enter the paper details yourself`
            })
            .label('Paper DOI or BibTeX')
            .validate(entry);
        if (error) {
            setValidation(error.message);
            return;
        }

        setIsFetching(true);
        setValidation(null);

        let entryParsed;
        if (entry.startsWith('http')) {
            entryParsed = entry.trim().substring(entry.trim().indexOf('10.'));
        } else {
            entryParsed = entry.trim();
        }

        // If the entry is a DOI check if it exists in the database
        if (entryParsed.includes('10.') && entryParsed.startsWith('10.')) {
            getPaperByDOI(entryParsed)
                .then(result => {
                    getStatementsBySubject({ id: result.id }).then(paperStatements => {
                        setExistingPaper({ ...getPaperData(result, paperStatements), title: result.title });
                    });
                })
                .catch(() => {
                    setExistingPaper(null);
                });
        }

        await Cite.async(entryParsed)
            .catch(e => {
                let validationMessage;
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        validationMessage =
                            "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manually' to enter the paper details yourself";
                        break;
                    case 'Server responded with status code 404':
                        validationMessage = 'No paper has been found';
                        break;
                    default:
                        validationMessage = 'An error occurred, reload the page and try again';
                        break;
                }

                setValidation(validationMessage);
                setErrors(null);
                return null;
            })
            .then(paper => {
                if (paper) {
                    const parseResult = parseCiteResult(paper);
                    setIsFetching(false);
                    setErrors(null);
                    dispatch(
                        updateGeneralData({
                            showLookupTable: true,
                            title: parseResult.paperTitle,
                            authors: parseResult.paperAuthors,
                            publicationMonth: parseResult.paperPublicationMonth,
                            publicationYear: parseResult.paperPublicationYear,
                            doi: parseResult.doi,
                            publishedIn: parseResult.publishedIn
                        })
                    );
                }
            });
    };

    const handleInputChange = e => {
        if (isTourOpen) {
            requestCloseTour();
        }
        dispatch(
            updateGeneralData({
                [e.target.name]: e.target.value
            })
        );
    };

    const handleMonthChange = e => {
        dispatch(
            updateGeneralData({
                [e.target.name]: parseInt(e.target.value)
            })
        );
    };

    const handleAuthorsChange = tags => {
        tags = tags ? tags : [];
        dispatch(
            updateGeneralData({
                authors: tags
            })
        );
    };

    const handleSkipTour = () => {
        setCookie('takeTour', 'skip', { path: env('PUBLIC_URL'), maxAge: 604800 });
        setIsFirstVisit(false);
        if (cookies && cookies.takeTourClosed) {
            dispatch(closeTour());
        } else {
            setCookie('takeTourClosed', true);
            setShowHelpButton(true);
        }
    };

    const takeTour = () => {
        setCookie('takeTour', 'take', { path: env('PUBLIC_URL'), maxAge: 604800 });
        setIsFirstVisit(v => !v);
        dispatch(openTour());
    };

    const requestCloseTour = () => {
        dispatch(closeTour());
        if (cookies && !cookies.takeTourClosed) {
            setShowHelpButton(true);
        }
    };

    const handleNextClick = () => {
        // TODO do some sort of validation, before proceeding to the next step
        const errors = [];

        if (!title || title.trim().length < 1) {
            errors.push('Please enter the title of your paper or click on "Lookup" if you entered the doi.');
        }

        if (errors.length === 0) {
            dispatch(
                updateGeneralData({
                    title,
                    authors,
                    publicationMonth,
                    publicationYear,
                    doi,
                    entry,
                    showLookupTable,
                    publishedIn,
                    url
                })
            );
            dispatch(nextStep());
        } else {
            setErrors(errors);
        }
    };

    const submitHandler = e => {
        e.preventDefault();
    };

    const handleLearnMore = step => {
        dispatch(openTour(step));
    };

    return (
        <div>
            <div className="row mt-4">
                <div className="col-md-8">
                    <h2 className="h4">General paper data</h2>
                </div>
                <div className="col-md-4 mb-2" style={{ textAlign: 'right' }}>
                    <ButtonGroup id="entryOptions">
                        <Button size="sm" color={dataEntry === 'doi' ? 'primary' : 'light'} onClick={() => setDataEntry('doi')}>
                            By DOI
                        </Button>
                        <Button size="sm" color={dataEntry === 'manually' ? 'primary' : 'light'} onClick={() => setDataEntry('manually')}>
                            Manually
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            <Modal isOpen={isFirstVisit} toggle={() => setIsFirstVisit(!isFirstVisit)}>
                <ModalHeader toggle={() => setIsFirstVisit(!isFirstVisit)}>A very warm welcome</ModalHeader>
                <ModalBody>
                    <p>Great to have you on board! </p>
                    <p>
                        We would love to help you to get started. We've added a guided tour that covers all necessary steps to add your paper to the
                        Open Research Knowledge Graph.
                    </p>
                    <p>Can we show you around?</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={handleSkipTour}>
                        Skip
                    </Button>
                    <Button color="primary" onClick={takeTour}>
                        Show me how
                    </Button>
                </ModalFooter>
            </Modal>

            <TransitionGroup exit={false}>
                {dataEntry === 'doi' && (
                    <Container key={1} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                        <div>
                            <Form className="mt-4" onSubmit={submitHandler}>
                                <FormGroup>
                                    <Label for="paperDoi">
                                        <Tooltip
                                            message={
                                                <div>
                                                    Automatically fetch the details of your paper by providing a DOI or a BibTeX entry.
                                                    <div
                                                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                                        onClick={() => handleLearnMore(0)}
                                                        onKeyDown={e => {
                                                            if (e.keyCode === 13) {
                                                                handleLearnMore(0);
                                                            }
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        Learn more
                                                    </div>
                                                </div>
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
                                            value={entry}
                                            onChange={handleInputChange}
                                            invalid={!!validation}
                                            onKeyPress={target => {
                                                target.charCode === 13 && handleLookupClick();
                                            }}
                                        />
                                        <FormFeedback className="order-1">{validation}</FormFeedback>
                                        {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                                        <InputGroupAddon addonType="append">
                                            <Button
                                                outline
                                                color="primary"
                                                innerRef={refLookup}
                                                style={{ minWidth: 130 }}
                                                onClick={handleLookupClick}
                                                disabled={isFetching}
                                                data-test="lookupDoi"
                                            >
                                                {!isFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </Form>

                            <TransitionGroup>
                                {showLookupTable ? (
                                    <Container key={1} classNames="slideDown" timeout={{ enter: 500, exit: 300 }}>
                                        <>
                                            <div className="mt-5">
                                                <h3 className="h4 mb-3">
                                                    Lookup result
                                                    <Button className="pull-right ml-1" outline size="sm" onClick={() => setDataEntry('manually')}>
                                                        Edit
                                                    </Button>
                                                </h3>
                                                <Card body>
                                                    <Table className="mb-0">
                                                        <tbody>
                                                            <tr className="table-borderless">
                                                                <td>
                                                                    <strong>Paper title:</strong> {title}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Authors:</strong>{' '}
                                                                    {authors.map((author, index) => (
                                                                        <span key={index}>
                                                                            {authors.length > index + 1 ? author.label + ', ' : author.label}
                                                                        </span>
                                                                    ))}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Publication date:</strong>{' '}
                                                                    {publicationMonth ? moment(publicationMonth, 'M').format('MMMM') : ''}{' '}
                                                                    {publicationYear}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>Published in:</strong> {publishedIn}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </Card>
                                            </div>
                                            {existingPaper && <ExistingDoiModal existingPaper={existingPaper} />}
                                        </>
                                    </Container>
                                ) : (
                                    ''
                                )}
                            </TransitionGroup>
                        </div>
                    </Container>
                )}
                {dataEntry !== 'doi' && (
                    <Container key={2} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                        <Form className="mt-4" onSubmit={submitHandler}>
                            <FormGroup>
                                <Label for="paperTitle">
                                    <Tooltip message="The main title of the paper">Paper title</Tooltip>
                                </Label>
                                <Input type="text" name="title" id="paperTitle" value={title} onChange={handleInputChange} />
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
                                        <AuthorsInput handler={handleAuthorsChange} value={authors} />
                                    </FormGroup>
                                </Col>
                                <Col md={6} className="pl-md-3">
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
                                                    name="publicationMonth"
                                                    aria-label="Select publication month"
                                                    value={publicationMonth}
                                                    onChange={handleMonthChange}
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
                                                    name="publicationYear"
                                                    aria-label="Select publication year"
                                                    value={publicationYear}
                                                    onChange={handleInputChange}
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
                            <FormGroup>
                                <Label for="publishedIn">
                                    <Tooltip message="The conference or journal name">Published in</Tooltip>
                                </Label>
                                <Input type="text" name="publishedIn" id="publishedIn" value={publishedIn} onChange={handleInputChange} />
                                <FormFeedback />
                            </FormGroup>
                            <FormGroup>
                                <Label for="publishedIn">
                                    <Tooltip message="Add the URL to the paper PDF (optional)">Paper URL</Tooltip>
                                </Label>
                                <Input type="text" name="url" id="url" value={url} onChange={handleInputChange} />
                                <FormFeedback />
                            </FormGroup>
                        </Form>
                    </Container>
                )}
            </TransitionGroup>
            <hr className="mt-5 mb-3" />
            {errors && errors.length > 0 && (
                <ul className="float-left mb-4 text-danger">
                    {errors.map((e, index) => {
                        return <li key={index}>{e}</li>;
                    })}
                </ul>
            )}
            <Button color="primary" className="float-right mb-4" onClick={handleNextClick} data-test="nextStep">
                Next step
            </Button>
            {!showHelpButton && (
                <Tour
                    onAfterOpen={disableBody}
                    onBeforeClose={enableBody}
                    steps={[
                        ...(dataEntry === 'doi'
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
                    accentColor={theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={requestCloseTour}
                    isOpen={isTourOpen}
                    startAt={tourStartAt}
                    maskClassName="reactourMask"
                />
            )}
            {showHelpButton && (
                <Tour
                    disableInteraction={false}
                    onAfterOpen={disableBody}
                    onBeforeClose={enableBody}
                    steps={[
                        {
                            selector: '#helpIcon',
                            content: 'If you want to start the tour again at a later point, you can do so from this button.',
                            style: { borderTop: '4px solid #E86161' }
                        }
                    ]}
                    showNumber={false}
                    accentColor={theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={() => {
                        setShowHelpButton(false);
                    }}
                    isOpen={showHelpButton}
                    startAt={0}
                    showButtons={false}
                    showNavigation={false}
                    maskClassName="reactourMask"
                />
            )}
        </div>
    );
};

export default GeneralData;
