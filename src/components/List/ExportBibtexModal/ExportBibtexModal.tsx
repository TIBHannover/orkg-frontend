import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap';

import useList from '@/components/List/hooks/useList';
import Button from '@/components/Ui/Button/Button';
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
            toast.dismiss();
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
                              return new Cite.async(paper.identifiers.doi).catch(() => getCite(paper));
                          }
                          return getCite(paper);
                      })
                    : [];
            Promise.all(bibtexPromises)
                .then((citations) => {
                    const bibtex = citations.map((citation) => citation.options(bibtexOptions).get()).join('\n');
                    setBibtex(bibtex);
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
        <Modal size="lg" isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>BibTeX export</ModalHeader>
            <ModalBody>
                <Input
                    type="textarea"
                    maxLength={MAX_LENGTH_INPUT}
                    value={!isLoading ? bibtex || 'No items added' : 'Loading...'}
                    rows="15"
                    disabled
                />

                <Button disabled={isLoading} color="primary" className="mt-2 float-end" size="sm" onClick={() => copyToClipboard(bibtex)}>
                    <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                </Button>
            </ModalBody>
        </Modal>
    );
};

export default ExportBibtexModal;
