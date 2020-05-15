import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Tooltip as ReactstrapTooltip } from 'reactstrap';
import React, { Component } from 'react';
import { createShortLink, getStatementsBySubject, getComparison } from 'network';

import Cite from 'citation-js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CustomInput } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import MakeLatex from 'make-latex';
import PropTypes from 'prop-types';
import ROUTES from '../../constants/routes.js';
import Tooltip from '../Utils/Tooltip';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import queryString from 'query-string';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { getContributionIdsFromUrl } from 'utils';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

class ExportToLatex extends Component {
    constructor(props) {
        super(props);

        this.state = {
            latexTableLoading: true,
            bibtexReferencesLoading: true,
            selectedTab: 'table',
            latexTable: '',
            bibtexReferences: '',
            replaceTitles: true,
            includeFootnote: true,
            shortLink: null,
            showTooltipCopiedBibtex: false,
            showTooltipCopiedLatex: false
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.location.href !== prevProps.location.href) {
            this.setState({ shortLink: null });
            this.generateLatex();
        }
        if (this.props.contributions !== prevProps.contributions) {
            this.setState({ shortLink: null });
            this.generateBibTex();
        }
        if (this.props.showDialog === true && this.props.showDialog !== prevProps.showDialog) {
            this.setState({ shortLink: null });
            this.generateLatex();
        }
    };

