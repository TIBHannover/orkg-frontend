import { useMatomo } from '@jonkoops/matomo-tracker-react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import useList from 'components/List/hooks/useList';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, FormEvent, useId, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { publishList } from 'services/backend/literatureLists';

type PublishModalProps = {
    show: boolean;
    toggle: () => void;
};

const PublishModal: FC<PublishModalProps> = ({ show, toggle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [changelog, setChangelog] = useState('');
    const [publishedId, setPublishedId] = useState<string | null>(null);
    const { list } = useList();
    const { trackEvent } = useMatomo();
    const formId = useId();

    if (!list) {
        return null;
    }

    const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            setPublishedId(await publishList(list.id, { changelog }));
            trackEvent({ category: 'data-entry', action: 'publish-list' });
            toast.success('List published successfully');
        } catch (e) {
            toast.error('An error occurred when publishing the list');
            console.error(e);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish list</ModalHeader>
            <Form onSubmit={handlePublish}>
                <ModalBody>
                    <Alert color="info">
                        Once a list is published, the current state is saved and will be persistent over time. The update message is used to identify
                        why a version is published
                    </Alert>
                    {!publishedId ? (
                        <FormGroup>
                            <Label for={`${formId}-changelog`}>Update message</Label>
                            <Input
                                type="text"
                                id={`${formId}-changelog`}
                                placeholder="Example: updated section order"
                                value={changelog}
                                onChange={(e) => setChangelog(e.target.value)}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                    ) : (
                        <Link href={reverse(ROUTES.LIST, { id: publishedId })} onClick={toggle}>
                            View the published list
                        </Link>
                    )}
                </ModalBody>
                {!publishedId && (
                    <ModalFooter>
                        <ButtonWithLoading isLoading={isLoading} color="primary" type="submit">
                            Publish
                        </ButtonWithLoading>
                    </ModalFooter>
                )}
            </Form>
        </Modal>
    );
};

export default PublishModal;
