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
    const [isLoading, setIsLoading] = useState(false);
    const papers = useSelector(state => state.literatureList.papers);

    const getCite = paper => {
        return new Cite({
            type: 'article',
            id: paper.paper.id,
            title: paper.label,
            author: paper.authors.length > 0 ? paper.authors.map(author => ({ name: author.label })) : null,
            year: paper.publicationYear?.label
        });
    };

    useEffect(() => {
        const parse = () => {
            setIsLoading(true);
            const bibtexPromises =
                Object.keys(papers).length > 0
                    ? Object.keys(papers).map(paperId => {
                          const paper = papers[paperId];

                          if (paper?.doi?.label) {
                              return new Cite.async(paper.doi.label).catch(() => {
                                  return getCite(paper);
                              });
                          }

                          return getCite(paper);
                      })
                    : [];
            Promise.all(bibtexPromises)
                .then(citations => {
                    const bibtex = citations.map(citation => citation.options(bibtexOptions).get()).join('\n');
                    setBibtex(bibtex);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error(error);
                    setIsLoading(false);
                });
        };
        parse();
    }, [papers]);

    return (
        <Modal size="lg" isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>BibTeX export</ModalHeader>
            <ModalBody>
                <Input type="textarea" value={!isLoading ? bibtex || 'No papers added' : 'Loading...'} rows="15" disabled />
                <CopyToClipboard
                    id="copyToClipboardLatex"
                    text={isLoading ? 'Loading...' : bibtex}
                    onCopy={() => {
                        toast.success('Copied to clipboard');
                    }}
                >
                    <Button disabled={isLoading} color="primary" className="mt-2 float-end" size="sm">
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
