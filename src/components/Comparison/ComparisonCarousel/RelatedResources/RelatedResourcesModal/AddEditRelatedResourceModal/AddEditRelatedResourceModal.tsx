import { FC, FormEvent, useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';

import useRelatedResources from '@/components/Comparison/ComparisonCarousel/RelatedResources/hooks/useRelatedResources';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type AddEditRelatedResourceModalProps = {
    toggle: () => void;
    relatedResourceId: string | null;
};

const AddEditRelatedResourceModal: FC<AddEditRelatedResourceModalProps> = ({ toggle, relatedResourceId }) => {
    const [image, setImage] = useState('');
    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');

    const { relatedResources, updateRelatedResource, createRelatedResource } = useRelatedResources();

    const isEdit = !!relatedResourceId;
    const formId = useId();

    useEffect(() => {
        if (!relatedResourceId || !relatedResources) {
            return;
        }

        const relatedResource = relatedResources.find((_relatedResource) => _relatedResource.id === relatedResourceId);

        if (!relatedResource) {
            return;
        }

        setImage(relatedResource?.image);
        setLabel(relatedResource?.label);
        setUrl(relatedResource?.url);
        setDescription(relatedResource?.description);
    }, [relatedResourceId, relatedResources]);

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!label || !url) {
            toast.error('The label and URL are required');
            return;
        }
        if (relatedResourceId) {
            updateRelatedResource(relatedResourceId, {
                image,
                label,
                url,
                description,
            });
        } else {
            createRelatedResource({
                image,
                label,
                url,
                description,
            });
        }
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>{isEdit ? 'Edit' : 'Add'} related resource</ModalHeader>
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
                        <Label for={`${formId}url`}>URL</Label>
                        <Input type="text" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={MAX_LENGTH_INPUT} id={`${formId}url`} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}description`}>
                            Description <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            id={`${formId}description`}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}image`}>
                            Thumbnail URL <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <Input
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            id={`${formId}image`}
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

export default AddEditRelatedResourceModal;
