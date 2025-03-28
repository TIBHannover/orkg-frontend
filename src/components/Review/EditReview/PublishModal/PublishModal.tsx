import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useReview from '@/components/Review/hooks/useReview';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
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

    const { trackEvent } = useMatomo();

    if (!review) {
        return null;
    }
    const handlePublish = async () => {
        if (shouldAssignDoi && (!description || description.trim() === '')) {
            toast.error('Please enter a description');
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
            trackEvent({ category: 'data-entry', action: 'publish-review' });
            setPublishedId(newId);
            setIsLoading(false);
        } catch (e) {
            toast.error('An error occurred when publishing the review');
            console.error(e);
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen toggle={toggle}>
            <Form onSubmit={(e) => e.preventDefault()}>
                <ModalHeader toggle={toggle}>Publish review</ModalHeader>
                <ModalBody>
                    {!publishedId ? (
                        <>
                            <Alert color="info">
                                Once an article is published, the current state is saved and will be persistent over time. The update message is used
                                to identify why a version is published
                            </Alert>
                            <FormGroup>
                                <Label for="update-message">Update message</Label>
                                <Input
                                    type="text"
                                    id="update-message"
                                    placeholder="Example: added introduction section"
                                    value={updateMessage}
                                    onChange={(e) => setUpdateMessage(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </FormGroup>
                            <FormGroup>
                                <div>
                                    <Tooltip message="Assign a DOI to the published version of this review">
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    setShouldAssignDoi(e.target.checked);
                                                }}
                                                checked={shouldAssignDoi}
                                                id="switchAssignDoi"
                                                inline
                                            />{' '}
                                            Assign DOI to article
                                        </Label>
                                    </Tooltip>
                                </div>
                            </FormGroup>
                            {shouldAssignDoi && (
                                <FormGroup>
                                    <Label for="description">
                                        <Tooltip message="Briefly describe the contents of the article">Description</Tooltip>
                                    </Label>
                                    <Input
                                        type="textarea"
                                        name="description"
                                        value={description}
                                        id="description"
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={MAX_LENGTH_INPUT}
                                    />
                                </FormGroup>
                            )}
                        </>
                    ) : (
                        <Link href={reverse(ROUTES.REVIEW, { id: publishedId })} onClick={toggle}>
                            View the published article
                        </Link>
                    )}
                </ModalBody>
                {!publishedId && (
                    <ModalFooter>
                        <ButtonWithLoading type="submit" isLoading={isLoading} color="primary" onClick={handlePublish}>
                            Publish
                        </ButtonWithLoading>
                    </ModalFooter>
                )}
            </Form>
        </Modal>
    );
};

export default PublishModal;
