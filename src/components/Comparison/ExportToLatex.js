import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Input, Button, Nav, NavItem, NavLink, Tooltip as ReactstrapTooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import MakeLatex from 'make-latex';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CustomInput } from 'reactstrap';
import Tooltip from '../Utils/Tooltip';
import queryString from 'query-string';
import { getStatementsBySubject, createShortLink } from '../../network';
import Cite from 'citation-js';
import moment from 'moment';


const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85%!important;
`;

class ExportToLatex extends Component {

    constructor(props) {
        super(props);

        this.state = {
            latexTable: '',
            latexTableLoading: true,
            selectedTab: 'table',
            bibtexReferences: '',
            bibtexReferencesLoading: true,
            replaceTitles: false,
            includeFootnote: false,
            shortLink: null,
            showTooltipCopiedBibtex: false,
            showTooltipCopiedLatex: false
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.location.href !== prevProps.location.href) {
            this.setState({ shortLink: null });
        }
        if (this.props.contributions !== prevProps.contributions) {
            this.setState({ shortLink: null });
            this.generateBibTex();
        }
        if (this.props.showDialog === true && this.props.showDialog !== prevProps.showDialog) {
            this.setState({ shortLink: null });
            this.generateLatex();
        }
    }

    generateLatex = () => {
        this.setState({ latexTableLoading: true });

        if (this.props.data.length === 0) {
            return '';
        }

        let res = [];
        let transposedData;
        let newTitles = null;
        let nbColumns = 0;

        if (!this.props.transpose) {
            transposedData = this.props.data[0].map((col, i) => this.props.data.map(row => row[i]));

            if (this.state.replaceTitles) {
                newTitles = ['Title'];
                let conTitles = ['Title'];
                transposedData[0].forEach((title, i) => {
                    if (i > 0) {
                        newTitles.push(` \\cite{${this.props.contributions[i - 1].paperId}} `);
                        conTitles.push(`${this.props.contributions[i - 1].id}`)
                    }
                });
                transposedData[0] = conTitles
            }

            transposedData.forEach((contribution, i) => {
                if (i > 0) {
                    let con = {};
                    contribution.forEach((item, j) => {
                        con[transposedData[0][j]] = item !== 'undefined' ? item : '-';
                    });
                    res.push(con);
                }
            });

            nbColumns = res.length > 0 ? Object.keys(res[0]).length : 0;
        } else {
            this.props.data.forEach((contribution, i) => {
                if (i > 0) {
                    let con = {};
                    contribution.forEach((item, j) => {
                        if (this.state.replaceTitles && j === 0) {
                            item = ` \\cite{${this.props.contributions[i - 1].paperId}}`;
                        }
                        con[this.props.data[0][j]] = item !== 'undefined' ? item : '-';
                    });
                    res.push(con);
                }
            });
            nbColumns = this.props.data[0].length
        }

        let latexTable;


        if (res.length > 0) {
            let caption = 'This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}'
            if (this.state.includeFootnote) {
                caption += ' \\protect \\footnotemark';
            }

            let makeLatexOptions = {
                'digits': 2,
                'spec': `|${Array(nbColumns).fill('c').join('|')}|`,
                'captionPlacement': 'top',
                'caption': caption,
            }

            if (newTitles) {
                makeLatexOptions.colnames = newTitles;
            }

            latexTable = MakeLatex(res, makeLatexOptions);

            // Add a persistent link to this page as a footnote
            if (this.state.includeFootnote) {
                if (!this.state.shortLink) {
                    let link = queryString.parse(this.props.location.search).response_hash ? this.props.location.href : this.props.location.href + `${this.props.location.href.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
                    createShortLink({
                        long_url: link,
                        response_hash: this.props.response_hash,
                        contributions: this.props.contributions.map(c => c.id),
                        properties: this.props.properties.filter(p => p.active).map(p => p.id),
                        transpose: this.props.transpose,
                    }).catch((e) => {
                        console.log(e);
                        latexTable += `\n\\footnotetext{${link}} [accessed ${moment().format('YYYY MMM DD')}]}`;
                        this.setState({ latexTable: latexTable, latexTableLoading: false });
                    }).then((data) => {
                        let shortLink = `${this.props.location.protocol}//${this.props.location.host}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                        latexTable += `\n\\footnotetext{${shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                        this.setState({ shortLink: shortLink, latexTable: latexTable, latexTableLoading: false });
                    })
                } else {
                    latexTable += `\n\\footnotetext{${this.state.shortLink} [accessed ${moment().format('YYYY MMM DD')}]}`;
                    this.setState({ latexTable: latexTable, latexTableLoading: false });
                }

            } else {
                this.setState({ latexTable: latexTable, latexTableLoading: false });
            }
        } else {
            latexTable = 'The current comparison table doesn\'t contain any pieces of information to export. Please re-try with different options.'
            this.setState({ latexTable: latexTable, latexTableLoading: false });
        }


    }

    parsePaperStatements = (paperStatements) => {
        // publication year
        let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);

        if (publicationYear.length > 0) {
            publicationYear = publicationYear[0].object.label
        }

        // authors
        let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);

        let authorNamesArray = [];

        if (authors.length > 0) {
            for (let author of authors) {
                let authorName = author.object.label;
                authorNamesArray.push(authorName);
            }
        }

        return { authorNames: authorNamesArray.reverse(), publicationYear }
    }

    createCiteBibtex = (contribution, paperStatements) => {
        let ref
        if (paperStatements) {
            let contributionData = this.parsePaperStatements(paperStatements);
            ref = new Cite({
                id: contribution.paperId,
                title: contribution.title,
                author: contributionData.authorNames.map(a => ({ 'literal': a })),
                issued: { 'date-parts': [[contributionData.publicationYear]] }
            })
        } else {
            ref = new Cite({
                id: contribution.paperId,
                title: contribution.title
            })
        }
        return ref
    }

    generateBibTex = () => {
        this.setState({ bibtexReferencesLoading: true });
        if (this.props.contributions.length === 0) {
            this.setState({ bibtexReferences: '', bibtexReferencesLoading: false });
            return '';
        }
        let contributions = this.props.contributions.map((contribution) => {
            // Fetch the data of each contribution
            return getStatementsBySubject(contribution.paperId).then((paperStatements) => {
                let publicationDOI = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_DOI);
                if (publicationDOI.length > 0) {
                    publicationDOI = publicationDOI[0].object.label
                    if (publicationDOI !== '') {
                        return Cite.async(publicationDOI).catch(() => {
                            return this.createCiteBibtex(contribution, paperStatements);
                        }).then((data) => {
                            contribution.bibtex = data;
                            return contribution;
                        })
                    }
                }
                contribution.bibtex = this.createCiteBibtex(contribution, paperStatements);
                return contribution;
            }).catch((error) => {
                contribution.bibtex = this.createCiteBibtex(contribution, null);
                return contribution;
            })

        });
        let orkgCitation = Cite.async('10.5281/zenodo.1157185').then()
        return Promise.all([...contributions, orkgCitation]).then((contributions) => {
            let res = [];
            let paperIds = [];
            let bibtexOptions = {
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
                        let refID = contribution.bibtex.substring(contribution.bibtex.indexOf('{') + 1, contribution.bibtex.indexOf(','));
                        contribution.bibtex = contribution.bibtex.replace(refID, contribution.paperId)
                        res.push(contribution.bibtex);
                    }
                } else {
                    contribution.options(bibtexOptions);
                    res.push(contribution.get());
                }
            });
            this.setState({ bibTexReferences: res.join('\n'), bibtexReferencesLoading: false });
        });
    }

    selectTab = (tab) => {
        this.setState({
            selectedTab: tab
        });
    }

    toggleCheckbox = (type) => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }), () => { this.generateLatex(); });
    }

    toggleTooltip = (e, type) => {
        if (e && e.type !== 'mouseover') {
            this.setState(prevState => ({
                [type]: !prevState[type],
            }));
        }
    }

    render() {

        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>LaTeX export</ModalHeader>
                <ModalBody>
                    <Nav tabs className="mb-4">
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'table'} onClick={() => this.selectTab('table')}>LaTeX table</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'references'} onClick={() => this.selectTab('references')}>BibTeX references</NavLink>
                        </NavItem>
                    </Nav>

                    {this.state.selectedTab === 'table' &&
                        <>
                            <p>
                                <Textarea type="textarea" value={!this.state.latexTableLoading ? this.state.latexTable : 'Loading...'} disabled rows="15" />
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
                                    />{'. '}
                                </Tooltip>
                                <br />
                                <CustomInput
                                    className="float-left"
                                    type="checkbox"
                                    id={'includeFootnote'}
                                    label="Include a persistent link to this page as a footnote "
                                    onChange={() => this.toggleCheckbox('includeFootnote')}
                                    checked={this.state.includeFootnote}
                                />{'. '}
                            </div>

                            <CopyToClipboard id="copyToClipboardLatex" text={this.state.latexTable} onCopy={() => { this.setState({ showTooltipCopiedLatex: true }); }}>
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3 float-right"
                                    size="sm"

                                >
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>

                            </CopyToClipboard>
                            <ReactstrapTooltip placement="top" target="copyToClipboardLatex" trigger={'hover'} toggle={(e) => this.toggleTooltip(e, 'showTooltipCopiedLatex')} isOpen={this.state.showTooltipCopiedLatex}>
                                Copied!
                            </ReactstrapTooltip>
                        </>}
                    {this.state.selectedTab === 'references' &&
                        <>
                            <p>
                                <Textarea type="textarea" value={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'} disabled rows="15" />
                            </p>

                            <CopyToClipboard id="copyToClipboardBibtex" text={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'} onCopy={() => { this.setState({ showTooltipCopiedBibtex: true }); }}>
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3 float-right"
                                    size="sm"
                                >
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip placement="top" target="copyToClipboardBibtex" trigger={'hover'} toggle={(e) => this.toggleTooltip(e, 'showTooltipCopiedBibtex')} isOpen={this.state.showTooltipCopiedBibtex}>
                                Copied!
                            </ReactstrapTooltip>
                        </>}
                </ModalBody>
            </Modal>
        )
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
}

export default ExportToLatex;