import { Cite } from '@citation-js/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'motion/react';
import PropTypes from 'prop-types';
import { useId } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import PaperTitleInput from '@/components/Input/PaperTitleInput/PaperTitleInput';
import PublicationMonthInput from '@/components/Input/PublicationMonthInput/PublicationMonthInput';
import PublicationYearInput from '@/components/Input/PublicationYearInput/PublicationYearInput';
import PublishedInInput from '@/components/Input/PublishedInInput/PublishedInInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useOverwriteValuesModal from '@/components/PaperForm/hooks/useOverwriteValuesModal';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import Tooltip from '@/components/Utils/Tooltip';
import { getAbstractByDoi } from '@/services/semanticScholar';
import { parseCiteResult } from '@/utils';

const PaperForm = ({
    isLoadingParsing,
    setIsLoadingParsing,
    doi,
    setDoi,
    title,
    setTitle,
    researchField,
    setResearchField,
    authors,
    setAuthors,
    publicationMonth,
    setPublicationMonth,
    publicationYear,
    setPublicationYear,
    publishedIn,
    setPublishedIn,
    url,
    setUrl,
    abstract,
    setAbstract = () => {},
    isNewPaper = false,
    isMetadataExpanded = false,
    setIsMetadataExpanded = () => {},
}) => {
    const { shouldUpdateValues, OverwriteValuesModal } = useOverwriteValuesModal();
    const handleLookupClick = async () => {
        let entryParsed;
        if (doi.startsWith('http')) {
            entryParsed = doi.trim().substring(doi.trim().indexOf('10.'));
        } else {
            entryParsed = doi.trim();
        }

        if (!entryParsed) {
            toast.error('Please enter a valid DOI');
            return;
        }

        setIsLoadingParsing(true);

        try {
            const paper = await Cite.async(entryParsed);
            if (!paper) {
                return;
            }
            const parseResult = parseCiteResult(paper);
            setIsLoadingParsing(false);

            if (
                await shouldUpdateValues({
                    currentData: {
                        ...(!isNewPaper && { doi: doi.toLowerCase() }), // we don't care about casing of the DOI
                        title,
                        authors,
                        publicationMonth: parseInt(publicationMonth, 10),
                        publicationYear: parseInt(publicationYear, 10),
                        publishedIn: publishedIn?.label,
                        url,
                    },
                    newData: {
                        ...(!isNewPaper && { doi: parseResult.doi.toLowerCase() }),
                        title: parseResult.paperTitle,
                        authors: parseResult.paperAuthors,
                        publicationMonth: parseResult.paperPublicationMonth,
                        publicationYear: parseResult.paperPublicationYear,
                        publishedIn: parseResult.publishedIn,
                        url: parseResult.url,
                    },
                })
            ) {
                setDoi(parseResult.doi);
                setTitle(parseResult.paperTitle);
                setAuthors(parseResult.paperAuthors);
                setPublicationMonth(parseResult.paperPublicationMonth);
                setPublicationYear(parseResult.paperPublicationYear);
                setPublishedIn({ label: parseResult.publishedIn });
                setUrl(parseResult.url);
                setIsMetadataExpanded(true);
                toast.success('Data successfully fetched');
            }
        } catch (e) {
            const messageMapping = {
                'This format is not supported or recognized': 'This format is not supported or recognized. Please enter a valid DOI or BibTeX',
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            toast.error(messageMapping[e.message] || messageMapping.default);
            console.error(e);
            setIsLoadingParsing(false);
        }

        try {
            if (isNewPaper) {
                setAbstract(await getAbstractByDoi(entryParsed));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleTitleOptionClick = async (paper) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    doi,
                    authors,
                    publicationYear: parseInt(publicationYear, 10),
                    publishedIn: publishedIn?.label,
                    url,
                },
                newData: {
                    doi: paper.externalIds?.DOI,
                    authors: paper.authors,
                    publicationYear: paper.year || '',
                    publishedIn: paper.venue || '',
                    url: paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds?.ArXiv}` : '',
                },
            })
        ) {
            setDoi(paper.externalIds?.DOI);
            setTitle(paper.label);
            setAuthors(paper?.authors?.length > 0 ? paper.authors.map((author) => ({ name: author.name })) : []);
            setPublicationYear(paper.year || '');
            setPublishedIn({ label: paper.venue || '' });
            setUrl(paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds?.ArXiv}` : '');
            toast.success('Data successfully fetched');
        }
    };

    const formId = useId();

    return (
        <Form onSubmit={(e) => e.preventDefault()}>
            <FormGroup className="bg-light p-3 rounded">
                <Label for={`${formId}-doi`}>
                    <Tooltip message="Automatically fetch the details of your paper by providing a DOI">DOI</Tooltip>
                </Label>
                <InputGroup>
                    <Input id={`${formId}-doi`} value={doi} onChange={(e) => setDoi(e.target.value)} />
                    <ButtonWithLoading disabled={isLoadingParsing} color="primary" outline onClick={handleLookupClick} isLoading={false}>
                        {!isLoadingParsing ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                    </ButtonWithLoading>
                </InputGroup>
                {isNewPaper && <FormText>When a DOI is entered, some metadata is automatically filled</FormText>}
            </FormGroup>
            {isNewPaper && (
                <div className="d-flex mb-3">
                    <Button color="light" size="sm" onClick={() => setIsMetadataExpanded((v) => !v)}>
                        {!isMetadataExpanded ? 'Show' : 'Hide'} metadata fields
                    </Button>
                    {!isMetadataExpanded && !doi && (
                        <Button color="link" onClick={() => setIsMetadataExpanded((v) => !v)} className="ms-2 mt-1 p-0 ms-3">
                            Click here if you don't have a DOI
                        </Button>
                    )}
                </div>
            )}
            <AnimatePresence initial={false}>
                {(!isNewPaper || isMetadataExpanded) && (
                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                    >
                        <FormGroup>
                            <Label for={`${formId}-title`}>
                                <Tooltip message="The main title of the paper">
                                    Paper title <span className="text-muted fst-italic">(required)</span>
                                </Tooltip>
                            </Label>
                            <PaperTitleInput
                                inputId={`${formId}-title`}
                                value={title}
                                onChange={(value) => setTitle(value)}
                                onOptionClick={handleTitleOptionClick}
                                isDisabled={isLoadingParsing}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${formId}-researchField`}>
                                <Tooltip message="Provide the main research field of this paper">
                                    Research field <span className="text-muted fst-italic">(required)</span>
                                </Tooltip>
                            </Label>
                            <ResearchFieldInput
                                value={researchField}
                                onChange={setResearchField}
                                inputId={`${formId}-researchField`}
                                isDisabled={isLoadingParsing}
                                title={title}
                                abstract={abstract}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${formId}-authors`}>
                                <Tooltip message="The author or authors of the paper. Enter both the first and last name">Paper authors</Tooltip>
                            </Label>
                            <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} isDisabled={isLoadingParsing} />
                        </FormGroup>
                        <Row>
                            <Col md="6">
                                <FormGroup>
                                    <Label for={`${formId}-publicationMonth`}>
                                        <Tooltip message="The publication month of the paper">Publication month</Tooltip>
                                    </Label>
                                    <PublicationMonthInput
                                        inputId={`${formId}-publicationMonth`}
                                        value={publicationMonth}
                                        onChange={setPublicationMonth}
                                        isDisabled={isLoadingParsing}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label for={`${formId}-publicationYear`}>
                                        <Tooltip message="The publication year of the paper">Publication year</Tooltip>
                                    </Label>
                                    <PublicationYearInput
                                        inputId={`${formId}-publicationYear`}
                                        value={publicationYear}
                                        onChange={setPublicationYear}
                                        isDisabled={isLoadingParsing}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for={`${formId}-publishedIn`}>
                                <Tooltip message="The conference or journal name">Published in</Tooltip>
                            </Label>
                            <PublishedInInput
                                value={publishedIn}
                                onChange={setPublishedIn}
                                inputId={`${formId}-publishedIn`}
                                isDisabled={isLoadingParsing}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${formId}-url`}>
                                <Tooltip message="Add the URL to the paper PDF (optional)">Paper URL</Tooltip>
                            </Label>
                            <Input id={`${formId}-url`} value={url} onChange={(e) => setUrl(e.target.value)} disabled={isLoadingParsing} />
                        </FormGroup>
                    </motion.div>
                )}
            </AnimatePresence>
            <OverwriteValuesModal />
        </Form>
    );
};

PaperForm.propTypes = {
    isLoadingParsing: PropTypes.bool.isRequired,
    setIsLoadingParsing: PropTypes.func.isRequired,
    doi: PropTypes.string,
    setDoi: PropTypes.func.isRequired,
    title: PropTypes.string,
    setTitle: PropTypes.func.isRequired,
    researchField: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    setResearchField: PropTypes.func.isRequired,
    authors: PropTypes.array,
    setAuthors: PropTypes.func.isRequired,
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setPublicationMonth: PropTypes.func.isRequired,
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setPublicationYear: PropTypes.func.isRequired,
    publishedIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    setPublishedIn: PropTypes.func.isRequired,
    url: PropTypes.string,
    setUrl: PropTypes.func.isRequired,
    abstract: PropTypes.string,
    setAbstract: PropTypes.func,
    isNewPaper: PropTypes.bool,
    isMetadataExpanded: PropTypes.bool,
    setIsMetadataExpanded: PropTypes.func,
};

export default PaperForm;
