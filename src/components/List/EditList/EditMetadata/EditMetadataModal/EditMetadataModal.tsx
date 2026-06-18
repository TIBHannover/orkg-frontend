import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Label, Modal, TextField, Tooltip } from '@heroui/react';
import { FC, FormEvent, ReactNode, useEffect, useId, useState } from 'react';

import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useList from '@/components/List/hooks/useList';
import { Author, Node } from '@/services/backend/types';

type EditMetadataModalProps = {
    toggle: () => void;
};

const HelpLabel: FC<{ htmlFor: string; tooltip: ReactNode; children: ReactNode }> = ({ htmlFor, tooltip, children }) => (
    <Label htmlFor={htmlFor} className="inline-flex items-center gap-1">
        {children}
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-accent" />
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-[300px]">{tooltip}</Tooltip.Content>
        </Tooltip>
    </Label>
);

const EditMetadataModal: FC<EditMetadataModalProps> = ({ toggle }) => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState<Node | null>(null);

    const { list, updateList } = useList();
    const formId = useId();

    useEffect(() => {
        if (list) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(list.title);
            setResearchField(list.research_fields[0]);
            setAuthors(list.authors);
        }
    }, [list]);

    if (!list) {
        return null;
    }

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateList({
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
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Edit metadata</Modal.Heading>
                    </Modal.Header>
                    <form onSubmit={handleSave}>
                        <Modal.Body className="flex flex-col gap-4">
                            <TextField className="w-full" value={title} onChange={setTitle}>
                                <HelpLabel htmlFor={`${formId}-title`} tooltip="The title of the list">
                                    Title
                                </HelpLabel>
                                <Input id={`${formId}-title`} />
                            </TextField>

                            <div className="flex flex-col gap-1">
                                <HelpLabel htmlFor={`${formId}-researchField`} tooltip="Provide the main research field of this list">
                                    Research field
                                </HelpLabel>
                                <ResearchFieldInput value={researchField} onChange={setResearchField} inputId={`${formId}-researchField`} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <HelpLabel
                                    htmlFor={`${formId}-authors`}
                                    tooltip="The author or authors of the list. Enter both the first and last name"
                                >
                                    Authors
                                </HelpLabel>
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
