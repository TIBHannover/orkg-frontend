import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Tabs, TextArea, toast } from '@heroui/react';
import { zipObject } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import { getCitationByDOI } from '@/services/datacite/index';

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
            toast.clear();
            toast.success('Citation copied to clipboard');
        }
    }, [state.value]);

    useEffect(() => {
        let cancelled = false;
        Promise.all(
            CITATION_STYLES.map((s) =>
                getCitationByDOI(DOI, s.header ? undefined : s.styleID, s.header ? s.header : undefined).catch(() => 'Failed to load citation'),
            ),
        ).then((c) => {
            if (cancelled) return;
            setCitations(
                zipObject(
                    CITATION_STYLES.map((s) => s.styleID),
                    c,
                ),
            );
        });
        return () => {
            cancelled = true;
        };
    }, [DOI]);

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Export citation</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(String(key))} className="w-full p-1">
                            <Tabs.ListContainer className="mb-6">
                                <Tabs.List aria-label="Citation format">
                                    {CITATION_STYLES.map((style) => (
                                        <Tabs.Tab key={style.styleTabID} id={style.styleTabID}>
                                            {style.styleLabel}
                                        </Tabs.Tab>
                                    ))}
                                </Tabs.List>
                            </Tabs.ListContainer>
                            {CITATION_STYLES.map((style) => {
                                const value = citations[style.styleID];
                                const displayValue = value ? value.replace(/<[^>]+>/g, '') : 'Loading...';
                                return (
                                    <Tabs.Panel key={style.styleTabID} id={style.styleTabID}>
                                        <TextArea fullWidth readOnly value={displayValue} rows={10} className="font-mono text-sm" />
                                        <div className="mt-3 flex justify-end">
                                            <Button size="sm" variant="primary" isDisabled={!value} onPress={() => value && copyToClipboard(value)}>
                                                <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                                            </Button>
                                        </div>
                                    </Tabs.Panel>
                                );
                            })}
                        </Tabs>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ExportCitation;
