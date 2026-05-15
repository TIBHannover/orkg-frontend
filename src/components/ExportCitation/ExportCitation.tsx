import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, TextArea, toast } from '@heroui/react';
import dayjs from 'dayjs';
import { env } from 'next-runtime-env';
import { FC, useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';

import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { getResourceLink } from '@/utils';

type ExportCitationProps = {
    isOpen: boolean;
    toggle: () => void;
    id: string;
    title: string;
    authors: { literal: string }[];
    classId: string;
};

const ExportCitation: FC<ExportCitationProps> = ({ isOpen, toggle, id, title, authors, classId }) => {
    const bibtexOptions = {
        output: {
            type: 'string',
            style: 'bibtex',
        },
    };

    const link = `${env('NEXT_PUBLIC_URL')}${getResourceLink(classId, id)}`;
    const latex = new Cite(
        {
            type: 'misc',
            _id: id,
            title,
            author: authors.length > 0 ? authors : null,
            URL: link,
            accessed: {
                'date-parts': [[dayjs().year(), dayjs().month() + 1, dayjs().date()]],
            },
        },
        bibtexOptions,
    );

    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('Latex citation copied');
        }
    }, [state.value]);

    return (
        <Modal.Backdrop
            isOpen={isOpen}
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
                        <div className="p-1">
                            <TextArea fullWidth readOnly value={latex.get()} rows={10} maxLength={MAX_LENGTH_INPUT} className="font-mono text-sm" />
                            <div className="mt-3 flex justify-end">
                                <Button size="sm" variant="primary" onPress={() => copyToClipboard(latex.get())}>
                                    <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ExportCitation;
