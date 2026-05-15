'use client';

import { Cite } from '@citation-js/core';
import { faCircleQuestion, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Label, TextField, toast, Tooltip } from '@heroui/react';
import { AnimatePresence, motion } from 'motion/react';
import { Dispatch, ReactNode, SetStateAction, useId } from 'react';

import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import PaperTitleInput from '@/components/Input/PaperTitleInput/PaperTitleInput';
import PublicationMonthInput from '@/components/Input/PublicationMonthInput/PublicationMonthInput';
import PublicationYearInput from '@/components/Input/PublicationYearInput/PublicationYearInput';
import PublishedInInput from '@/components/Input/PublishedInInput/PublishedInInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useOverwriteValuesModal from '@/components/PaperForm/hooks/useOverwriteValuesModal';
import { Author, PublishedIn, ResearchField } from '@/components/PaperForm/types';
import { getAbstractByDoi } from '@/services/semanticScholar';
import { parseCiteResult } from '@/utils';

const FieldHint = ({ text, children }: { text: string; children: ReactNode }) => (
    <span className="inline-flex items-center gap-1.5">
        {children}
        <Tooltip delay={150}>
            <Tooltip.Trigger
                aria-label="More information"
                className="inline-flex cursor-help text-default-200 opacity-50 hover:opacity-100 hover:text-default-400"
            >
                <FontAwesomeIcon icon={faCircleQuestion} className="h-3 w-3" />
            </Tooltip.Trigger>
            <Tooltip.Content showArrow placement="top" className="max-w-xs">
                <Tooltip.Arrow />
                {text}
            </Tooltip.Content>
        </Tooltip>
    </span>
);

type PaperSearchResult = {
    label: string;
    year?: number | string;
    venue?: string;
    authors?: { name: string }[];
    externalIds?: { DOI?: string; ArXiv?: string };
};

