import { FC, useEffect, useId, useState } from 'react';

import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useReview from '@/components/Review/hooks/useReview';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
            setTitle(review.title);
            setResearchField(review.research_fields[0]);
            setAuthors(review.authors);
        }
    }, [review]);

    if (!review) {
        return null;
    }

    const handleSave = async () => {
        updateReview({
            title,
            ...(researchField ? { research_fields: [researchField] } : {}),
            authors,
        });
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Edit metadata</ModalHeader>
            <Form onSubmit={handleSave}>
                <ModalBody>
                    <FormGroup>
                        <Label for={`${formId}-title`}>
                            <Tooltip message="The title of the list">Title</Tooltip>
                        </Label>
                        <Input id={`${formId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-researchField`}>
                            <Tooltip message="Provide the main research field of this list">Research field</Tooltip>
                        </Label>
                        <ResearchFieldInput value={researchField} onChange={setResearchField} inputId={`${formId}-researchField`} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-authors`}>
                            <Tooltip message="The author or authors of the list. Enter both the first and last name">Authors</Tooltip>
                        </Label>
                        <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="submit">
                        Save
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default EditMetadataModal;
