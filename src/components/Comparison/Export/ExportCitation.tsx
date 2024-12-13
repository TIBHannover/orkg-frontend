import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zipObject } from 'lodash';
import { FC, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { getCitationByDOI } from 'services/datacite/index';
import styled from 'styled-components';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

const CITATION_STYLES = [
    { styleID: 'apa', styleTabID: 'APA', styleLabel: 'APA', header: null },
    { styleID: 'ieee', styleTabID: 'IEEE', styleLabel: 'IEEE', header: null },
    { styleID: 'harvard3', styleTabID: 'Harvard', styleLabel: 'Harvard', header: null },
    { styleID: 'chicago-author-date', styleTabID: 'Chicago', styleLabel: 'Chicago', header: null },
    { styleID: 'bibtex', styleTabID: 'BibTeX', styleLabel: 'BibTeX', header: 'application/x-bibtex' },
];

type ExportCitationProps = {
    toggle: () => void;
    DOI: string;
};

const ExportCitation: FC<ExportCitationProps> = ({ toggle, DOI }) => {
    const [selectedTab, setSelectedTab] = useState('APA');
    const [citations, setCitations] = useState<{ [key: string]: string }>({});

    const getCitation = () => {
        Promise.all(
            CITATION_STYLES.map((s) =>
                getCitationByDOI(DOI, s.header ? undefined : s.styleID, s.header ? s.header : undefined).catch(() => 'Failed to load citation'),
            ),
        ).then((citations) => {
            setCitations(
                zipObject(
                    CITATION_STYLES.map((s) => s.styleID),
                    citations,
                ),
            );
        });
    };

    return (
        <Modal
            isOpen
            toggle={toggle}
            size="lg"
            onOpened={() => {
                getCitation();
            }}
        >
            <ModalHeader toggle={toggle}>Export citation</ModalHeader>
            <ModalBody>
                <Nav tabs className="mb-4">
                    {CITATION_STYLES.map((style) => (
                        <NavItem key={`navItem${style.styleTabID}`}>
                            <NavLink href="#" active={selectedTab === style.styleTabID} onClick={() => setSelectedTab(style.styleTabID)}>
                                {style.styleLabel}
                            </NavLink>
                        </NavItem>
                    ))}
                </Nav>
                <TabContent activeTab={selectedTab}>
                    {CITATION_STYLES.map((style) => (
                        <TabPane key={`tabPane${style.styleTabID}`} tabId={style.styleTabID}>
                            <p>
                                <Textarea
                                    type="textarea"
                                    value={citations[style.styleID] ? citations[style.styleID].replace(/<[^>]+>/g, '') : 'Loading...'}
                                    disabled
                                    rows="10"
                                />
                            </p>

                            <CopyToClipboard
                                text={citations[style.styleID] ? citations[style.styleID] : 'Loading...'}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success(`${style.styleLabel} citation copied`);
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </CopyToClipboard>
                        </TabPane>
                    ))}
                </TabContent>
            </ModalBody>
        </Modal>
    );
};

export default ExportCitation;
