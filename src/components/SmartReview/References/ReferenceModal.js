import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ReferenceModal = ({ show, toggle, onSave, reference = null }) => {
    const [bibtex, setBibtex] = useState('');

    useEffect(() => {
        if (!reference?.literal?.label) {
            return;
        }
        setBibtex(reference.literal.label);
    }, [reference]);

    const handleSave = () => {
        onSave({ bibtex, literalId: reference?.literal?.id ?? null });
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Reference</ModalHeader>
            <ModalBody>
                <Textarea
                    value={bibtex}
                    className="form-control"
                    onChange={e => setBibtex(e.target.value)}
                    placeholder="Paste your BibTeX here..."
                    aria-label="Enter a valid bibtex entry in this field"
                    style={{ fontFamily: 'monospace', fontSize: '90%' }}
                    minRows="6"
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ReferenceModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    reference: PropTypes.object
};

export default ReferenceModal;
