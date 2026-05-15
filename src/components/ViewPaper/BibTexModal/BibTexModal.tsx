import { Cite } from '@citation-js/core';
import { Button, Modal, TextArea, toast } from '@heroui/react';
import { useState } from 'react';

import { Author, PublishedIn } from '@/components/PaperForm/types';

const toStringOrEmpty = (value: unknown): string => (value == null || value === '' ? '' : String(value));
import { parseCiteResult } from '@/utils';

const PLACEHOLDER = `@book{texbook,
    author = {Donald E. Knuth},
    year = {1986},
    title = {The TeX Book},
    publisher = {Addison-Wesley Professional}
}`;

export type BibTexUpdateData = {
    doi: string;
    title: string;
    authors: Author[];
    publicationMonth: string;
    publicationYear: string;
    publishedIn: PublishedIn;
    url: string;
};

type BibTexModalProps = {
    toggle: () => void;
    onUpdateData: (data: BibTexUpdateData) => void;
};

const BibTexModal = ({ toggle, onUpdateData }: BibTexModalProps) => {
    const [bibTex, setBibTex] = useState('');

    const handleSave = async () => {
        try {
            const paper = await Cite.async(bibTex);
            if (!paper) {
                return;
            }
            const parseResult = parseCiteResult(paper);

            onUpdateData({
                doi: parseResult.doi,
                title: parseResult.paperTitle,
                authors: parseResult.paperAuthors,
                publicationMonth: toStringOrEmpty(parseResult.paperPublicationMonth),
                publicationYear: toStringOrEmpty(parseResult.paperPublicationYear),
                publishedIn: parseResult.publishedIn ? { label: parseResult.publishedIn } : null,
                url: parseResult.url,
            });
        } catch (e) {
            const messageMapping: Record<string, string> = {
                'This format is not supported or recognized': 'This format is not supported or recognized. Please enter a valid DOI or BibTeX',
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            const message = e instanceof Error ? e.message : '';
            toast.danger(messageMapping[message] || messageMapping.default);
            console.error(e);
        }
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger className="!top-3 !right-3" />
                    <Modal.Header>
                        <Modal.Heading>Enter BibTeX</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-1">
                        <TextArea
                            aria-label="BibTeX input"
                            className="w-full font-mono text-sm"
                            rows={10}
                            placeholder={PLACEHOLDER}
                            value={bibTex}
                            onChange={(e) => setBibTex(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </Modal.Body>
                    <Modal.Footer className="justify-end">
                        <Button variant="primary" onPress={handleSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default BibTexModal;
