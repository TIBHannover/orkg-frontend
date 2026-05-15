import { Button, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { FC, FormEvent, useEffect, useId, useState } from 'react';

import useRelatedResources from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedResources/hooks/useRelatedResources';
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

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImage(relatedResource?.image);
        setLabel(relatedResource?.label);
        setUrl(relatedResource?.url);
        setDescription(relatedResource?.description);
    }, [relatedResourceId, relatedResources]);

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!label || !url) {
            toast.danger('The label and URL are required');
            return;
        }
        if (relatedResourceId) {
            updateRelatedResource(relatedResourceId, { image, label, url, description });
        } else {
            createRelatedResource({ image, label, url, description });
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
                        <Modal.Heading>{isEdit ? 'Edit' : 'Add'} related resource</Modal.Heading>
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
                                <Label htmlFor={`${formId}url`}>URL</Label>
                                <Input
                                    id={`${formId}url`}
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </TextField>
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}description`}>
                                    Description <span className="text-gray-500 italic">(optional)</span>
                                </Label>
                                <Input
                                    id={`${formId}description`}
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </TextField>
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}image`}>
                                    Thumbnail URL <span className="text-gray-500 italic">(optional)</span>
                                </Label>
                                <Input
                                    id={`${formId}image`}
                                    type="text"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
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

export default AddEditRelatedResourceModal;
