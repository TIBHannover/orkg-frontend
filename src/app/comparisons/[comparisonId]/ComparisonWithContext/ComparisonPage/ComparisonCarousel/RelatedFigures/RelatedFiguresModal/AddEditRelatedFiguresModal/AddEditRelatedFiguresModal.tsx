import { Button, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { FC, FormEvent, useEffect, useId, useState } from 'react';

import useRelatedFigures from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedFigures/hooks/useRelatedFigures';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';

type AddEditRelatedFigureModalProps = {
    toggle: () => void;
    relatedFigureId: string | null;
};

const AddEditRelatedFigureModal: FC<AddEditRelatedFigureModalProps> = ({ toggle, relatedFigureId }) => {
    const [image, setImage] = useState('');
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');

    const { relatedFigures, updateRelatedFigure, createRelatedFigure } = useRelatedFigures();

    const isEdit = !!relatedFigureId;
    const formId = useId();

    const isWhitelistedDomain = (text: string) => text.match(new RegExp(REGEX.RAW_GITHUB_URL)) || text.match(new RegExp(REGEX.ZENODO_URL));

    useEffect(() => {
        if (!relatedFigureId || !relatedFigures) {
            return;
        }

        const relatedFigure = relatedFigures.find((_relatedFigure) => _relatedFigure.id === relatedFigureId);

        if (!relatedFigure) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImage(relatedFigure?.image);
        setLabel(relatedFigure?.label);
        setDescription(relatedFigure?.description);
    }, [relatedFigureId, relatedFigures]);

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!label || !image || !description) {
            toast.danger('The label, image, and description are required');
            return;
        }

        if (!isWhitelistedDomain(image)) {
            toast.danger('Image URL must be from raw.githubusercontent.com or zenodo.org domain');
            return;
        }
        if (relatedFigureId) {
            updateRelatedFigure(relatedFigureId, { image, label, description });
        } else {
            createRelatedFigure({ image, label, description });
        }
        toggle();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog>
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>{isEdit ? 'Edit' : 'Add'} related figure</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <form onSubmit={handleSave}>
                        <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-4">
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}label`}>Label</Label>
                                <Input
                                    id={`${formId}label`}
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </TextField>
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}image`}>Image URL</Label>
                                <Input
                                    id={`${formId}image`}
                                    type="text"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </TextField>
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}description`}>Description</Label>
                                <Input
                                    id={`${formId}description`}
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </TextField>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button type="submit">Save</Button>
                        </Modal.Footer>
                    </form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AddEditRelatedFigureModal;
