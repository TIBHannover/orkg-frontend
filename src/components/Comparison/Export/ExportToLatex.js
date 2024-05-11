import { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, FormGroup, Label } from 'reactstrap';
import { getStatementsBySubject } from 'services/backend/statements';
import { Cite } from '@citation-js/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import MakeLatex from 'make-latex';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes';
import Tooltip from 'components/Utils/Tooltip';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { useSelector } from 'react-redux';

import moment from 'moment';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { getComparisonURLConfigOfReduxState, activatedContributionsToList } from 'components/Comparison/hooks/helpers';
import { getMatrixOfComparison } from 'slices/comparisonSlice';
import { PREDICATES } from 'constants/graphSettings';
import { addAuthorsToStatements, getPublicUrl } from 'utils';
import { clone } from 'lodash';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

const ExportToLatex = ({ showDialog, toggle }) => {
    const [selectedTab, setSelectedTab] = useState('table');
    const [latexTableLoading, setLatexTableLoading] = useState(true);
    const [bibtexReferencesLoading, setBibtexReferencesLoading] = useState(true);
    const [replaceTitles, setReplaceTitles] = useState(true);
    const [includeFootnote, setIncludeFootnote] = useState(true);
    const [latexTable, setLatexTable] = useState('');
    const [bibTexReferences, setBibTexReferences] = useState('');

    const matrixData = useSelector((state) => getMatrixOfComparison(state.comparison));
    const contributions = useSelector((state) => state.comparison.contributions.filter((c) => c.active));
    const { label, id, description } = useSelector((state) => state.comparison.comparisonResource);

    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const contributionsList = useSelector((state) => activatedContributionsToList(state.comparison.contributions));
    const comparisonURLConfig = useSelector((state) => getComparisonURLConfigOfReduxState(state.comparison));
    const generateLatex = async () => {
        setLatexTableLoading(true);
        if (matrixData.length === 0) {
            return '';
        }

        const res = [];
        let transposedData;
        let newTitles = null;
        let nbColumns = 0;

        if (!transpose) {
            transposedData = matrixData[0].map((col, i) => matrixData.map((row) => row[i]));

            if (replaceTitles) {
                newTitles = ['\\textbf{Title}'];
                const conTitles = ['Title'];
                transposedData[0].forEach((title, i) => {
                    if (i > 0) {
                        newTitles.push(`\\textbf{\\cite{${contributions[i - 1].paper_id}}} `);
                        conTitles.push(`${contributions[i - 1].id}`);
                    }
                });
                transposedData[0] = conTitles;
            }

            transposedData.forEach((contribution, i) => {
                if (i > 0) {
                    const con = {};
                    contribution.forEach((item, j) => {
                        con[transposedData[0][j]] = item !== 'undefined' ? (j === 0 ? `\\textit{${item}}` : item) : '-';
                    });
                    res.push(con);
                }
            });

            nbColumns = res.length > 0 ? Object.keys(res[0]).length : 0;
        } else {
            matrixData.forEach((contribution, i) => {
                if (i > 0) {
                    const con = {};
                    contribution.forEach((item, j) => {
                        if (replaceTitles && j === 0) {
                            item = `\\textbf{\\cite{${contributions[i - 1].paper_id}}}`;
                        }
                        con[`\\textit{${matrixData[0][j]}}`] = item !== 'undefined' ? item : '-';
                    });
                    res.push(con);
                }
            });
            nbColumns = matrixData[0].length;
        }

        let _latexTable;

        if (res.length > 0) {
            let caption = 'This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}';
            let title = 'tab:ORKG';
            if (id && label) {
                caption = `${label} - ${description}`;
                title = `tab:${id}`;
            }

            if (includeFootnote) {
                caption += ' \\protect \\footnotemark';
            }

            const makeLatexOptions = {
                digits: 2,
                spec: `|l|${Array(nbColumns - 1)
                    .fill('c')
                    .join('|')}|`,
                captionPlacement: 'top',
                caption,
                label: title,
            };

            if (newTitles) {
                makeLatexOptions.colnames = newTitles;
            }

            _latexTable = MakeLatex(res, makeLatexOptions);

            // Add a persistent link to this page as a footnote
            if (includeFootnote) {
                if (id) {
                    const link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: id })}`;
                    _latexTable += `\n\\footnotetext{${link} [accessed ${moment().format('YYYY MMM DD')}]}`;
                    setLatexTable(_latexTable);
                    setLatexTableLoading(false);
                } else {
                    let link = '';
                    link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}${comparisonURLConfig}`;
                    _latexTable += `\n\\footnotetext{${link}} [accessed ${moment().format('YYYY MMM DD')}]}`;
                    setLatexTable(_latexTable);
                    setLatexTableLoading(false);
                }
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

    const parsePaperStatements = (paperStatements) => {
        // publication year
        let publicationYear = paperStatements.filter((statement) => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR);

        if (publicationYear.length > 0) {
            publicationYear = publicationYear[0].object.label;
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

    const createCiteBibtex = (contribution, paperStatements) => {
        let ref;
        if (paperStatements) {
            const contributionData = parsePaperStatements(paperStatements);
            const authors = contributionData.authors.map((a) => ({ literal: a }));
            ref = new Cite({
                id: contribution.paper_id,
                title: contribution.title,
                author: authors.length > 0 ? authors : null,
                issued: { 'date-parts': [[contributionData.publicationYear]] },
            });
        } else {
            ref = new Cite({
                id: contribution.paper_id,
                title: contribution.title,
            });
        }
        return ref;
    };

    const generateBibTex = () => {
        setBibtexReferencesLoading(true);
        if (contributionsList.length === 0) {
            setBibTexReferences('');
            setBibtexReferencesLoading(false);
            return '';
        }
        const contributionsCalls = contributions.map((contribution) =>
            // Fetch the data of each contribution
            getStatementsBySubject({ id: contribution.paper_id })
                .then((_statements) => addAuthorsToStatements(_statements))
                .then((paperStatements) => {
                    const _contribution = clone(contribution);
                    let publicationDOI = paperStatements.filter((statement) => statement.predicate.id === PREDICATES.HAS_DOI);
                    if (publicationDOI.length > 0) {
                        publicationDOI = publicationDOI[0].object.label;
                        if (publicationDOI !== '') {
                            return Cite.async(publicationDOI)
                                .catch(() => createCiteBibtex(_contribution, paperStatements))
                                .then((data) => {
                                    _contribution.bibtex = data;
                                    return _contribution;
                                });
                        }
                    }
                    _contribution.bibtex = createCiteBibtex(_contribution, paperStatements);
                    return _contribution;
                })
                .catch(() => {
                    const _contribution = clone(contribution);
                    _contribution.bibtex = createCiteBibtex(contribution, null);
                    return _contribution;
                }),
        );
        const orkgCitation = Cite.async('10.1145/3360901.3364435').then();
        return Promise.all([...contributionsCalls, orkgCitation]).then((_contributions) => {
            const res = [];
            const paperIds = [];
            const bibtexOptions = {
                output: {
                    type: 'string',
                    style: 'bibtex',
                },
            };
            _contributions.forEach((contribution, i) => {
                const _contribution = clone(contribution);
                if (_contribution.paper_id) {
                    if (!paperIds.includes(_contribution.paper_id)) {
                        paperIds.push(_contribution.paper_id);
                        _contribution.bibtex.options(bibtexOptions);
                        _contribution.bibtex = _contribution.bibtex.get();
                        const refID = _contribution.bibtex.substring(_contribution.bibtex.indexOf('{') + 1, _contribution.bibtex.indexOf(','));
                        _contribution.bibtex = _contribution.bibtex.replace(refID, _contribution.paper_id);
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
            isOpen={showDialog}
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

                            <CopyToClipboard
                                id="copyToClipboardLatex"
                                text={latexTable}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success('Latex copied!');
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                        </div>
                    </>
                )}
                {selectedTab === 'references' && (
                    <>
                        <p>
                            <Textarea type="textarea" value={!bibtexReferencesLoading ? bibTexReferences : 'Loading...'} disabled rows="15" />
                        </p>

                        <CopyToClipboard
                            text={!bibtexReferencesLoading ? bibTexReferences : 'Loading...'}
                            onCopy={() => {
                                toast.dismiss();
                                toast.success('Bibtex copied!');
                            }}
                        >
                            <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                <Icon icon={faClipboard} /> Copy to clipboard
                            </Button>
                        </CopyToClipboard>
                    </>
                )}
            </ModalBody>
        </Modal>
    );
};

ExportToLatex.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default ExportToLatex;
