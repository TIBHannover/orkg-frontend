import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useReview from '@/components/Review/hooks/useReview';
import Alert from '@/components/Ui/Alert/Alert';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
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
    const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { changelog: 'Update message' } });
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen toggle={toggle}>
            <Form onSubmit={handlePublish}>
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
                                    required
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
                        <ButtonWithLoading type="submit" isLoading={isLoading} color="primary">
                            Publish
                        </ButtonWithLoading>
                    </ModalFooter>
                )}
            </Form>
        </Modal>
    );
};

export default PublishModal;
