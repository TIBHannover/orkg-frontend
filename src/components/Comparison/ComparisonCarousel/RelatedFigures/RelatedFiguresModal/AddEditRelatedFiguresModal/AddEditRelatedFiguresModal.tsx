import { FC, FormEvent, useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';
import { Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import useRelatedFigures from '@/components/Comparison/ComparisonCarousel/RelatedFigures/hooks/useRelatedFigures';
import Button from '@/components/Ui/Button/Button';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

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

    useEffect(() => {
        if (!relatedFigureId || !relatedFigures) {
            return;
        }

        const relatedFigure = relatedFigures.find((_relatedFigure) => _relatedFigure.id === relatedFigureId);

        if (!relatedFigure) {
            return;
        }

        setImage(relatedFigure?.image);
        setLabel(relatedFigure?.label);
        setDescription(relatedFigure?.description);
    }, [relatedFigureId, relatedFigures]);

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!label || !image || !description) {
            toast.error('The label, image, and description are required');
            return;
        }
        if (relatedFigureId) {
            updateRelatedFigure(relatedFigureId, {
                image,
                label,
                description,
            });
        } else {
            createRelatedFigure({
                image,
                label,
                description,
            });
        }
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>{isEdit ? 'Edit' : 'Add'} related figure</ModalHeader>
            <Form onSubmit={handleSave}>
                <ModalBody>
                    <FormGroup>
                        <Label for={`${formId}label`}>Label</Label>
                        <Input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            id={`${formId}label`}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}image`}>Image URL</Label>
                        <Input
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            id={`${formId}image`}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}description`}>Description</Label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            id={`${formId}description`}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button type="submit" color="primary">
                        Save
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default AddEditRelatedFigureModal;
