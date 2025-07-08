import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zipObject } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { Button, Input, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import styled from 'styled-components';

import { getCitationByDOI } from '@/services/datacite/index';

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
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('Citation copied to clipboard');
        }
    }, [state.value]);

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

                            <Button
                                color="primary"
                                className="pl-3 pr-3 float-right"
                                size="sm"
                                onClick={() => copyToClipboard(citations[style.styleID])}
                            >
                                <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                            </Button>
                        </TabPane>
                    ))}
                </TabContent>
            </ModalBody>
        </Modal>
    );
};

export default ExportCitation;
