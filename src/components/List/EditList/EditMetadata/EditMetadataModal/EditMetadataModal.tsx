import { FC, useEffect, useId, useState } from 'react';
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useList from '@/components/List/hooks/useList';
import Tooltip from '@/components/Utils/Tooltip';
import { Author, Node } from '@/services/backend/types';

type EditMetadataModalProps = {
    toggle: () => void;
};

const EditMetadataModal: FC<EditMetadataModalProps> = ({ toggle }) => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState<Node | null>(null);

    const { list, updateList } = useList();
    const formId = useId();

    useEffect(() => {
        if (list) {
            setTitle(list.title);
            setResearchField(list.research_fields[0]);
            setAuthors(list.authors);
        }
    }, [list]);

    if (!list) {
        return null;
    }

    const handleSave = async () => {
        updateList({
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
                        {/* @ts-expect-error awaiting TS migration */}
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
