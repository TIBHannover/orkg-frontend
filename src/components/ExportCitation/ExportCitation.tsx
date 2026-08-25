import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, TextArea } from '@heroui/react';
import dayjs from 'dayjs';
import { env } from 'next-runtime-env';
import { FC } from 'react';

import useCopyWithFeedback from '@/components/hooks/useCopyWithFeedback';
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

    const { isCopied, copy } = useCopyWithFeedback();

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
                                <Button size="sm" variant="primary" onPress={() => copy(latex.get())}>
                                    <FontAwesomeIcon icon={isCopied ? faCheck : faClipboard} /> {isCopied ? 'Copied!' : 'Copy to clipboard'}
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
