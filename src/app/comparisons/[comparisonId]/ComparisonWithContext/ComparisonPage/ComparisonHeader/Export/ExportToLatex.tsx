import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { clone } from 'lodash';
// @ts-expect-error package doesn't support typescript
import MakeLatex from 'make-latex';
import { reverse } from 'named-urls';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';

import generateMatrix from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/generateMatrix';
import useComparisonExport from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Nav from '@/components/Ui/Nav/Nav';
import NavItem from '@/components/Ui/Nav/NavItem';
import NavLink from '@/components/Ui/Nav/NavLink';
import Tooltip from '@/components/Utils/Tooltip';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getStatements } from '@/services/backend/statements';
import { ComparisonTableColumn, Statement } from '@/services/backend/types';
import { addAuthorsToStatements, getPublicUrl } from '@/utils';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

type ExportToLatexProps = {
    toggle: () => void;
};
const ExportToLatex: FC<ExportToLatexProps> = ({ toggle }) => {
    const [selectedTab, setSelectedTab] = useState('table');
    const [latexTableLoading, setLatexTableLoading] = useState(true);
    const [bibtexReferencesLoading, setBibtexReferencesLoading] = useState(true);
    const [replaceTitles, setReplaceTitles] = useState(true);
    const [includeFootnote, setIncludeFootnote] = useState(true);
    const [latexTable, setLatexTable] = useState('');
    const [bibTexReferences, setBibTexReferences] = useState('');
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
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

        const res: {
            [key: string]: string;
        }[] = [];
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

            // Add a persistent link to this page as a footnote
            if (includeFootnote) {
                const link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: comparison?.id ?? '' })}`;
                _latexTable += `\n\\footnotetext{${link} [accessed ${dayjs().format('YYYY MMM DD')}]}`;
                setLatexTable(_latexTable);
                setLatexTableLoading(false);
            } else {
                setLatexTable(_latexTable);
                setLatexTableLoading(false);
            }
        } else {
            _latexTable = "The current comparison table doesn't contain any pieces of information to export. Please re-try with different options.";
            setLatexTable(_latexTable);
            setLatexTableLoading(false);
        }
    };

    const parsePaperStatements = (paperStatements: Statement[]) => {
        // publication year
        const publicationYearStatements = paperStatements.filter((statement) => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR);
        let publicationYear: string | null = null;
        if (publicationYearStatements.length > 0) {
            publicationYear = publicationYearStatements[0].object.label;
        }

        // authors
        const authorsList = paperStatements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS);
        const authors = paperStatements.filter((statement) => statement.subject.id === authorsList?.object.id);

        const authorNamesArray = [];

        if (authors.length > 0) {
            for (const author of authors) {
                const authorName = author.object.label;
                authorNamesArray.push(authorName);
            }
        }

        return { authors: authorNamesArray, publicationYear };
    };

    const createCiteBibtex = (column: ComparisonTableColumn, paperStatements: Statement[] | null) => {
        let ref;
        if (paperStatements) {
            const contributionData = parsePaperStatements(paperStatements);
            const authors = contributionData.authors.map((a) => ({ literal: a }));
            ref = new Cite({
                id: column.title?.id || '',
                title: column.title?.label || '',
                author: authors.length > 0 ? authors : null,
                issued: { 'date-parts': [[contributionData.publicationYear]] },
            });
        } else {
            ref = new Cite({
                id: column.title?.id || '',
                title: column.title?.label || '',
            });
        }
        return ref;
    };

    const generateBibTex = () => {
        setBibtexReferencesLoading(true);
        // only generate a bibtex for paper sources
        const papers = columns.filter((column) => column.title.classes.includes(CLASSES.PAPER));
        if (papers.length === 0) {
            setBibTexReferences('');
            setBibtexReferencesLoading(false);
            return '';
        }

        const contributionsCalls: Promise<ComparisonTableColumn>[] = papers.map((column) =>
            // Fetch the data of each contribution
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
            const bibtexOptions = {
                output: {
                    type: 'string',
                    style: 'bibtex',
                },
            };
            _contributions.forEach((contribution, i) => {
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

    /**
     * Update latex
     */
    useEffect(() => {
        generateLatex();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replaceTitles, includeFootnote]);

    return (
        <Modal
            isOpen
            toggle={toggle}
            size="lg"
            onOpened={() => {
                generateLatex();
                generateBibTex();
            }}
        >
            <ModalHeader toggle={toggle}>LaTeX export</ModalHeader>
            <ModalBody>
                <Nav tabs className="mb-4">
                    <NavItem>
                        <NavLink href="#" active={selectedTab === 'table'} onClick={() => setSelectedTab('table')}>
                            LaTeX table
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#" active={selectedTab === 'references'} onClick={() => setSelectedTab('references')}>
                            BibTeX references
                        </NavLink>
                    </NavItem>
                </Nav>

                {selectedTab === 'table' && (
                    <>
                        <p>
                            <Textarea type="textarea" value={!latexTableLoading ? latexTable : 'Loading...'} disabled rows="15" />
                        </p>
                        <div className="d-flex mt-1">
                            <div className="flex-grow-1">
                                <FormGroup check>
                                    <Tooltip message="Since contribution titles can be long, it is sometimes better to replace the title by a reference like: Paper [1], Paper [2]...">
                                        <Input
                                            className="float-start"
                                            type="checkbox"
                                            id="replaceTitles"
                                            onChange={() => setReplaceTitles((v) => !v)}
                                            checked={replaceTitles}
                                        />{' '}
                                        <Label check for="replaceTitles" className="mb-0">
                                            Replace contribution titles by reference.
                                        </Label>
                                    </Tooltip>
                                </FormGroup>
                                <FormGroup check>
                                    <Input
                                        className="float-start"
                                        type="checkbox"
                                        id="includeFootnote"
                                        onChange={() => setIncludeFootnote((v) => !v)}
                                        checked={includeFootnote}
                                    />{' '}
                                    <Label check for="includeFootnote" className="mb-0">
                                        Include a persistent link to this page as a footnote.
                                    </Label>
                                </FormGroup>
                            </div>

                            <Button color="primary" className="pl-3 pr-3 float-right" size="sm" onClick={() => copyToClipboard(latexTable)}>
                                <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                            </Button>
                        </div>
                    </>
                )}
                {selectedTab === 'references' && (
                    <>
                        <p>
                            <Textarea type="textarea" value={!bibtexReferencesLoading ? bibTexReferences : 'Loading...'} disabled rows="15" />
                        </p>

                        <Button color="primary" className="pl-3 pr-3 float-right" size="sm" onClick={() => copyToClipboard(bibTexReferences)}>
                            <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                        </Button>
                    </>
                )}
            </ModalBody>
        </Modal>
    );
};

export default ExportToLatex;
