import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Input, Button, Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import MakeLatex from 'make-latex';
import styled from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CustomInput } from 'reactstrap';
import Tooltip from '../Utils/Tooltip';
import { getStatementsBySubject } from '../../network';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85%!important;
`;

class ExportToLatex extends Component {

    constructor(props) {
        super(props);

        this.state = {
            latexTable: '',
            selectedTab: 'table',
            bibtexReferences: '',
            bibtexReferencesLoading: true,
            replaceTitles: false,
        }
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.contributions !== prevProps.contributions) {
            this.generateBibTex();
        }
    }

    generateLatex = () => {
        if (this.props.data.length === 0) {
            return '';
        }

        let res = [];
        let transposedData;

        if (this.props.transpose) {
            transposedData = this.props.data[0].map((col, i) => this.props.data.map(row => row[i]));

            if (this.state.replaceTitles) {
                let newTitles = ['Title'];
                transposedData[0].forEach((title, i) => {
                    if (i > 0) {
                        newTitles.push(` \\cite{${this.props.contributions[i-1].paperId}}`);
                    }
                });
                transposedData[0] = newTitles;
            }

            transposedData.forEach((contribution, i) => {
                if (i > 0) {
                    let con = {};
                    contribution.forEach((item, j) => {
                        con[transposedData[0][j]] = item;
                    });
                    res.push(con);
                }
            });
        } else {
            this.props.data.forEach((contribution, i) => {
                if (i > 0) {
                    let con = {};
                    contribution.forEach((item, j) => {
                        if (this.state.replaceTitles && j === 0) {
                            item = ` \\cite{${this.props.contributions[i-1].paperId}}`;
                        }
                        con[this.props.data[0][j]] = item;
                    });
                    res.push(con);
                }
            });
        }

        let latexTable = MakeLatex(res, {
            'digits': 2,
        });

        // remove the hline for the header when the table is transposed 
        if (this.props.transpose) {
            latexTable = latexTable.replace(String.fromCharCode(92) + 'hline', '');
        }

        return latexTable;
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
                contribution.paper = {
                    publicationYear,
                    authorNames: authorNamesArray.reverse(), // statements are ordered desc, so first author is last => thus reverse
                }
                return contribution;
            })

        });

        Promise.all(contributions).then((contributions) => {
            let res = [];
            contributions.forEach((contribution, i) => {
                res.push(`@article{${contribution.paperId},\n author={${contribution.paper.authorNames.join(',')}},\n title={${contribution.title}},\n year={${contribution.paper.publicationYear}}\n}`);
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
            replaceTitles: !prevState.replaceTitles,
        }));
    }

    render() {
        let latexTable;

        if (this.props.showDialog) {
            latexTable = this.generateLatex();
        }

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
                                <Textarea type="textarea" value={latexTable} disabled rows="15" />
                            </p>

                            <div className="float-left mt-1">
                                <Tooltip message="Since contribution titles can be long, it is sometimes better to replace the title by a reference like: Paper [1], Paper [2]...">
                                    <CustomInput
                                        className="float-left"
                                        type="checkbox"
                                        id={'replaceTitles'}
                                        label="Replace contribution titles by reference "
                                        onChange={this.toggleCheckbox}
                                        checked={this.state.replaceTitles}
                                    />{'. '}
                                </Tooltip>
                            </div>

                            <CopyToClipboard text={latexTable}>
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3 float-right"
                                    size="sm"
                                >
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                        </>}
                    {this.state.selectedTab === 'references' &&
                        <>
                            <p>
                                <Textarea type="textarea" value={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'} disabled rows="15" />
                            </p>

                            <CopyToClipboard text={!this.state.bibtexReferencesLoading ? this.state.bibTexReferences : 'Loading...'}>
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3 float-right"
                                    size="sm"
                                >
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                        </>}
                </ModalBody>
            </Modal>
        )
    }
}

ExportToLatex.propTypes = {
    data: PropTypes.array.isRequired,
    contributions: PropTypes.array.isRequired,
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
}

export default ExportToLatex;