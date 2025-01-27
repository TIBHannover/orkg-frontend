import { Cite } from '@citation-js/core';
import useReview from 'components/Review/hooks/useReview';
import { FC, useEffect, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

type ReferenceModalProps = {
    toggle: () => void;
    editReferenceIndex: number | null;
};

const ReferenceModal: FC<ReferenceModalProps> = ({ toggle, editReferenceIndex = null }) => {
    const [bibtex, setBibtex] = useState('');
    const { review, parsedReferences, updateReview } = useReview();

    useEffect(() => {
        if (review && editReferenceIndex !== null) {
            setBibtex(review.references[editReferenceIndex]);
        }
    }, [editReferenceIndex, review]);

    const handleSaveReference = async ({
        editReferenceIndex: _editReferenceIndex,
        _bibtex,
    }: {
        editReferenceIndex: number | null;
        _bibtex: string;
    }) => {
        if (!review) {
            return;
        }
        try {
            const parsedReference = await Cite.async(_bibtex);
            const referenceToImport = parsedReference.data[0];
            const numberOfIdenticalKeys = parsedReferences.filter((reference) => reference.parsedReference.id === referenceToImport.id).length;
            if ((editReferenceIndex && numberOfIdenticalKeys > 1) || (!editReferenceIndex && numberOfIdenticalKeys > 0)) {
                toast.error('Duplicate citation key');
                return;
            }

            const hasMultipleCitations = parsedReference.data.length > 1;
            if (hasMultipleCitations) {
                toast.warning('BibTeX contains multiple citations, only the first citation is added');
            }
            if (!_editReferenceIndex) {
                updateReview({
                    references: [...review.references, _bibtex],
                });
            } else {
                updateReview({
                    references: [...review.references.slice(0, _editReferenceIndex), _bibtex, ...review.references.slice(_editReferenceIndex + 1)],
                });
            }
            toggle();
        } catch (e: unknown) {
            console.error(e);
            toast.error('An error occurred while parsing the BibTeX');
        }
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Reference</ModalHeader>
            <form action={() => handleSaveReference({ editReferenceIndex, _bibtex: bibtex })}>
                <ModalBody>
                    <Textarea
                        value={bibtex}
                        className="form-control"
                        onChange={(e) => setBibtex(e.target.value)}
                        placeholder="Paste your BibTeX here..."
                        aria-label="Enter a valid bibtex entry in this field"
                        style={{ fontFamily: 'monospace', fontSize: '90%' }}
                        minRows={6}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="submit">
                        Save
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default ReferenceModal;
