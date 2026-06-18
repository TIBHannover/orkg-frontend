import { Cite } from '@citation-js/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Input, Label, ListBox, Modal, Select, toast } from '@heroui/react';
import Link from 'next/link';
import { FC, useState } from 'react';
import Textarea from 'react-textarea-autosize';

import useMembership from '@/components/hooks/useMembership';
import PaperTitleInput from '@/components/Input/PaperTitleInput/PaperTitleInput';
import MetadataTable from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/AddEntryModal/MetadataTable/MetadataTable';
import useList from '@/components/List/hooks/useList';
import { CLASSES, RESOURCES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { reverse } from '@/lib/namedRoute';
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
    const [tab, setTab] = useState<'title' | 'doi' | 'bibtex'>('title');
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
                // eslint-disable-next-line no-await-in-loop
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
                toast.danger('Entry is already in list');
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
                toast.danger('An error occurred');
                setIsLoading(false);
                return;
            }
            for (const paper of papers.data) {
                let paperData: Paper | null = null;
                const {
                    paperTitle,
                    paperAuthors,
                    paperPublicationMonth,
                    paperPublicationYear,
                    doi: parsedDoi,
                    publishedIn,
                } = parseCiteResult({
                    data: [paper],
                });
                if (parsedDoi) {
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        paperData = await getPaperByDoi(parsedDoi);
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (paperTitle && !paperData) {
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        paperData = await getPaperByTitle(title);
                    } catch (e) {
                        console.error(e);
                    }
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
                        doi: parsedDoi,
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
            toast.danger(validationMessages[(e as Error).message] || validationMessages.default);
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
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Add entries</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <ButtonGroup className="w-full mb-6">
                            <Button size="sm" variant={tab === 'title' ? 'primary' : 'outline'} onPress={() => switchTab('title')}>
                                Title
                            </Button>
                            <Button size="sm" variant={tab === 'doi' ? 'primary' : 'outline'} onPress={() => switchTab('doi')}>
                                DOI
                            </Button>
                            <Button size="sm" variant={tab === 'bibtex' ? 'primary' : 'outline'} onPress={() => switchTab('bibtex')}>
                                BibTeX
                            </Button>
                        </ButtonGroup>

                        {tab === 'title' && (
                            <div className="mb-4 flex gap-2 p-1">
                                <Select
                                    aria-label="Content type"
                                    value={contentType}
                                    onChange={(key) => setContentType(String(key))}
                                    className="w-32 shrink-0"
                                >
                                    <Label className="sr-only">Content type</Label>
                                    <Select.Trigger className="min-w-32">
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item id="all" textValue="All">
                                                All
                                            </ListBox.Item>
                                            <ListBox.Item id={CLASSES.PAPER} textValue="Papers">
                                                Papers
                                            </ListBox.Item>
                                            <ListBox.Item id={CLASSES.DATASET} textValue="Datasets">
                                                Datasets
                                            </ListBox.Item>
                                            <ListBox.Item id={CLASSES.SOFTWARE} textValue="Software">
                                                Software
                                            </ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                                <div className="min-w-0 grow">
                                    <PaperTitleInput
                                        key={contentType}
                                        value={title}
                                        onChange={(v: string) => setTitle(v)}
                                        onOptionClick={handleAutocompleteSelect}
                                        performExistingPaperLookup={false}
                                        performOrkgLookup
                                        placeholder="Enter a title"
                                    />
                                </div>
                            </div>
                        )}

                        {tab === 'doi' && (
                            <div className="mb-4 flex items-stretch p-1">
                                <Input
                                    aria-label="DOI"
                                    value={doi}
                                    placeholder="Enter DOIs, whitespace separated"
                                    onChange={(e) => setDoi(e.target.value)}
                                    className="!rounded-e-none flex-1 min-w-0"
                                />
                                <Button
                                    variant="outline"
                                    isDisabled={isLoadingCite}
                                    onPress={() => handleParse(doi)}
                                    className="-ms-px min-w-32 !h-9 !rounded-s-none !rounded-e-[var(--radius)]"
                                >
                                    {!isLoadingCite ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                </Button>
                            </div>
                        )}

                        {tab === 'bibtex' && (
                            <div className="mb-4 p-1">
                                <Textarea
                                    placeholder="Enter BibTeX"
                                    value={bibTex}
                                    minRows={3}
                                    maxRows={10}
                                    className="w-full rounded-md border border-default bg-field-background px-3 py-2 text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-2 focus:outline-focus"
                                    onChange={(e) => setBibTex(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                                <Button variant="secondary" size="sm" className="mt-2" isDisabled={isLoadingCite} onPress={() => handleParse(bibTex)}>
                                    {!isLoadingCite ? 'Parse' : <FontAwesomeIcon icon={faSpinner} spin />}
                                </Button>
                            </div>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Link href={reverse(ROUTES.CONTENT_TYPE_NEW)} target="_blank" className="me-auto">
                            <Button variant="tertiary">Create new</Button>
                        </Link>
                        <Button variant="primary" onPress={handleAdd} isDisabled={results.length === 0}>
                            {!isLoading ? `Add${results.length > 1 ? ` (${results.length})` : ''}` : <FontAwesomeIcon icon={faSpinner} spin />}
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AddEntryModal;
