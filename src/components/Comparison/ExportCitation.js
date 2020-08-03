import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Tooltip as ReactstrapTooltip } from 'reactstrap';
import React, { Component } from 'react';
import { getCitationByDOI } from 'network';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import styled from 'styled-components';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

class ExportCitation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            latexTableLoading: true,
            bibtexReferencesLoading: true,
            selectedTab: 'APA',
            latexTable: '',
            citations: {},
            isLoadingBiBTeX: false,
            citationBibTeX: '',
            values: [],
            showTooltipCopiedAPA: false,
            showTooltipCopiedIEEE: false,
            showTooltipCopiedHarvard: false,
            showTooltipCopiedBibTeX: false,
            showTooltipCopiedChi: false
        };
    }

    getCitation = () => {
        const styles = ['apa', 'ieee', 'harvard3', 'chicago-author-date'];
        styles.map(s => {
            this.setState(prevState => ({ citations: { ...prevState.citations, [s]: { citation: 'test', loading: true } } }));
        });

        Promise.all(
            styles.map(s =>
                getCitationByDOI(this.props.DOI, s)
                    .then(data => {
                        this.setState(prevState => ({ citations: { ...prevState.citations, [s]: { citation: data, loading: false } } }));
                    })
                    .catch(error => {
                        this.setState(prevState => ({ citations: { ...prevState.citations, [s]: { citation: 'failed to load', loading: true } } }));
                    })
            )
        );
    };

    getCitationBibTeX = () => {
        this.setState({ isLoadingBibTeX: true });
        if (this.props.DOI) {
            getCitationByDOI(this.props.DOI, '', 'application/x-bibtex')
                .then(response => {
                    this.setState({
                        citationBibTeX: response,
                        isLoadingBibTeX: false
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoadingBibTeX: false
                    });
                });
        }
    };

    selectTab = tab => {
        this.setState({
            selectedTab: tab
        });
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
            <Modal
                isOpen={this.props.showDialog}
                toggle={this.props.toggle}
                size="lg"
                onOpened={() => {
                    this.getCitation();
                    this.getCitationBibTeX();
                }}
            >
                <ModalHeader toggle={this.props.toggle}>Export Citation</ModalHeader>
                <ModalBody>
                    <Nav tabs className="mb-4">
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'APA'} onClick={() => this.selectTab('APA')}>
                                APA
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'IEEE'} onClick={() => this.selectTab('IEEE')}>
                                IEEE
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'Harvard'} onClick={() => this.selectTab('Harvard')}>
                                Harvard
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'Chicago'} onClick={() => this.selectTab('Chicago')}>
                                Chicago
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={this.state.selectedTab === 'BibTeX'} onClick={() => this.selectTab('BibTeX')}>
                                BibTeX
                            </NavLink>
                        </NavItem>
                    </Nav>

                    {this.state.selectedTab === 'APA' && this.state.citations['apa'] && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.citations['apa'].loading ? this.state.citations['apa'].citation : 'Loading...'}
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardAPA"
                                text={!this.state.citations['apa'].loading ? this.state.citations['apa'].citation : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedAPA: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardAPA"
                                trigger="hover"
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedAPA')}
                                isOpen={this.state.showTooltipCopiedAPA}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                    {this.state.selectedTab === 'IEEE' && this.state.citations['ieee'] && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.citations['ieee'].loading ? this.state.citations['ieee'].citation : 'Loading...'}
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardIEEE"
                                text={!this.state.citations['ieee'].loading ? this.state.citations['ieee'].citation : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedIEEE: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardIEEE"
                                trigger="hover"
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedIEEE')}
                                isOpen={this.state.showTooltipCopiedIEEE}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                    {this.state.selectedTab === 'Harvard' && this.state.citations['harvard3'] && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.citations['harvard3'].loading ? this.state.citations['harvard3'].citation : 'Loading...'}
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardHarvard"
                                text={!this.state.citations['harvard3'].loading ? this.state.citations['harvard3'].citation : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedHarvard: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardHarvard"
                                trigger="hover"
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedHarvard')}
                                isOpen={this.state.showTooltipCopiedHarvard}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                    {this.state.selectedTab === 'Chicago' && this.state.citations['chicago-author-date'] && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={
                                        !this.state.citations['chicago-author-date'].loading
                                            ? this.state.citations['chicago-author-date'].citation
                                            : 'Loading...'
                                    }
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardChi"
                                text={
                                    !this.state.citations['chicago-author-date'].loading
                                        ? this.state.citations['chicago-author-date'].citation
                                        : 'Loading...'
                                }
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedChi: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardChi"
                                trigger="hover"
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedChi')}
                                isOpen={this.state.showTooltipCopiedChi}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    )}
                    {this.state.selectedTab === 'BibTeX' && (
                        <>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={!this.state.isLoadingBibTeX ? this.state.citationBibTeX : 'Loading...'}
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardChi"
                                text={!this.state.isLoadingBibTeX ? this.state.citationBibTeX : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedBibTeX: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardChi"
                                trigger="hover"
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedChi')}
                                isOpen={this.state.showTooltipCopiedBibTeX}
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

ExportCitation.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    DOI: PropTypes.string,
    comparisonId: PropTypes.string
};

export default ExportCitation;