    generateLatex = async () => {
        this.setState({ latexTableLoading: true });

        if (this.props.data.length === 0) {
            return '';
        }

        const res = [];
        let transposedData;
        let newTitles = null;
        let nbColumns = 0;

        if (!this.props.transpose) {
            transposedData = this.props.data[0].map((col, i) => this.props.data.map(row => row[i]));

            if (this.state.replaceTitles) {
                newTitles = ['\\textbf{Title}'];
                const conTitles = ['Title'];
                transposedData[0].forEach((title, i) => {
                    if (i > 0) {
                        newTitles.push(`\\textbf{\\cite{${this.props.contributions[i - 1].paperId}}} `);
                        conTitles.push(`${this.props.contributions[i - 1].id}`);
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
            this.props.data.forEach((contribution, i) => {
                if (i > 0) {
                    const con = {};
                    contribution.forEach((item, j) => {
                        if (this.state.replaceTitles && j === 0) {
                            item = `\\textbf{\\cite{${this.props.contributions[i - 1].paperId}}}`;
                        }
                        con[`\\textit{${this.props.data[0][j]}}`] = item !== 'undefined' ? item : '-';
                    });
                    res.push(con);
                }
            });
            nbColumns = this.props.data[0].length;
        }

        let latexTable;

        if (res.length > 0) {
            let caption = 'This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}';
            let label = 'tab:ORKG';
            if (this.props.comparisonId && this.props.title) {
                caption = `${this.props.title} - ${this.props.description}`;
                label = `tab:${this.props.comparisonId}`;
            }

            if (this.state.includeFootnote) {
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
            if (this.state.includeFootnote) {
                if (!this.state.shortLink) {
                    let comparison;
                    if (!this.props.response_hash) {
                        const contributionIds = getContributionIdsFromUrl(this.props.location.href.substring(this.props.location.href.indexOf('?')));
                        comparison = await getComparison({ contributionIds: contributionIds, save_response: true });
                    }
                    const link = queryString.parse(this.props.location.search).response_hash
                        ? this.props.location.href
                        : this.props.location.href +
                          `${this.props.location.href.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${
                              this.props.response_hash ? this.props.response_hash : comparison.response_hash
                          }`;
                    return createShortLink({
                        long_url: link,
                        response_hash: this.props.response_hash ? this.props.response_hash : comparison.response_hash,
                        contributions: this.props.contributions.map(c => c.id),
                        properties: this.props.properties.filter(p => p.active).map(p => p.id),
                        transpose: this.props.transpose
                    })
                        .catch(e => {
                            console.log(e);
                            latexTable += `\n\\footnotetext{${link}} [accessed ${moment().format('YYYY MMM DD')}]}`;
                            this.setState({ latexTable: latexTable, latexTableLoading: false });
                        })
                        .then(data => {
                            let shortLink;
                            if (this.props.comparisonId) {
                                shortLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
                                    .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
                                    .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                            } else {
                                shortLink = `${this.props.location.protocol}//${window.location.host}${window.location.pathname.replace(
                                    reverse(ROUTES.COMPARISON),
                                    ''
                                )}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                            }
                            latexTable += `\n\\footnotetext{${shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                            this.setState({ shortLink: shortLink, latexTable: latexTable, latexTableLoading: false });
                        });
                } else {
                    latexTable += `\n\\footnotetext{${this.state.shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                    this.setState({ latexTable: latexTable, latexTableLoading: false });
                }
            } else {
                this.setState({ latexTable: latexTable, latexTableLoading: false });
            }
        } else {
            latexTable = "The current comparison table doesn't contain any pieces of information to export. Please re-try with different options.";
            this.setState({ latexTable: latexTable, latexTableLoading: false });
        }
    };

    parsePaperStatements = paperStatements => {
        // publication year
        let publicationYear = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);

        if (publicationYear.length > 0) {
            publicationYear = publicationYear[0].object.label;
        }

        // authors
        const authors = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);

        const authorNamesArray = [];

        if (authors.length > 0) {
            for (const author of authors) {
                const authorName = author.object.label;
                authorNamesArray.push(authorName);
            }
        }

        return { authorNames: authorNamesArray.reverse(), publicationYear };
    };

    createCiteBibtex = (contribution, paperStatements) => {
        let ref;
        if (paperStatements) {
            const contributionData = this.parsePaperStatements(paperStatements);
            const authors = contributionData.authorNames.map(a => ({ literal: a }));
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

    generateBibTex = () => {
        this.setState({ bibtexReferencesLoading: true });
        if (this.props.contributions.length === 0) {
            this.setState({ bibtexReferences: '', bibtexReferencesLoading: false });
            return '';
        }
        const contributions = this.props.contributions.map(contribution => {
            // Fetch the data of each contribution
            return getStatementsBySubject({ id: contribution.paperId })
                .then(paperStatements => {
                    let publicationDOI = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_DOI);
                    if (publicationDOI.length > 0) {
                        publicationDOI = publicationDOI[0].object.label;
                        if (publicationDOI !== '') {
                            return Cite.async(publicationDOI)
                                .catch(() => {
                                    return this.createCiteBibtex(contribution, paperStatements);
                                })
                                .then(data => {
                                    contribution.bibtex = data;
                                    return contribution;
                                });
                        }
                    }
                    contribution.bibtex = this.createCiteBibtex(contribution, paperStatements);
                    return contribution;
                })
                .catch(error => {
                    contribution.bibtex = this.createCiteBibtex(contribution, null);
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
            this.setState({ bibTexReferences: res.join('\n'), bibtexReferencesLoading: false });
        });
    };

    selectTab = tab => {
        this.setState({
            selectedTab: tab
        });
    };

    toggleCheckbox = type => {
        this.setState(
            prevState => ({
                [type]: !prevState[type]
            }),
            () => {
                this.generateLatex();
            }
        );
    };

    toggleTooltip = (e, type) => {
        if (e && e.type !== 'mouseover') {
            this.setState(prevState => ({
                [type]: !prevState[type]
            }));
        }
    };

    render() {
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>LaTeX export</ModalHeader>
                <ModalBody>
                    <Nav tabs className="mb-4">
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'table'} onClick={() => this.selectTab('table')}>
                                LaTeX table
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'references'} onClick={() => this.selectTab('references')}>
                                BibTeX references
                            </NavLink>
                        </NavItem>
                    </Nav>

                    {this.state.selectedTab === 'table' && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.latexTableLoading ? this.state.latexTable : 'Loading...'}
                                    disabled
                                    rows="15"
                                />
                            </p>

                            <div className="float-left mt-1">
                                <Tooltip message="Since contribution titles can be long, it is sometimes better to replace the title by a reference like: Paper [1], Paper [2]...">
                                    <CustomInput
                                        className="float-left"
                                        type="checkbox"
                                        id={'replaceTitles'}
                                        label="Replace contribution titles by reference "
                                        onChange={() => this.toggleCheckbox('replaceTitles')}
                                        checked={this.state.replaceTitles}
                                    />
                                    {'. '}
                                </Tooltip>
                                <br />
                                <CustomInput
                                    className="float-left"
                                    type="checkbox"
                                    id={'includeFootnote'}
                                    label="Include a persistent link to this page as a footnote "
                                    onChange={() => this.toggleCheckbox('includeFootnote')}
                                    checked={this.state.includeFootnote}
                                />
                                {'. '}
                            </div>

                            <CopyToClipboard
                                id="copyToClipboardLatex"
                                text={this.state.latexTable}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedLatex: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardLatex"
                                trigger={'hover'}
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedLatex')}
                                isOpen={this.state.showTooltipCopiedLatex}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                    {this.state.selectedTab === 'references' && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'}
                                    disabled
                                    rows="15"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardBibtex"
                                text={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedBibtex: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardBibtex"
                                trigger={'hover'}
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedBibtex')}
                                isOpen={this.state.showTooltipCopiedBibtex}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

ExportToLatex.propTypes = {
    data: PropTypes.array.isRequired,
    contributions: PropTypes.array.isRequired,
    properties: PropTypes.array.isRequired,
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    response_hash: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    comparisonId: PropTypes.string
};

export default ExportToLatex;
