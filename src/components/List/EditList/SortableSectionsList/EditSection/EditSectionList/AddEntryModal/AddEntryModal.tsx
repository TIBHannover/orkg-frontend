import { Cite } from '@citation-js/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';

import useMembership from '@/components/hooks/useMembership';
import PaperTitleInput from '@/components/Input/PaperTitleInput/PaperTitleInput';
import MetadataTable from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/AddEntryModal/MetadataTable/MetadataTable';
import useList from '@/components/List/hooks/useList';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { CLASSES, RESOURCES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { getPaper, getPaperByDoi, getPaperByTitle } from '@/services/backend/papers';
import { Author, LiteratureListSectionList, Paper, Resource, UpdateAuthor } from '@/services/backend/types';
import { SemanticScholarResult } from '@/services/semanticScholar';
import { parseCiteResult } from '@/utils';

type AddEntryModalProps = {
    section: LiteratureListSectionList;
    toggle: () => void;
};

type Result = {
    id?: string | null;
    title?: string;
    authors?: (Author | UpdateAuthor)[];
    publicationMonth?: number | null;
    publicationYear?: number | null;
    publishedIn?: string | null;
    doi?: string | null;
};

const AddEntryModal: FC<AddEntryModalProps> = ({ section, toggle }) => {
    const { updateSection } = useList();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCite, setIsLoadingCite] = useState(false);
    const [contentType, setContentType] = useState('all');
    const [title, setTitle] = useState('');
    const [doi, setDoi] = useState('');
    const [bibTex, setBibTex] = useState('');
    const [tab, setTab] = useState('title');
    const [results, setResults] = useState<Result[]>([]);
    const { list } = useList();
    const { organizationId, observatoryId } = useMembership();

    const checkIfInList = (entityId: string) => {
        if (!list) {
            return false;
        }
        return (list.sections.find((s) => s.id === section.id) as LiteratureListSectionList)?.entries.find((entry) => entry?.value.id === entityId);
    };

    const handleAdd = async () => {
        const newEntries = [];

        for (const result of results) {
            const _entity = { ...result };
            // entity does not yet exist, create it before proceeding
            if (!_entity.id) {
                const paper = await createPaperMergeIfExists({
                    paper: {
                        title: result.title,
                        research_fields: [RESOURCES.RESEARCH_FIELD_MAIN],
                        ...(result.doi
                            ? {
                                  identifiers: {
                                      doi: [result.doi],
                                  },
                              }
                            : {}),
                        publication_info: {
                            published_month: result.publicationMonth || undefined,
                            published_year: result.publicationYear || undefined,
                            published_in: result.publishedIn || null,
                        },
                        authors: result.authors ?? [],
                        observatories: observatoryId ? [observatoryId] : [],
                        organizations: organizationId ? [organizationId] : [],
                    },
                });
                _entity.id = paper;
            }
            if (_entity.id && checkIfInList(_entity.id)) {
                toast.error('Entry is already in list');
                return;
            }

            newEntries.push({
                description: '',
                value: {
                    id: _entity.id,
                    label: '',
                    classes: [],
                },
            });
        }
        updateSection(section.id, {
            entries: [...section.entries, ...newEntries],
        });
        toggle();
    };

    const paperToResult = (paper: Paper) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        publicationMonth: paper.publication_info?.published_month,
        publicationYear: paper.publication_info?.published_year,
        publishedIn: paper.publication_info?.published_in?.label,
        doi: paper.identifiers?.doi?.[0],
    });

    // for now parsed bibtex and DOIs are always considered as papers
    const handleParse = async (value: string) => {
        setIsLoadingCite(true);
        try {
            const _results: Result[] = [];
            const entryParsed = value.trim();

            const papers = await Cite.async(entryParsed);

            if (!papers) {
                toast.error('An error occurred');
                setIsLoading(false);
                return;
            }
            for (const paper of papers.data) {
                let paperData: Paper | null = null;
                const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseCiteResult({
                    data: [paper],
                });
                if (doi) {
                    try {
                        paperData = await getPaperByDoi(doi);
                    } catch (e) {}
                }
                if (paperTitle && !paperData) {
                    try {
                        paperData = await getPaperByTitle(title);
                    } catch (e) {}
                }
                if (paperData) {
                    _results.push(paperToResult(paperData));
                } else {
                    _results.push({
                        title: paperTitle,
                        authors: paperAuthors,
                        // @ts-expect-error awaiting TS migration
                        publicationMonth: paperPublicationMonth,
                        // @ts-expect-error awaiting TS migration
                        publicationYear: paperPublicationYear,
                        publishedIn,
                        doi,
                    });
                }
            }
            setResults(_results);
        } catch (e) {
            const validationMessages: {
                [key: string]: string;
            } = {
                'This format is not supported or recognized':
                    "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manual entry' to enter the paper details yourself",
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            console.error(e);
            toast.error(validationMessages[(e as Error).message] || validationMessages.default);
            setIsLoading(false);
            return;
        } finally {
            setIsLoadingCite(false);
        }
    };

    const handleAutocompleteSelect = async (selected: (Resource | SemanticScholarResult) & { isOrkgResource: boolean }) => {
        if (!selected) {
            return;
        }
        setTitle(selected.label);

        // check if is existing
        if (selected.isOrkgResource) {
            let result: Result | null = null;
            if ((selected as Resource)?.classes?.includes(CLASSES.PAPER)) {
                const paper = await getPaper(selected.id);
                result = paperToResult(paper);
            } else {
                result = {
                    id: selected.id,
                    title: selected.label,
                };
            }

            if (result) {
                setResults([result]);
            }
        } else {
            setResults([
                {
                    title: (selected as SemanticScholarResult).title,
                    publicationYear: (selected as SemanticScholarResult).year,
                    publishedIn: (selected as SemanticScholarResult).venue,
                    authors: (selected as SemanticScholarResult).authors?.map((author) => ({ name: author.name })),
                },
            ]);
        }
    };

    const switchTab = (_tab: 'title' | 'doi' | 'bibtex') => {
        if (tab === _tab) {
            return;
        }
        setTab(_tab);
        setResults([]);
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Add entries</ModalHeader>
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
                                onChange={(e) => setContentType(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value={CLASSES.PAPER}>Papers</option>
                                <option value={CLASSES.DATASET}>Datasets</option>
                                <option value={CLASSES.SOFTWARE}>Software</option>
                            </Input>
                            <div className="form-control form-control p-0 border-0">
                                <PaperTitleInput
                                    key={contentType} // reset autocomplete when content type changes
                                    // @ts-expect-error
                                    contentType={contentType}
                                    value={title}
                                    onChange={(v: string) => setTitle(v)}
                                    onOptionClick={handleAutocompleteSelect}
                                    performExistingPaperLookup={false}
                                    performOrkgLookup
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
                                onChange={(e) => setDoi(e.target.value)}
                            />
                            <Button outline color="primary" style={{ minWidth: 130 }} disabled={isLoadingCite} onClick={() => handleParse(doi)}>
                                {!isLoadingCite ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
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
                                minRows={3}
                                maxRows={10}
                                className="form-control"
                                onChange={(e) => setBibTex(e.target.value)}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </InputGroup>
                        <Button color="secondary" size="sm" className="mt-2" disabled={isLoadingCite} onClick={() => handleParse(bibTex)}>
                            {!isLoadingCite ? 'Parse' : <FontAwesomeIcon icon={faSpinner} spin />}
                        </Button>
                    </FormGroup>
                )}
                {results.map((result, index) => (
                    <MetadataTable
                        key={index}
                        title={result.title}
                        authors={result.authors}
                        publicationMonth={result.publicationMonth}
                        publicationYear={result.publicationYear}
                        publishedIn={result.publishedIn}
                        id={result.id}
                    />
                ))}
            </ModalBody>
            <ModalFooter className="d-flex">
                <div className="flex-grow-1">
                    <Link href={reverse(ROUTES.CONTENT_TYPE_NEW_NO_TYPE)} target="_blank">
                        <Button color="light">Create new</Button>
                    </Link>
                </div>
                <Button color="primary" className="float-end" onClick={handleAdd} disabled={results.length === 0}>
                    {!isLoading ? `Add${results.length > 1 ? ` (${results.length})` : ''}` : <FontAwesomeIcon icon={faSpinner} spin />}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddEntryModal;
