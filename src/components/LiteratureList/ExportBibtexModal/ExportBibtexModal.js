import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Cite from 'citation-js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Input, Modal, ModalBody, ModalHeader } from 'reactstrap';

const bibtexOptions = {
    output: {
        type: 'string',
        style: 'bibtex'
    }
};

const ExportBibtexModal = ({ isOpen, toggle }) => {
    const [bibtex, setBibtex] = useState('');
    const papers = useSelector(state => state.literatureList.papers);

    useEffect(() => {
        const parse = async () => {
            const bibtexPromises =
                Object.keys(papers).length > 0
                    ? Object.keys(papers).map(async paperId => {
                          const paper = papers[paperId];
                          return new Cite({
                              id: paper.paper.id,
                              title: paper.label,
                              author: paper.authors.length > 0 ? paper.authors.map(author => ({ name: author.label })) : null,
                              issued: { 'date-parts': [[paper.publicationYear?.label]] }
                          });
                      })
                    : [];
            setBibtex((await Promise.all(bibtexPromises)).map(_bibtex => _bibtex.options(bibtexOptions).get()).join(''));
        };
        parse();
    }, [papers]);

    return (
        <Modal size="lg" isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>BibTeX export</ModalHeader>
            <ModalBody>
                <Input type="textarea" value={bibtex || 'No papers added'} rows="15" disabled />
                <CopyToClipboard
                    id="copyToClipboardLatex"
                    text={bibtex}
                    onCopy={() => {
                        toast.success('Copied to clipboard');
                    }}
                >
                    <Button color="primary" className="mt-2 float-end" size="sm">
                        <Icon icon={faClipboard} /> Copy to clipboard
                    </Button>
                </CopyToClipboard>
            </ModalBody>
        </Modal>
    );
};

ExportBibtexModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default ExportBibtexModal;
