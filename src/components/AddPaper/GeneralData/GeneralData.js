import { useState, useEffect, useRef, useContext } from 'react';
import {
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    InputGroup,
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
import { getPaperByDOI, getPaperByTitle } from 'services/backend/misc';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import ExistingDoiModal from './ExistingDoiModal';
import { parseCiteResult } from 'utils';
import env from '@beam-australia/react-env';
import AutocompleteContentTypeTitle from 'components/AutocompleteContentTypeTitle/AutocompleteContentTypeTitle';
import Confirm from 'components/Confirmation/Confirmation';

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
    const [continueNextStep, setContinueNextStep] = useState(false);

    const disableBody = target =>
        disableBodyScroll(target, {
            reserveScrollBarGap: true
        });
    const enableBody = target => enableBodyScroll(target);

    useEffect(() => {
        const entryParam = queryString.parse(location.search).entry;
        if (entryParam) {
            dispatch(updateGeneralData({ entry: entryParam }));
            handleLookupClick(entryParam);
        }

        return () => {
            clearAllBodyScrollLocks();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //TODO this logic should be placed inside an action creator
    const handleLookupClick = async lookDoi => {
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
            .validate(lookDoi);
        if (error) {
            setValidation(error.message);
            return;
        }

        setIsFetching(true);
        setValidation(null);

        let entryParsed;
        if (lookDoi.startsWith('http')) {
            entryParsed = lookDoi.trim().substring(lookDoi.trim().indexOf('10.'));
        } else {
            entryParsed = lookDoi.trim();
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
                setIsFetching(false);
                setValidation(validationMessage);
                setErrors(null);
                return null;
            })
            .then(paper => {
                if (paper) {
                    const parseResult = parseCiteResult(paper);
                    let checkDatabase;
                    // If the paper DOI already exists in the database
                    if (parseResult.doi.includes('10.') && parseResult.doi.startsWith('10.')) {
                        checkDatabase = getPaperByDOI(parseResult.doi);
                    } else {
                        checkDatabase = getPaperByTitle(parseResult.paperTitle);
                    }

                    checkDatabase
                        .then(result => {
                            getStatementsBySubject({ id: result.id }).then(paperStatements => {
                                setExistingPaper({ ...getPaperData(result, paperStatements), title: result.title });
                                setIsFetching(false);
                                setErrors(null);
                            });
                        })
                        .catch(() => {
                            setIsFetching(false);
                            setErrors(null);
                            setExistingPaper(null);
                        });
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
                [e.target.name]: e.target.value
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
            // If the paper title already exists in the database and not checked yet!
            if (!existingPaper) {
                getPaperByTitle(title)
                    .then(result => {
                        getStatementsBySubject({ id: result.id }).then(paperStatements => {
                            setExistingPaper({ ...getPaperData(result, paperStatements), title: result.title });
                            setContinueNextStep(true);
                        });
                    })
                    .catch(() => {
                        setExistingPaper(null);
                        dispatch(nextStep());
                    });
            } else {
                dispatch(nextStep());
            }
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

    const handleTitleOptionClick = async paper => {
        if (authors.length > 0 || publicationMonth || publicationYear || url || publishedIn) {
            const confirm = await Confirm({
                title: 'Overwrite data?',
                message: 'Do you want to overwrite the data you entered with the selected paper data?'
            });

            if (confirm) {
                updateData(paper);
            }
        } else {
            updateData(paper);
        }
    };

    const updateData = paper =>
        dispatch(
            updateGeneralData({
                title: paper.label,
                authors: paper?.authors?.length > 0 ? paper.authors.map(author => ({ label: author.name })) : [],
                publicationYear: paper.year || '',
                publishedIn: paper.venue || '',
                doi: paper.externalIds?.DOI || '',
                entry: paper.externalIds?.DOI || '',
                url: paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds?.ArXiv}` : ''
            })
        );

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
                                                target.charCode === 13 && handleLookupClick(entry);
                                            }}
                                        />
                                        <FormFeedback className="order-1">{validation}</FormFeedback>
                                        {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                                        <Button
                                            outline
                                            color="primary"
                                            innerRef={refLookup}
                                            style={{ minWidth: 130 }}
                                            onClick={() => handleLookupClick(entry)}
                                            disabled={isFetching}
                                            data-test="lookupDoi"
                                        >
                                            {!isFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                        </Button>
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
                                                    <Button className="pull-right ms-1" outline size="sm" onClick={() => setDataEntry('manually')}>
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
                                        </>
                                    </Container>
                                ) : (
                                    ''
                                )}
                            </TransitionGroup>
                        </div>
                    </Container>
                )}
                {existingPaper && (
                    <ExistingDoiModal onContinue={() => (continueNextStep ? dispatch(nextStep()) : undefined)} existingPaper={existingPaper} />
                )}
                {dataEntry !== 'doi' && (
                    <Container key={2} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                        <Form className="mt-4" onSubmit={submitHandler} id="manuelInputGroup">
                            <FormGroup>
                                <Label for="paperTitle">
                                    <Tooltip message="The main title of the paper">Paper title</Tooltip>
                                </Label>
                                <AutocompleteContentTypeTitle
                                    value={title}
                                    onChange={value =>
                                        dispatch(
                                            updateGeneralData({
                                                title: value
                                            })
                                        )
                                    }
                                    onOptionClick={handleTitleOptionClick}
                                />
                                <FormFeedback />
                            </FormGroup>
                            <Row>
                                <Col md={6} className="pe-3">
                                    <FormGroup>
                                        <Label for="paperAuthors">
                                            <Tooltip message="The author or authors of the paper. Enter both the first and last name">
                                                Paper authors
                                            </Tooltip>
                                        </Label>
                                        <AuthorsInput handler={handleAuthorsChange} value={authors} />
                                    </FormGroup>
                                </Col>
                                <Col md={6} className="ps-md-3">
                                    <FormGroup>
                                        <Label for="paperCreationDate">
                                            <Tooltip message="The publication date of the paper, in the form of month and year">
                                                Publication date
                                            </Tooltip>
                                        </Label>
                                        <Row>
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
                <ul className="float-start mb-4 text-danger">
                    {errors.map((e, index) => {
                        return <li key={index}>{e}</li>;
                    })}
                </ul>
            )}
            <Button color="primary" className="float-end mb-4" onClick={handleNextClick} data-test="nextStep">
                Next step
            </Button>

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
                              },
                              {
                                  selector: '#entryOptions',
                                  content:
                                      'In case you don\'t have the DOI, you can enter the general paper data manually. Do this by pressing the "Manually" button on the right.',
                                  style: { borderTop: '4px solid #E86161' }
                              }
                          ]
                        : [
                              {
                                  selector: '#entryOptions',
                                  content:
                                      'In case you have the DOI, you can enter the doi to fetch paper meta-data automatically. Do this by pressing the "By DOI" button on the left.',
                                  style: { borderTop: '4px solid #E86161' },
                                  action: node => (node ? node.focus() : null)
                              },
                              {
                                  selector: '#manuelInputGroup',
                                  content: 'You can enter the general paper data manually using this form.',
                                  style: { borderTop: '4px solid #E86161' },
                                  action: node => (node ? node.focus() : null)
                              }
                          ])
                ]}
                showNumber={false}
                accentColor={theme.primary}
                rounded={10}
                onRequestClose={requestCloseTour}
                isOpen={isTourOpen}
                startAt={tourStartAt}
                maskClassName="reactourMask"
            />

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
                accentColor={theme.primary}
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
        </div>
    );
};

export default GeneralData;
