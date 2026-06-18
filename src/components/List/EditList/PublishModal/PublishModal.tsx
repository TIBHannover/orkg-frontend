import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Checkbox, Input, Label, Modal, TextArea, TextField, toast, Tooltip } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import Link from 'next/link';
import { FC, FormEvent, useId, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useList from '@/components/List/hooks/useList';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { reverse } from '@/lib/namedRoute';
import { publishList } from '@/services/backend/literatureLists';

type PublishModalProps = {
    show: boolean;
    toggle: () => void;
};

const PublishModal: FC<PublishModalProps> = ({ show, toggle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [changelog, setChangelog] = useState('');
    const [publishedId, setPublishedId] = useState<string | null>(null);
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [description, setDescription] = useState('');
    const { list, mutate } = useList();
    const formId = useId();

    if (!list) {
        return null;
    }

    const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (shouldAssignDoi && (!description || description.trim() === '')) {
            toast.danger('Please enter a description');
            return;
        }
        setIsLoading(true);

        try {
            setPublishedId(
                await publishList(list.id, {
                    changelog,
                    assign_doi: shouldAssignDoi,
                    ...(description && { description }),
                }),
            );
            mutate();
            sendEvent({ category: 'data-entry', action: 'publish-list' });
            toast.success('List published successfully');
        } catch (e) {
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { changelog: 'Update message' } });
            console.error(e);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal.Backdrop
            isOpen={show}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Publish list</Modal.Heading>
                    </Modal.Header>
                    <form onSubmit={handlePublish}>
                        <Modal.Body>
                            <Alert status="accent" className="mb-4">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>
                                        Once a list is published, the current state is saved and will be persistent over time. The update message is
                                        used to identify why a version is published
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                            {!publishedId ? (
                                <div className="flex flex-col gap-4">
                                    <TextField className="w-full" value={changelog} onChange={setChangelog} isRequired>
                                        <Label htmlFor={`${formId}-changelog`}>Update message</Label>
                                        <Input id={`${formId}-changelog`} placeholder="Example: updated section order" maxLength={MAX_LENGTH_INPUT} />
                                    </TextField>

                                    <Checkbox isSelected={shouldAssignDoi} onChange={(checked) => setShouldAssignDoi(checked)}>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content className="text-accent capitalize line-clamp-2 min-w-0">
                                            <Tooltip delay={0}>
                                                <Tooltip.Trigger>
                                                    <span>
                                                        Assign DOI to list <FontAwesomeIcon icon={faQuestionCircle} className="text-accent" />
                                                    </span>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content showArrow>
                                                    <Tooltip.Arrow />
                                                    Assign a DOI to the published version of this list
                                                </Tooltip.Content>
                                            </Tooltip>
                                        </Checkbox.Content>
                                    </Checkbox>

                                    {shouldAssignDoi && (
                                        <TextField className="w-full" value={description} onChange={setDescription} isRequired>
                                            <Label htmlFor={`${formId}-description`}>Description</Label>
                                            <TextArea
                                                id={`${formId}-description`}
                                                placeholder="Briefly describe the contents of the list"
                                                rows={3}
                                                maxLength={MAX_LENGTH_INPUT}
                                            />
                                        </TextField>
                                    )}
                                </div>
                            ) : (
                                <Link href={reverse(ROUTES.LIST, { id: publishedId })} onClick={toggle}>
                                    View the published list
                                </Link>
                            )}
                        </Modal.Body>
                        {!publishedId && (
                            <Modal.Footer>
                                <ButtonWithLoading isLoading={isLoading} variant="primary" type="submit">
                                    Publish
                                </ButtonWithLoading>
                            </Modal.Footer>
                        )}
                    </form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default PublishModal;
