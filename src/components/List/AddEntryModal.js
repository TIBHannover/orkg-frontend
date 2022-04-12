import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Cite from 'citation-js';
import AutocompleteContentTypeTitle from 'components/AutocompleteContentTypeTitle/AutocompleteContentTypeTitle';
import useList from 'components/List/hooks/useList';
import MetadataTable from 'components/List/MetadataTable/MetadataTable';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { Button, ButtonGroup, FormGroup, Input, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getPaperByDOI, getPaperByTitle } from 'services/backend/misc';
import { saveFullPaper } from 'services/backend/papers';
import { getStatementsBySubject } from 'services/backend/statements';
import { addListEntry } from 'slices/listSlice';
import { parseCiteResult } from 'utils';

const AddEntryModal = ({ sectionId, isOpen, setIsOpen }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCite, setIsLoadingCite] = useState(false);
    const [contentType, setContentType] = useState('all');
    const [title, setTitle] = useState('');
    const [doi, setDoi] = useState('');
    const [bibTex, setBibTex] = useState('');
    const [tab, setTab] = useState('title');
    const [results, setResults] = useState([]);
    const sections = useSelector(state => state.list.sections);
    const dispatch = useDispatch();
    const { getContentTypeData } = useList();

    const getPaperIdByDoi = async doi => {
        try {
            const paper = await getPaperByDOI(doi);
            return paper.id;
        } catch (e) {
            return null;
        }
    };

    const getPaperIdByTitle = async title => {
        try {
            const paper = await getPaperByTitle(title);
            return paper.id;
        } catch (e) {
            return null;
        }
    };

    const handleAdd = async () => {
        for (const entity of results) {
            const _entity = { ...entity };
            // entity does not yet exist, create it before proceeding
            if (!entity.existingContentTypeId) {
                const savedPaper = await saveFullPaper(
                    {
                        paper: {
                            title: entity.title,
                            researchField: MISC.RESEARCH_FIELD_MAIN,
                            authors: entity.authors
                                ? entity.authors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) }))
                                : null,
                            publicationMonth: entity.publicationMonth || undefined,
                            publicationYear: entity.publicationYear || undefined,
                            doi: doi || undefined,
                            publishedIn: entity.publishedIn || undefined,
                            contributions: [
                                {
                                    name: 'Contribution'
                                }
                            ]
                        }
                    },
                    true
                );
                _entity.existingContentTypeId = savedPaper.id;
            }
            if (checkIfInList(_entity.existingContentTypeId)) {
                toast.error('Entry is already in list');
                return;
            }
            await addEntityToList(_entity);
        }
    };

    const checkIfInList = entityId => sections.find(section => section.id === sectionId)?.entries.find(entry => entry.contentTypeId === entityId);

    const addEntityToList = async contentTypeData => {
        const _contentTypeData = await getContentTypeData(contentTypeData.existingContentTypeId);
        dispatch(
            addListEntry({
                contentTypeData: _contentTypeData,
                sectionId
            })
        );
        setIsOpen(false);
    };

    // for now parsed bibtex and DOIs are always considered as papers
    const handleParse = async value => {
        setIsLoadingCite(true);
        try {
            const _results = [];
            const entryParsed = value.trim();

            const papers = await Cite.async(entryParsed);

            if (!papers) {
                toast.error('An error occurred');
                setIsLoading(false);
                return;
            }
            for (const paper of papers.data) {
                let paperId = null;
                const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseCiteResult({
                    data: [paper]
                });
                if (doi) {
                    paperId = await getPaperIdByDoi(doi);
                }
                if (paperTitle && !paperId) {
                    paperId = await getPaperIdByTitle(paperTitle);
                }
                if (paperId) {
                    _results.push(await getMetaData(paperId));
                } else {
                    _results.push({
                        title: paperTitle,
                        authors: paperAuthors,
                        paperPublicationMonth,
                        paperPublicationYear,
                        doi,
                        publishedIn,
                        paperId
                    });
                }
            }
            setResults(_results);
        } catch (e) {
            const validationMessages = {
                'This format is not supported or recognized':
                    "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manual entry' to enter the paper details yourself",
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again'
            };
            console.log(e);
            toast.error(validationMessages[e.message] || validationMessages['default']);
            setIsLoading(false);
            return;
        } finally {
            setIsLoadingCite(false);
        }
    };

    const handleAutocompleteSelect = async selected => {
        setTitle(selected.label);

        // check if is existing
        if (selected.isOrkgResource) {
            setResults([await getMetaData(selected.id)]);
        } else {
            setResults([
                {
                    title: selected.title,
                    paperPublicationYear: selected.year,
                    authors: selected.authors?.map(author => ({ label: author.name })),
                    venue: selected.venue
                }
            ]);
        }
    };

    const getMetaData = async id => {
        const statements = await getStatementsBySubject({ id });
        return {
            title: statements[0]?.subject?.label,
            authors: statements
                .filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR)
                .map(authorStatement => ({ label: authorStatement.object.label }))
                .reverse(),
            paperPublicationMonth: statements.find(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_MONTH)?.object.label ?? null,
            paperPublicationYear: statements.find(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR)?.object.label,
            doi: statements.find(statement => statement.predicate.id === PREDICATES.HAS_DOI)?.object.label,
            publishedIn: statements.find(statement => statement.predicate.id === PREDICATES.HAS_VENUE)?.object.label,
            existingContentTypeId: id
        };
    };

    const switchTab = _tab => {
        if (tab === _tab) {
            return;
        }
        setTab(_tab);
        setResults([]);
    };

    return (
        <>
            <Modal isOpen={isOpen} toggle={v => setIsOpen(!v)} size="lg">
                <ModalHeader toggle={v => setIsOpen(!v)}>Add entries</ModalHeader>
                <ModalBody>
                    <ButtonGroup className="w-100 mb-4">
                        <Button size="sm" color={tab === 'title' ? 'primary' : 'light'} style={{ marginRight: 2 }} onClick={() => switchTab('title')}>
                            Title
                        </Button>
                        <Button size="sm" color={tab === 'doi' ? 'primary' : 'light'} style={{ marginRight: 2 }} onClick={() => switchTab('doi')}>
                            DOI
                        </Button>
                        <Button size="sm" color={tab === 'bibtex' ? 'primary' : 'light'} onClick={() => switchTab('bibtex')}>
                            BibTeX
                        </Button>
                    </ButtonGroup>
                    {tab === 'title' && (
                        <FormGroup>
                            <InputGroup>
                                <Input
                                    value={contentType}
                                    type="select"
                                    style={{ width: 120 }}
                                    className="flex-grow-0"
                                    onChange={e => setContentType(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value={CLASSES.PAPER}>Papers</option>
                                    <option value={CLASSES.DATASET}>Datasets</option>
                                    <option value={CLASSES.SOFTWARE}>Software</option>
                                </Input>
                                <div className="form-control form-control p-0 border-0">
                                    <AutocompleteContentTypeTitle
                                        key={contentType} // reset autocomplete when content type changes
                                        contentType={contentType}
                                        value={title}
                                        onChange={v => setTitle(v)}
                                        onOptionClick={handleAutocompleteSelect}
                                        performExistingPaperLookup={false}
                                        performOrkgLookup={true}
                                        placeholder="Enter a title"
                                        borderRadius="0 6px 6px 0"
                                    />
                                </div>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {tab === 'doi' && (
                        <FormGroup>
                            <InputGroup>
                                <Input
                                    value={doi}
                                    placeholder="Enter DOIs, whitespace separated"
                                    className="form-control"
                                    onChange={e => setDoi(e.target.value)}
                                />
                                <Button outline color="primary" style={{ minWidth: 130 }} disabled={isLoadingCite} onClick={() => handleParse(doi)}>
                                    {!isLoadingCite ? 'Lookup' : <Icon icon={faSpinner} spin />}
                                </Button>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {tab === 'bibtex' && (
                        <FormGroup>
                            <InputGroup>
                                <Textarea
                                    placeholder="Enter BibTeX"
                                    value={bibTex}
                                    minRows="3"
                                    maxRows="10"
                                    className="form-control"
                                    onChange={e => setBibTex(e.target.value)}
                                />
                            </InputGroup>
                            <Button color="secondary" size="sm" className="mt-2" disabled={isLoadingCite} onClick={() => handleParse(bibTex)}>
                                {!isLoadingCite ? 'Parse' : <Icon icon={faSpinner} spin />}
                            </Button>
                        </FormGroup>
                    )}
                    {results.map((result, index) => (
                        <MetadataTable
                            key={index}
                            title={result.title}
                            authors={result.authors}
                            publicationMonth={result.paperPublicationMonth}
                            publicationYear={result.paperPublicationYear}
                            venue={result.publishedIn}
                            contentTypeId={result.existingContentTypeId}
                        />
                    ))}
                </ModalBody>
                <ModalFooter className="d-flex">
                    <div className="flex-grow-1">
                        <Link to={reverse(ROUTES.CONTENT_TYPE_NEW)} target="_blank">
                            <Button color="light">Create new</Button>
                        </Link>
                    </div>
                    <Button color="primary" className="float-end" onClick={handleAdd} disabled={results.length === 0}>
                        {!isLoading ? `Add${results.length > 1 ? ` (${results.length})` : ''}` : <Icon icon={faSpinner} spin />}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

AddEntryModal.propTypes = {
    sectionId: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired
};

export default AddEntryModal;
