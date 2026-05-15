import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, cn, Label, Modal, toast, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import { clone } from 'lodash';
// @ts-expect-error package doesn't support typescript
import MakeLatex from 'make-latex';
import { FC, useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import generateMatrix from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/generateMatrix';
import useComparisonExport from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getStatements } from '@/services/backend/statements';
import { ComparisonTableColumn, Statement } from '@/services/backend/types';
import { addAuthorsToStatements, getPublicUrl } from '@/utils';

type ExportToLatexProps = {
    toggle: () => void;
};

const ExportToLatex: FC<ExportToLatexProps> = ({ toggle }) => {
    const [selectedTab, setSelectedTab] = useState<'table' | 'references'>('table');
    const [latexTableLoading, setLatexTableLoading] = useState(true);
    const [bibtexReferencesLoading, setBibtexReferencesLoading] = useState(true);
    const [replaceTitles, setReplaceTitles] = useState(true);
    const [includeFootnote, setIncludeFootnote] = useState(true);
    const [latexTable, setLatexTable] = useState('');
    const [bibTexReferences, setBibTexReferences] = useState('');
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('Latex copied to clipboard');
        }
    }, [state.value]);

    const { comparison, selectedPathsFlattened } = useComparison();
    const { table, columns } = useComparisonExport();
    const matrixData = generateMatrix({ table, columns, predicates: selectedPathsFlattened });

    const generateLatex = async () => {
        setLatexTableLoading(true);
        if (matrixData.length === 0) {
            return '';
        }

        const res: { [key: string]: string }[] = [];
        let transposedData: string[][] = [];
        let newTitles = null;
        let nbColumns = 0;

        transposedData = matrixData[0].map((col, i) => matrixData.map((row) => row[i]));

        if (replaceTitles) {
            newTitles = ['\\textbf{Title}'];
            const conTitles = ['Title'];
            transposedData[0].forEach((title, i) => {
                if (i > 0) {
                    newTitles.push(`\\textbf{\\cite{${columns[i - 1].title?.id}}} `);
                    conTitles.push(`${columns[i - 1].subtitle?.id}`);
                }
            });
            transposedData[0] = conTitles;
        }

        transposedData.forEach((contribution, i) => {
            if (i > 0) {
                const con: { [key: string]: string } = {};
                contribution.forEach((item, j) => {
                    con[transposedData[0][j]] = item !== 'undefined' ? (j === 0 ? `\\textit{${item}}` : item) : '-';
                });
                res.push(con);
            }
        });

        nbColumns = res.length > 0 ? Object.keys(res[0]).length : 0;

        let _latexTable;

        if (res.length > 0) {
            let caption = 'This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}. ';
            let title = 'tab:ORKG';
            if (comparison && comparison.id && comparison.title) {
                caption += `${comparison.title} - ${comparison.description}`;
                title = `tab:${comparison.id}`;
            }

            if (includeFootnote) {
                caption += ' \\protect \\footnotemark';
            }

            const makeLatexOptions: {
                digits: number;
                spec: string;
                captionPlacement: string;
                caption: string;
                label: string;
                colnames: string[];
            } = {
                digits: 2,
                spec: `|l|${Array(nbColumns - 1)
                    .fill('c')
                    .join('|')}|`,
                captionPlacement: 'top',
                caption,
                label: title,
                colnames: [],
            };

            if (newTitles) {
                makeLatexOptions.colnames = newTitles;
            }

            _latexTable = MakeLatex(res, makeLatexOptions);

            if (includeFootnote) {
                const link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: comparison?.id ?? '' })}`;
                _latexTable += `\n\\footnotetext{${link} [accessed ${dayjs().format('YYYY MMM DD')}]}`;
            }

            setLatexTable(_latexTable);
            setLatexTableLoading(false);
        } else {
            setLatexTable("The current comparison table doesn't contain any pieces of information to export. Please re-try with different options.");
            setLatexTableLoading(false);
        }
    };

    const parsePaperStatements = (paperStatements: Statement[]) => {
        const publicationYearStatements = paperStatements.filter((statement) => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR);
        let publicationYear: string | null = null;
        if (publicationYearStatements.length > 0) {
            publicationYear = publicationYearStatements[0].object.label;
        }

        const authorsList = paperStatements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS);
        const authors = paperStatements.filter((statement) => statement.subject.id === authorsList?.object.id);
        const authorNamesArray = [];

        if (authors.length > 0) {
            for (const author of authors) {
                authorNamesArray.push(author.object.label);
            }
        }

        return { authors: authorNamesArray, publicationYear };
    };

    const createCiteBibtex = (column: ComparisonTableColumn, paperStatements: Statement[] | null) => {
        if (paperStatements) {
            const contributionData = parsePaperStatements(paperStatements);
            const authors = contributionData.authors.map((a) => ({ literal: a }));
            return new Cite({
                id: column.title?.id || '',
                title: column.title?.label || '',
                author: authors.length > 0 ? authors : null,
                issued: { 'date-parts': [[contributionData.publicationYear]] },
            });
        }
        return new Cite({
            id: column.title?.id || '',
            title: column.title?.label || '',
        });
    };

    const generateBibTex = () => {
        setBibtexReferencesLoading(true);
        const papers = columns.filter((column) => column.title.classes.includes(CLASSES.PAPER));
        if (papers.length === 0) {
            setBibTexReferences('');
            setBibtexReferencesLoading(false);
            return '';
        }

        const contributionsCalls: Promise<ComparisonTableColumn>[] = papers.map((column) =>
            getStatements({ subjectId: column.title?.id || '' })
                .then((_statements): Promise<Statement[]> => addAuthorsToStatements(_statements))
                .then((paperStatements) => {
                    const _contribution = { ...clone(column), bibtex: '' };
                    const doiStatements = paperStatements.filter((statement: Statement) => statement.predicate.id === PREDICATES.HAS_DOI);
                    if (doiStatements.length > 0) {
                        const doi = doiStatements[0].object.label;
                        if (doi !== '') {
                            return (
                                Cite.async(doi)
                                    .catch(() => createCiteBibtex(_contribution, paperStatements))
                                    // @ts-expect-error package doesn't support typescript
                                    .then((data) => {
                                        _contribution.bibtex = data;
                                        return _contribution;
                                    })
                            );
                        }
                    }
                    _contribution.bibtex = createCiteBibtex(_contribution, paperStatements);
                    return _contribution;
                })
                .catch(() => {
                    const _contribution = { ...clone(column), bibtex: '' };
                    _contribution.bibtex = createCiteBibtex(column, null);
                    return _contribution;
                }),
        );
        const orkgCitation = Cite.async('10.1145/3360901.3364435').then();
        return Promise.all([...contributionsCalls, orkgCitation]).then((_contributions) => {
            const res: string[] = [];
            const paperIds: string[] = [];
            const bibtexOptions = { output: { type: 'string', style: 'bibtex' } };
            _contributions.forEach((contribution) => {
                const _contribution = clone(contribution);
                if (_contribution.title?.id) {
                    if (!paperIds.includes(_contribution.title?.id)) {
                        paperIds.push(_contribution.title?.id);
                        _contribution.bibtex.options(bibtexOptions);
                        _contribution.bibtex = _contribution.bibtex.get();
                        const refID = _contribution.bibtex.substring(_contribution.bibtex.indexOf('{') + 1, _contribution.bibtex.indexOf(','));
                        _contribution.bibtex = _contribution.bibtex.replace(refID, _contribution.title?.id);
                        res.push(_contribution.bibtex);
                    }
                } else {
                    _contribution.options(bibtexOptions);
                    res.push(_contribution.get());
                }
            });

            setBibTexReferences(res.join('\n'));
            setBibtexReferencesLoading(false);
        });
    };

    useEffect(() => {
        generateLatex();
        generateBibTex();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        generateLatex();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replaceTitles, includeFootnote]);

    const textareaClass =
        'w-full font-mono text-[85%] rounded border border-default bg-field-background text-field-foreground px-3 py-2 focus:outline-none focus:border-accent';

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>LaTeX export</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b border-default" aria-label="LaTeX export">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={selectedTab === 'table'}
                                className={cn(
                                    'inline-flex items-center rounded-t px-4 py-2 -mb-px border-b-2 transition-colors',
                                    selectedTab === 'table'
                                        ? 'border-accent text-accent font-semibold'
                                        : 'border-transparent text-default-600 hover:text-foreground',
                                )}
                                onClick={() => setSelectedTab('table')}
                            >
                                LaTeX table
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={selectedTab === 'references'}
                                className={cn(
                                    'inline-flex items-center rounded-t px-4 py-2 -mb-px border-b-2 transition-colors',
                                    selectedTab === 'references'
                                        ? 'border-accent text-accent font-semibold'
                                        : 'border-transparent text-default-600 hover:text-foreground',
                                )}
                                onClick={() => setSelectedTab('references')}
                            >
                                BibTeX references
                            </button>
                        </div>

                        {selectedTab === 'table' && (
                            <>
                                <textarea
                                    aria-label="LaTeX table output"
                                    className={textareaClass}
                                    value={!latexTableLoading ? latexTable : 'Loading...'}
                                    readOnly
                                    rows={15}
                                />
                                <div className="flex flex-wrap items-start gap-3 mt-3">
                                    <div className="grow flex flex-col gap-2">
                                        <Tooltip>
                                            <Checkbox isSelected={replaceTitles} onChange={setReplaceTitles}>
                                                <Checkbox.Control>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Control>
                                                <Label>Replace contribution titles by reference</Label>
                                            </Checkbox>
                                            <Tooltip.Content>
                                                Since contribution titles can be long, it is sometimes better to replace the title by a reference
                                                like: Paper [1], Paper [2]…
                                            </Tooltip.Content>
                                        </Tooltip>
                                        <Checkbox isSelected={includeFootnote} onChange={setIncludeFootnote}>
                                            <Checkbox.Control>
                                                <Checkbox.Indicator />
                                            </Checkbox.Control>
                                            <Label>Include a persistent link to this page as a footnote</Label>
                                        </Checkbox>
                                    </div>
                                    <Button variant="primary" size="sm" onPress={() => copyToClipboard(latexTable)}>
                                        <FontAwesomeIcon icon={faClipboard} className="mr-1" /> Copy to clipboard
                                    </Button>
                                </div>
                            </>
                        )}
                        {selectedTab === 'references' && (
                            <>
                                <textarea
                                    aria-label="BibTeX references output"
                                    className={textareaClass}
                                    value={!bibtexReferencesLoading ? bibTexReferences : 'Loading...'}
                                    readOnly
                                    rows={15}
                                />
                                <div className="flex justify-end mt-3">
                                    <Button variant="primary" size="sm" onPress={() => copyToClipboard(bibTexReferences)}>
                                        <FontAwesomeIcon icon={faClipboard} className="mr-1" /> Copy to clipboard
                                    </Button>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ExportToLatex;
