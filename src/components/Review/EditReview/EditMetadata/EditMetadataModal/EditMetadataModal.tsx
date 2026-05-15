import { Button, Input, Label, Modal, TextField } from '@heroui/react';
import { FC, FormEvent, useEffect, useId, useState } from 'react';

import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useReview from '@/components/Review/hooks/useReview';
import Tooltip from '@/components/Utils/Tooltip';
import { Author, Node } from '@/services/backend/types';

type EditMetadataModalProps = {
    toggle: () => void;
};

const EditMetadataModal: FC<EditMetadataModalProps> = ({ toggle }) => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState<Node | null>(null);

    const { review, updateReview } = useReview();
    const formId = useId();

    useEffect(() => {
        if (review) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(review.title);
            setResearchField(review.research_fields[0]);
            setAuthors(review.authors);
        }
    }, [review]);

    if (!review) {
        return null;
    }

    const handleSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateReview({
            title,
            ...(researchField ? { research_fields: [researchField] } : {}),
            authors,
        });
        toggle();
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Edit metadata</Modal.Heading>
                    </Modal.Header>
                    <form onSubmit={handleSave}>
                        <Modal.Body className="p-6 space-y-4">
                            <TextField value={title} onChange={setTitle} className="w-full">
                                <Label>
                                    <Tooltip message="The title of the list">Title</Tooltip>
                                </Label>
                                <Input id={`${formId}-title`} />
                            </TextField>
                            <div>
                                <Label htmlFor={`${formId}-researchField`}>
                                    <Tooltip message="Provide the main research field of this list">Research field</Tooltip>
                                </Label>
                                <ResearchFieldInput value={researchField} onChange={setResearchField} inputId={`${formId}-researchField`} />
                            </div>
                            <div>
                                <Label htmlFor={`${formId}-authors`}>
                                    <Tooltip message="The author or authors of the list. Enter both the first and last name">Authors</Tooltip>
                                </Label>
                                <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} />
                            </div>
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

export default EditMetadataModal;
