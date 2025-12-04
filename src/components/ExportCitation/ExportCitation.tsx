import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { env } from 'next-runtime-env';
import { FC, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';

import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
            toast.dismiss();
            toast.success('Latex citation copied');
        }
    }, [state.value]);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Export citation</ModalHeader>
            <ModalBody>
                <p>
                    <Input type="textarea" maxLength={MAX_LENGTH_INPUT} value={latex.get()} disabled rows="10" />
                </p>

                <Button color="primary" className="pl-3 pr-3 float-right" size="sm" onClick={() => copyToClipboard(latex.get())}>
                    <FontAwesomeIcon icon={faClipboard} /> Copy to clipboard
                </Button>
            </ModalBody>
        </Modal>
    );
};

export default ExportCitation;
