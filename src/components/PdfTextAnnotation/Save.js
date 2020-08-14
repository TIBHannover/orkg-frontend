import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Alert,
    Input,
    ModalFooter,
    Button,
    FormGroup,
    Label,
    ButtonGroup,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import { saveFullPaper, createResource } from 'network';
import { PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import Cite from 'citation-js';
import { parseCiteResult } from 'utils';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { MISC } from 'constants/graphSettings';

const Save = props => {
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const [title, setTitle] = useState('');
    const [doi, setDoi] = useState('');
    const [paperId, setPaperId] = useState(null);
    const [saveBy, setSaveBy] = useState('doi');
    const [doiIsFetching, setDoiIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paperData, setPaperData] = useState({
        paperTitle: null,
        paperAuthors: null,
        paperPublicationMonth: null,
        paperPublicationYear: null,
        doi: null,
        publishedIn: null
    });

    const handleSave = async () => {
        const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = paperData;
        const _title = saveBy === 'doi' ? paperTitle : title;

        if (!_title) {
            if (saveBy === 'doi') {
                toast.error("The DOI data is not fetched. Enter a valid DOI and click 'Lookup'");
            } else {
                toast.error('Please enter a paper title');
            }
            return;
        }
        setIsLoading(true);

        const contributionStatements = {};

        for (const annotation of annotations) {
            const resource = await createResource(annotation.content.text, [annotation.type]); // ,'http://purl.org/dc/terms/' +
            if (!(PREDICATES.HAS_PART in contributionStatements)) {
                contributionStatements[PREDICATES.HAS_PART] = [
                    {
                        '@id': resource.id
                    }
                ];
            } else {
                contributionStatements[PREDICATES.HAS_PART].push({
                    '@id': resource.id
                });
            }
        }

        const paper = {
            title: paperTitle,
            researchField: MISC.RESEARCH_FIELD_MAIN,
            authors: paperAuthors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) })),
            publicationMonth: paperPublicationMonth,
            publicationYear: paperPublicationYear,
            doi,
            publishedIn,
            contributions: [
                {
                    name: 'Contribution',
                    values: contributionStatements
                }
            ]
        };

        const savedPaper = await saveFullPaper({ paper: paper }, true);

        setIsLoading(false);
        setPaperId(savedPaper.id);
    };

    const fetchDoi = async () => {
        if (!doi) {
            toast.error('Please enter a DOI');
            return;
        }

        setDoiIsFetching(true);

        await Cite.async(doi)
            .catch(e => {
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        toast.error('This format is not supported or recognized');
                        break;
                    case 'Server responded with status code 404':
                        toast.error('No paper has been found');

                        break;
                    default:
                        toast.error('An error occurred, reload the page and try again');
                        break;
                }
                setDoiIsFetching(false);
                return null;
            })
            .then(paper => {
                if (paper) {
                    const parseResult = parseCiteResult(paper);
                    const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseResult;

                    setPaperData({
                        paperTitle,
                        paperAuthors,
                        paperPublicationMonth,
                        paperPublicationYear,
                        doi,
                        publishedIn
                    });
                    setDoiIsFetching(false);
                }
            });
    };

    const handleClose = () => {
        props.toggle();
        setPaperId(null);
    };

    return (
        <Modal isOpen={props.isOpen} toggle={handleClose}>
            <ModalHeader toggle={handleClose}>Save annotations</ModalHeader>
            <ModalBody>
                {!paperId ? (
                    annotations.length > 0 ? (
                        <>
                            <Label for="exampleUrl">Add paper by</Label>
                            <br />
                            <ButtonGroup size="sm">
                                <Button color={saveBy === 'doi' ? 'primary' : 'light'} onClick={() => setSaveBy('doi')}>
                                    Paper DOI
                                </Button>
                                <Button color={saveBy === 'title' ? 'primary' : 'light'} onClick={() => setSaveBy('title')}>
                                    Paper title
                                </Button>
                            </ButtonGroup>
                            <hr />
                            {saveBy === 'doi' && (
                                <>
                                    <FormGroup>
                                        <Label for="exampleUrl">Paper DOI</Label>
                                        <InputGroup id="doiInputGroup">
                                            <Input type="url" name="url" value={doi} onChange={e => setDoi(e.target.value)} />
                                            <InputGroupAddon addonType="append">
                                                <Button
                                                    outline
                                                    color="primary"
                                                    style={{ minWidth: 130 }}
                                                    onClick={fetchDoi}
                                                    disabled={doiIsFetching}
                                                    data-test="lookupDoi"
                                                >
                                                    {!doiIsFetching ? 'Lookup' : <Icon icon={faSpinner} spin />}
                                                </Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </FormGroup>
                                    {paperData.paperTitle && (
                                        <p>
                                            <strong>Paper title:</strong> {paperData.paperTitle}
                                        </p>
                                    )}
                                </>
                            )}
                            {saveBy === 'title' && (
                                <FormGroup>
                                    <Label for="exampleUrl">Paper title</Label>
                                    <Input type="url" name="url" value={title} onChange={e => setTitle(e.target.value)} />
                                </FormGroup>
                            )}
                        </>
                    ) : (
                        <Alert color="danger">You didn't make any annotations yet, so there is nothing to save</Alert>
                    )
                ) : (
                    <Alert color="success">
                        Annotations successfully saved{' '}
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                    </Alert>
                )}
            </ModalBody>
            {annotations.length && !paperId ? (
                <ModalFooter>
                    <Button color="primary" onClick={handleSave} disabled={isLoading}>
                        {!isLoading ? 'Save' : <Icon icon={faSpinner} spin />}
                    </Button>
                </ModalFooter>
            ) : null}
        </Modal>
    );
};

Save.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default Save;