type PaperFormProps = {
    isLoadingParsing: boolean;
    setIsLoadingParsing: Dispatch<SetStateAction<boolean>>;
    doi: string;
    setDoi: Dispatch<SetStateAction<string>>;
    title: string;
    setTitle: Dispatch<SetStateAction<string>>;
    researchField: ResearchField;
    setResearchField: Dispatch<SetStateAction<ResearchField>>;
    authors: Author[];
    setAuthors: Dispatch<SetStateAction<Author[]>>;
    publicationMonth: string;
    setPublicationMonth: Dispatch<SetStateAction<string>>;
    publicationYear: string;
    setPublicationYear: Dispatch<SetStateAction<string>>;
    publishedIn: PublishedIn;
    setPublishedIn: Dispatch<SetStateAction<PublishedIn>>;
    url: string;
    setUrl: Dispatch<SetStateAction<string>>;
    abstract?: string | null;
    setAbstract?: Dispatch<SetStateAction<string | null>>;
    isNewPaper?: boolean;
    isMetadataExpanded?: boolean;
    setIsMetadataExpanded?: Dispatch<SetStateAction<boolean>>;
};

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
}: PaperFormProps) => {
    const { shouldUpdateValues, OverwriteValuesModal } = useOverwriteValuesModal();
    const formId = useId();

    const handleLookupClick = async () => {
        const trimmed = doi.trim();
        const entryParsed = trimmed.startsWith('http') ? trimmed.substring(trimmed.indexOf('10.')) : trimmed;

        if (!entryParsed) {
            toast.danger('Please enter a valid DOI');
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
                        ...(!isNewPaper && { doi: doi.toLowerCase() }),
                        title,
                        authors,
                        publicationMonth,
                        publicationYear,
                        publishedIn: publishedIn?.label ?? '',
                        url,
                    },
                    newData: {
                        ...(!isNewPaper && { doi: parseResult.doi.toLowerCase() }),
                        title: parseResult.paperTitle,
                        authors: parseResult.paperAuthors,
                        publicationMonth: parseResult.paperPublicationMonth == null ? '' : String(parseResult.paperPublicationMonth),
                        publicationYear: parseResult.paperPublicationYear == null ? '' : String(parseResult.paperPublicationYear),
                        publishedIn: parseResult.publishedIn,
                        url: parseResult.url,
                    },
                })
            ) {
                setDoi(parseResult.doi);
                setTitle(parseResult.paperTitle);
                setAuthors(parseResult.paperAuthors);
                setPublicationMonth(parseResult.paperPublicationMonth == null ? '' : String(parseResult.paperPublicationMonth));
                setPublicationYear(parseResult.paperPublicationYear == null ? '' : String(parseResult.paperPublicationYear));
                setPublishedIn(parseResult.publishedIn ? { label: parseResult.publishedIn } : null);
                setUrl(parseResult.url);
                setIsMetadataExpanded(true);
                toast.success('Data successfully fetched');
            }
        } catch (e) {
            const messageMapping: Record<string, string> = {
                'This format is not supported or recognized': 'This format is not supported or recognized. Please enter a valid DOI or BibTeX',
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            const message = e instanceof Error ? e.message : '';
            toast.danger(messageMapping[message] || messageMapping.default);
            console.error(e);
            setIsLoadingParsing(false);
        }

        try {
            if (isNewPaper) {
                const fetchedAbstract = (await getAbstractByDoi(entryParsed)) as string | null;
                setAbstract(fetchedAbstract);
            }
        } catch {
            // Semantic Scholar may not have this DOI — leave abstract empty and continue silently.
        }
    };

    const handleTitleOptionClick = async (paper: PaperSearchResult) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    doi,
                    authors,
                    publicationYear,
                    publishedIn: publishedIn?.label ?? '',
                    url,
                },
                newData: {
                    doi: paper.externalIds?.DOI,
                    authors: paper.authors,
                    publicationYear: paper.year == null ? '' : String(paper.year),
                    publishedIn: paper.venue || '',
                    url: paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds?.ArXiv}` : '',
                },
            })
        ) {
            setDoi(paper.externalIds?.DOI ?? '');
            setTitle(paper.label);
            setAuthors(paper?.authors?.length ? paper.authors.map((author) => ({ id: null, name: author.name, identifiers: {} }) as Author) : []);
            setPublicationYear(paper.year == null ? '' : String(paper.year));
            setPublishedIn(paper.venue ? { label: paper.venue } : null);
            setUrl(paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds?.ArXiv}` : '');
            toast.success('Data successfully fetched');
        }
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="p-1">
            <div className="bg-background p-4 rounded mb-4">
                <Label htmlFor={`${formId}-doi`} className="mb-1 block">
                    <FieldHint text="Automatically fetch the details of your paper by providing a DOI">DOI</FieldHint>
                </Label>
                <div className="flex items-stretch">
                    <TextField className="min-w-0 flex-1" value={doi} onChange={setDoi} aria-label="DOI">
                        <Input id={`${formId}-doi`} className="!rounded-e-none" />
                    </TextField>
                    <Button
                        variant="outline"
                        isDisabled={isLoadingParsing}
                        isPending={isLoadingParsing}
                        className="!rounded-s-none -ms-px"
                        onPress={handleLookupClick}
                    >
                        {({ isPending }) => (isPending ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Lookup')}
                    </Button>
                </div>
                {isNewPaper && <p className="mt-1 text-xs text-default-500">When a DOI is entered, some metadata is automatically filled</p>}
            </div>

            {isNewPaper && (
                <div className="flex items-center gap-3 mb-4">
                    <Button variant="tertiary" size="sm" onPress={() => setIsMetadataExpanded((v) => !v)}>
                        {!isMetadataExpanded ? 'Show' : 'Hide'} metadata fields
                    </Button>
                    {!isMetadataExpanded && !doi && (
                        <Button variant="ghost" className="text-accent underline" size="sm" onPress={() => setIsMetadataExpanded((v) => !v)}>
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
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-4 p-1">
                            <div>
                                <Label htmlFor={`${formId}-title`} className="mb-1 block">
                                    <FieldHint text="The main title of the paper">
                                        Paper title <span className="text-default-500 italic">(required)</span>
                                    </FieldHint>
                                </Label>
                                <PaperTitleInput
                                    inputId={`${formId}-title`}
                                    value={title}
                                    onChange={(value: string) => setTitle(value)}
                                    onOptionClick={handleTitleOptionClick}
                                    isDisabled={isLoadingParsing}
                                />
                            </div>

                            <div>
                                <Label htmlFor={`${formId}-researchField`} className="mb-1 block">
                                    <FieldHint text="Provide the main research field of this paper">
                                        Research field <span className="text-default-500 italic">(required)</span>
                                    </FieldHint>
                                </Label>
                                <ResearchFieldInput
                                    value={researchField}
                                    onChange={setResearchField}
                                    inputId={`${formId}-researchField`}
                                    isDisabled={isLoadingParsing}
                                    title={title}
                                    abstract={abstract ?? ''}
                                />
                            </div>

                            <div>
                                <Label htmlFor={`${formId}-authors`} className="mb-1 block">
                                    <FieldHint text="The author or authors of the paper. Enter both the first and last name">Paper authors</FieldHint>
                                </Label>
                                <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} isDisabled={isLoadingParsing} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`${formId}-publicationMonth`} className="mb-1 block">
                                        <FieldHint text="The publication month of the paper">Publication month</FieldHint>
                                    </Label>
                                    <PublicationMonthInput
                                        inputId={`${formId}-publicationMonth`}
                                        value={publicationMonth}
                                        onChange={setPublicationMonth}
                                        isDisabled={isLoadingParsing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`${formId}-publicationYear`} className="mb-1 block">
                                        <FieldHint text="The publication year of the paper">Publication year</FieldHint>
                                    </Label>
                                    <PublicationYearInput
                                        inputId={`${formId}-publicationYear`}
                                        value={publicationYear}
                                        onChange={setPublicationYear}
                                        isDisabled={isLoadingParsing}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor={`${formId}-publishedIn`} className="mb-1 block">
                                    <FieldHint text="The conference or journal name">Published in</FieldHint>
                                </Label>
                                <PublishedInInput
                                    value={publishedIn}
                                    onChange={setPublishedIn}
                                    inputId={`${formId}-publishedIn`}
                                    isDisabled={isLoadingParsing}
                                />
                            </div>

                            <div>
                                <Label htmlFor={`${formId}-url`} className="mb-1 block">
                                    <FieldHint text="Add the URL to the paper PDF (optional)">Paper URL</FieldHint>
                                </Label>
                                <TextField value={url} onChange={setUrl} aria-label="Paper URL" isDisabled={isLoadingParsing}>
                                    <Input id={`${formId}-url`} />
                                </TextField>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <OverwriteValuesModal />
        </form>
    );
};

export default PaperForm;
