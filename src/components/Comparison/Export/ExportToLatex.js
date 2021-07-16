import { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink } from 'reactstrap';
import { getStatementsBySubject } from 'services/backend/statements';
import { createShortLink, getComparison } from 'services/similarity/index';
import Cite from 'citation-js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CustomInput } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import MakeLatex from 'make-latex';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import Tooltip from '../../Utils/Tooltip';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { PREDICATES } from 'constants/graphSettings';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

function ExportToLatex(props) {
    const [selectedTab, setSelectedTab] = useState('table');
    const [latexTableLoading, setLatexTableLoading] = useState(true);
    const [bibtexReferencesLoading, setBibtexReferencesLoading] = useState(true);
    const [replaceTitles, setReplaceTitles] = useState(true);
    const [includeFootnote, setIncludeFootnote] = useState(true);
    const [latexTable, setLatexTable] = useState('');
    const [bibTexReferences, setBibTexReferences] = useState('');

    const generateLatex = async () => {
        setLatexTableLoading(true);

        if (props.data.length === 0) {
            return '';
        }

        const res = [];
        let transposedData;
        let newTitles = null;
        let nbColumns = 0;

        if (!props.transpose) {
            transposedData = props.data[0].map((col, i) => props.data.map(row => row[i]));

            if (replaceTitles) {
                newTitles = ['\\textbf{Title}'];
                const conTitles = ['Title'];
                transposedData[0].forEach((title, i) => {
                    if (i > 0) {
                        newTitles.push(`\\textbf{\\cite{${props.contributions[i - 1].paperId}}} `);
                        conTitles.push(`${props.contributions[i - 1].id}`);
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
            props.data.forEach((contribution, i) => {
                if (i > 0) {
                    const con = {};
                    contribution.forEach((item, j) => {
                        if (replaceTitles && j === 0) {
                            item = `\\textbf{\\cite{${props.contributions[i - 1].paperId}}}`;
                        }
                        con[`\\textit{${props.data[0][j]}}`] = item !== 'undefined' ? item : '-';
                    });
                    res.push(con);
                }
            });
            nbColumns = props.data[0].length;
        }

        let latexTable;

        if (res.length > 0) {
            let caption = 'This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}';
            let label = 'tab:ORKG';
            if (props.comparisonId && props.title) {
                caption = `${props.title} - ${props.description}`;
                label = `tab:${props.comparisonId}`;
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
                caption: caption,
                label: label
            };

            if (newTitles) {
                makeLatexOptions.colnames = newTitles;
            }

            latexTable = MakeLatex(res, makeLatexOptions);

            // Add a persistent link to this page as a footnote
            if (includeFootnote) {
                if (props.comparisonId && props.responseHash) {
                    const link = `${props.publicURL}${reverse(ROUTES.COMPARISON, { comparisonId: props.comparisonId })}`;
                    props.setShortLink(link);
                    latexTable += `\n\\footnotetext{${link} [accessed ${moment().format('YYYY MMM DD')}]}`;
                    setLatexTable(latexTable);
                    setLatexTableLoading(false);
                } else {
                    if (!props.shortLink) {
                        let link = ``;
                        if (!props.responseHash) {
                            const saveComparison = await getComparison({
                                contributionIds: props.contributionsList,
                                type: props.comparisonType,
                                save_response: true
                            });
                            link = `${props.publicURL}${reverse(ROUTES.COMPARISON)}${props.comparisonURLConfig}&response_hash=${
                                saveComparison.response_hash
                            }`;
                            props.setResponseHash(saveComparison.response_hash);
                        } else {
                            link = `${props.publicURL}${reverse(ROUTES.COMPARISON)}${props.comparisonURLConfig}`;
                        }
                        return createShortLink({
                            long_url: link
                        })
                            .then(data => {
                                const shortLink = `${props.publicURL}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                                latexTable += `\n\\footnotetext{${shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                                props.setShortLink(shortLink);
                                setLatexTable(latexTable);
                                setLatexTableLoading(false);
                            })
                            .catch(e => {
                                console.log(e);
                                latexTable += `\n\\footnotetext{${link}} [accessed ${moment().format('YYYY MMM DD')}]}`;
                                setLatexTable(latexTable);
                                setLatexTableLoading(false);
                            });
                    } else {
                        latexTable += `\n\\footnotetext{${props.shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                        setLatexTable(latexTable);
                        setLatexTableLoading(false);
                    }
                }
            } else {
                setLatexTable(latexTable);
                setLatexTableLoading(false);
            }
        } else {
            latexTable = "The current comparison table doesn't contain any pieces of information to export. Please re-try with different options.";
            setLatexTable(latexTable);
            setLatexTableLoading(false);
        }
    };

    const parsePaperStatements = paperStatements => {
        // publication year
        let publicationYear = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR);

        if (publicationYear.length > 0) {
            publicationYear = publicationYear[0].object.label;
        }

        // authors
        const authors = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR);

        const authorNamesArray = [];

        if (authors.length > 0) {
            for (const author of authors) {
                const authorName = author.object.label;
                authorNamesArray.push(authorName);
            }
        }

        return { authors: authorNamesArray.reverse(), publicationYear };
    };

    const createCiteBibtex = (contribution, paperStatements) => {
        let ref;
        if (paperStatements) {
            const contributionData = parsePaperStatements(paperStatements);
            const authors = contributionData.authors.map(a => ({ literal: a }));
            ref = new Cite({
                id: contribution.paperId,
                title: contribution.title,
                author: authors.length > 0 ? authors : null,
                issued: { 'date-parts': [[contributionData.publicationYear]] }
            });
        } else {
            ref = new Cite({
                id: contribution.paperId,
                title: contribution.title
            });
        }
        return ref;
    };

    const generateBibTex = () => {
        setBibtexReferencesLoading(true);
        if (props.contributionsList.length === 0) {
            setBibTexReferences('');
            setBibtexReferencesLoading(false);
            return '';
        }
        const contributions = props.contributions.map(contribution => {
            // Fetch the data of each contribution
            return getStatementsBySubject({ id: contribution.paperId })
                .then(paperStatements => {
                    let publicationDOI = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_DOI);
                    if (publicationDOI.length > 0) {
                        publicationDOI = publicationDOI[0].object.label;
                        if (publicationDOI !== '') {
                            return Cite.async(publicationDOI)
                                .catch(() => {
                                    return createCiteBibtex(contribution, paperStatements);
                                })
                                .then(data => {
                                    contribution.bibtex = data;
                                    return contribution;
                                });
                        }
                    }
                    contribution.bibtex = createCiteBibtex(contribution, paperStatements);
                    return contribution;
                })
                .catch(error => {
                    contribution.bibtex = createCiteBibtex(contribution, null);
                    return contribution;
                });
        });
        const orkgCitation = Cite.async('10.1145/3360901.3364435').then();
        return Promise.all([...contributions, orkgCitation]).then(contributions => {
            const res = [];
            const paperIds = [];
            const bibtexOptions = {
                output: {
                    type: 'string',
                    style: 'bibtex'
                }
            };
            contributions.forEach((contribution, i) => {
                if (contribution.paperId) {
                    if (!paperIds.includes(contribution.paperId)) {
                        paperIds.push(contribution.paperId);
                        contribution.bibtex.options(bibtexOptions);
                        contribution.bibtex = contribution.bibtex.get();
                        const refID = contribution.bibtex.substring(contribution.bibtex.indexOf('{') + 1, contribution.bibtex.indexOf(','));
                        contribution.bibtex = contribution.bibtex.replace(refID, contribution.paperId);
                        res.push(contribution.bibtex);
                    }
                } else {
                    contribution.options(bibtexOptions);
                    res.push(contribution.get());
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
            isOpen={props.showDialog}
            toggle={props.toggle}
            size="lg"
            onOpened={() => {
                if (!props.shortLink) {
                    generateLatex();
                    generateBibTex();
                }
            }}
        >
            <ModalHeader toggle={props.toggle}>LaTeX export</ModalHeader>
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

                        <div className="float-left mt-1">
                            <Tooltip message="Since contribution titles can be long, it is sometimes better to replace the title by a reference like: Paper [1], Paper [2]...">
                                <CustomInput
                                    className="float-left"
                                    type="checkbox"
                                    id="replaceTitles"
                                    label="Replace contribution titles by reference "
                                    onChange={() => setReplaceTitles(v => !v)}
                                    checked={replaceTitles}
                                />
                                {'. '}
                            </Tooltip>
                            <br />
                            <CustomInput
                                className="float-left"
                                type="checkbox"
                                id="includeFootnote"
                                label="Include a persistent link to this page as a footnote "
                                onChange={() => setIncludeFootnote(v => !v)}
                                checked={includeFootnote}
                            />
                            {'. '}
                        </div>

                        <CopyToClipboard
                            id="copyToClipboardLatex"
                            text={latexTable}
                            onCopy={() => {
                                toast.dismiss();
                                toast.success(`Latex copied!`);
                            }}
                        >
                            <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                <Icon icon={faClipboard} /> Copy to clipboard
                            </Button>
                        </CopyToClipboard>
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
                                toast.success(`Bibtex copied!`);
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
}

ExportToLatex.propTypes = {
    data: PropTypes.array.isRequired,
    contributions: PropTypes.array.isRequired,
    properties: PropTypes.array.isRequired,
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
    responseHash: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    comparisonId: PropTypes.string,
    contributionsList: PropTypes.array,
    setResponseHash: PropTypes.func.isRequired,
    shortLink: PropTypes.string.isRequired,
    setShortLink: PropTypes.func.isRequired,
    comparisonType: PropTypes.string,
    comparisonURLConfig: PropTypes.string.isRequired,
    publicURL: PropTypes.string.isRequired
};

export default ExportToLatex;
