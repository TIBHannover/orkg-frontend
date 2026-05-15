import { Cite } from '@citation-js/core';
import { Button, Modal, TextArea, TextField, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';

import useReview from '@/components/Review/hooks/useReview';

type ReferenceModalProps = {
    toggle: () => void;
    editReferenceIndex: number | null;
};

const ReferenceModal: FC<ReferenceModalProps> = ({ toggle, editReferenceIndex = null }) => {
    const [bibtex, setBibtex] = useState('');
    const { review, parsedReferences, updateReview } = useReview();

    useEffect(() => {
        if (review && editReferenceIndex !== null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
                toast.danger('Duplicate citation key');
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
            toast.danger('An error occurred while parsing the BibTeX');
        }
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Reference</Modal.Heading>
                    </Modal.Header>
                    <form action={() => handleSaveReference({ editReferenceIndex, _bibtex: bibtex })}>
                        <Modal.Body className="p-6">
                            <TextField value={bibtex} onChange={setBibtex} className="w-full" aria-label="Enter a valid bibtex entry in this field">
                                <TextArea rows={10} placeholder="Paste your BibTeX here..." className="font-mono text-[90%]" />
                            </TextField>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" type="submit">
                                Save
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ReferenceModal;
