import env from '@beam-australia/react-env';
import { Cite } from '@citation-js/core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button, Input, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getResourceLink } from 'utils';

const ExportCitation = ({ isOpen, toggle, id, title, authors, classId }) => {
    const bibtexOptions = {
        output: {
            type: 'string',
            style: 'bibtex',
        },
    };

    const link = `${env('URL')}${getResourceLink(classId, id)}`;

    const latex = new Cite(
        {
            type: 'misc',
            id,
            title,
            author: authors,
            URL: link,
            accessed: { 'date-parts': [[moment().format('YYYY'), moment().format('MM'), moment().format('DD')]] },
        },
        bibtexOptions,
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Export citation</ModalHeader>
            <ModalBody>
                <p>
                    <Input type="textarea" value={latex.get()} disabled rows="10" />
                </p>

                <CopyToClipboard
                    id="copyToClipboard"
                    text={latex.get()}
                    onCopy={() => {
                        toast.dismiss();
                        toast.success('Latex citation copied');
                    }}
                >
                    <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                        <Icon icon={faClipboard} /> Copy to clipboard
                    </Button>
                </CopyToClipboard>
            </ModalBody>
        </Modal>
    );
};

ExportCitation.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    classId: PropTypes.string.isRequired,
};

export default ExportCitation;
