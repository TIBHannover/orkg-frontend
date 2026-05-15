import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { useCopyToClipboard } from 'react-use';

import useList from '@/components/List/hooks/useList';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { Paper } from '@/services/backend/types';

const bibtexOptions = {
    output: {
        type: 'string',
        style: 'bibtex',
    },
};

type ExportBibtexModalProps = {
    toggle: () => void;
};

const ExportBibtexModal: FC<ExportBibtexModalProps> = ({ toggle }) => {
    const [bibtex, setBibtex] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { allPapers } = useList();
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('Bibtex copied to clipboard');
        }
    }, [state.value]);

    const getCite = (paper: Paper) =>
        new Cite({
            type: 'article',
            id: paper.id,
            title: paper.title,
            author: paper.authors?.length > 0 ? paper.authors.map((author) => ({ literal: author.name })) : null,
            issued: { 'date-parts': [[paper.publication_info.published_year]] },
        });

    useEffect(() => {
        const parse = () => {
            setIsLoading(true);
            const bibtexPromises =
                allPapers && allPapers.length > 0
                    ? allPapers.map((paper) => {
                          if (paper.identifiers.doi) {
                              return Cite.async(paper.identifiers.doi).catch(() => getCite(paper));
                          }
                          return getCite(paper);
                      })
                    : [];
            Promise.all(bibtexPromises)
                .then((citations) => {
                    const result = citations.map((citation) => citation.options(bibtexOptions).get()).join('\n');
                    setBibtex(result);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
        };
        parse();
    }, [allPapers]);

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>BibTeX export</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        <Textarea
                            disabled
                            value={!isLoading ? bibtex || 'No items added' : 'Loading...'}
                            minRows={15}
                            maxRows={20}
                            maxLength={MAX_LENGTH_INPUT}
                            className="w-full rounded-md border border-default bg-field-background px-3 py-2 text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-2 focus:outline-focus disabled:opacity-70"
                        />
                        <div className="mt-2 flex justify-end">
                            <Button isDisabled={isLoading} variant="primary" size="sm" onPress={() => copyToClipboard(bibtex)}>
                                <FontAwesomeIcon icon={faClipboard} className="mr-1" /> Copy to clipboard
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ExportBibtexModal;
