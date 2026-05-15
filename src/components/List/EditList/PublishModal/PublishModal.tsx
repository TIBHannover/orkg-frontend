import { Alert, Input, Label, Modal, TextField, toast } from '@heroui/react';
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
    const { list } = useList();
    const formId = useId();

    if (!list) {
        return null;
    }

    const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            setPublishedId(await publishList(list.id, { changelog }));
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
                        <Modal.Body className="p-6">
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
                                <TextField className="w-full" value={changelog} onChange={setChangelog} isRequired>
                                    <Label htmlFor={`${formId}-changelog`}>Update message</Label>
                                    <Input id={`${formId}-changelog`} placeholder="Example: updated section order" maxLength={MAX_LENGTH_INPUT} />
                                </TextField>
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
