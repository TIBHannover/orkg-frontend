import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import React, { Component } from 'react';
import { getCitationByDOI } from 'services/datacite/index';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { zipObject } from 'lodash';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

class ExportCitation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTab: 'APA',
            citations: {}
        };

        this.CITATION_STYLES = [
            { styleID: 'apa', styleTabID: 'APA', styleLabel: 'APA', header: null },
            { styleID: 'ieee', styleTabID: 'IEEE', styleLabel: 'IEEE', header: null },
            { styleID: 'harvard3', styleTabID: 'Harvard', styleLabel: 'Harvard', header: null },
            { styleID: 'chicago-author-date', styleTabID: 'Chicago', styleLabel: 'Chicago', header: null },
            { styleID: 'bibtex', styleTabID: 'BibTeX', styleLabel: 'BibTeX', header: 'application/x-bibtex' }
        ];
    }

    getCitation = () => {
        Promise.all(
            this.CITATION_STYLES.map(s =>
                getCitationByDOI(this.props.DOI, s.header ? undefined : s.styleID, s.header ? s.header : undefined).catch(
                    error => 'Failed to load citation'
                )
            )
        ).then(citations => {
            this.setState({ citations: zipObject(this.CITATION_STYLES.map(s => s.styleID), citations) });
        });
    };

    selectTab = tab => {
        this.setState({
            selectedTab: tab
        });
    };

    render() {
        return (
            <Modal
                isOpen={this.props.showDialog}
                toggle={this.props.toggle}
                size="lg"
                onOpened={() => {
                    this.getCitation();
                }}
            >
                <ModalHeader toggle={this.props.toggle}>Export Citation</ModalHeader>
                <ModalBody>
                    <Nav tabs className="mb-4">
                        {this.CITATION_STYLES.map(style => (
                            <NavItem key={`navItem${style.styleTabID}`}>
                                <NavLink
                                    href="#"
                                    active={this.state.selectedTab === style.styleTabID}
                                    onClick={() => this.selectTab(style.styleTabID)}
                                >
                                    {style.styleLabel}
                                </NavLink>
                            </NavItem>
                        ))}
                    </Nav>
                    <TabContent activeTab={this.state.selectedTab}>
                        {this.CITATION_STYLES.map(style => (
                            <TabPane key={`tabPane${style.styleTabID}`} tabId={style.styleTabID}>
                                <p>
                                    <Textarea
                                        type="textarea"
                                        value={
                                            this.state.citations[style.styleID]
                                                ? this.state.citations[style.styleID].replace(/<[^>]+>/g, '')
                                                : 'Loading...'
                                        }
                                        disabled
                                        rows="10"
                                    />
                                </p>

                                <CopyToClipboard
                                    id={`copyToClipboard${style.styleID}`}
                                    text={this.state.citations[style.styleID] ? this.state.citations[style.styleID] : 'Loading...'}
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success(`${style.styleLabel} Citation Copied`);
                                    }}
                                >
                                    <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                        <Icon icon={faClipboard} /> Copy to clipboard
                                    </Button>
                                </CopyToClipboard>
                            </TabPane>
                        ))}
                    </TabContent>
                </ModalBody>
            </Modal>
        );
    }
}

ExportCitation.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    DOI: PropTypes.string
};

export default ExportCitation;
