import { Alert, Checkbox, Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import Link from 'next/link';
import { FC, FormEvent, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useReview from '@/components/Review/hooks/useReview';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { reverse } from '@/lib/namedRoute';
import { publishReview } from '@/services/backend/reviews';

type PublishModalProps = {
    toggle: () => void;
};

const PublishModal: FC<PublishModalProps> = ({ toggle }) => {
    const { review, mutate } = useReview();
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState<string | null>(null);
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [description, setDescription] = useState('');

    if (!review) {
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
            const newId = await publishReview(review.id, {
                changelog: updateMessage,
                assign_doi: shouldAssignDoi,
                ...(description && { description }),
            });

            mutate();
            toast.success('Review published successfully');
            sendEvent({ category: 'data-entry', action: 'publish-review' });
            setPublishedId(newId);
            setIsLoading(false);
        } catch (e) {
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { changelog: 'Update message' } });
            console.error(e);
        } finally {
            setIsLoading(false);
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
                    <form onSubmit={handlePublish}>
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Publish review</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            {!publishedId ? (
                                <>
                                    <Alert status="accent">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Description>
                                                Once an article is published, the current state is saved and will be persistent over time. The update
                                                message is used to identify why a version is published
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert>
                                    <TextField value={updateMessage} onChange={setUpdateMessage} className="w-full" isRequired>
                                        <Label>Update message</Label>
                                        <Input id="update-message" placeholder="Example: added introduction section" maxLength={MAX_LENGTH_INPUT} />
                                    </TextField>
                                    <Checkbox isSelected={shouldAssignDoi} onChange={setShouldAssignDoi} id="switchAssignDoi">
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Tooltip message="Assign a DOI to the published version of this review">Assign DOI to article</Tooltip>
                                        </Checkbox.Content>
                                    </Checkbox>
                                    {shouldAssignDoi && (
                                        <TextField value={description} onChange={setDescription} className="w-full">
                                            <Label>
                                                <Tooltip message="Briefly describe the contents of the article">Description</Tooltip>
                                            </Label>
                                            <TextArea id="description" maxLength={MAX_LENGTH_INPUT} rows={4} />
                                        </TextField>
                                    )}
                                </>
                            ) : (
                                <Link href={reverse(ROUTES.REVIEW, { id: publishedId })} onClick={toggle}>
                                    View the published article
                                </Link>
                            )}
                        </Modal.Body>
                        {!publishedId && (
                            <Modal.Footer>
                                <ButtonWithLoading type="submit" isLoading={isLoading} variant="primary">
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
