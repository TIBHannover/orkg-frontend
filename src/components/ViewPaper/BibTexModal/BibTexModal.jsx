import { Cite } from '@citation-js/core';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { parseCiteResult } from 'utils';

const BibTexModal = ({ toggle, onUpdateData }) => {
    const [bibTex, setBibTex] = useState('');

    const handleSave = async () => {
        try {
            const paper = await Cite.async(bibTex);
            if (!paper) {
                return;
            }
            const parseResult = parseCiteResult(paper);

            const newData = {
                doi: parseResult.doi,
                title: parseResult.paperTitle,
                authors: parseResult.paperAuthors,
                publicationMonth: parseResult.paperPublicationMonth,
                publicationYear: parseResult.paperPublicationYear,
                publishedIn: parseResult.publishedIn,
                url: parseResult.url,
            };

            onUpdateData(newData);
        } catch (e) {
            const messageMapping = {
                'This format is not supported or recognized': 'This format is not supported or recognized. Please enter a valid DOI or BibTeX',
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            toast.error(messageMapping[e.message] || messageMapping.default);
            console.error(e);
        }
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Enter BibTeX</ModalHeader>
            <ModalBody>
                <Textarea
                    id="paper-abstract"
                    className="form-control ps-2 pe-2"
                    minRows={8}
                    value={bibTex}
                    onChange={(e) => setBibTex(e.target.value)}
                    placeholder={`@book{texbook,
    author = {Donald E. Knuth},
    year = {1986},
    title = {The TeX Book},
    publisher = {Addison-Wesley Professional}
}`}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button color="primary" className="float-end" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

BibTexModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    onUpdateData: PropTypes.func.isRequired,
};

export default BibTexModal;
