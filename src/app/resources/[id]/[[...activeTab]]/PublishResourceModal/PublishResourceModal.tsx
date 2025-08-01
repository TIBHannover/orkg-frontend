import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FC, useId, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert } from 'reactstrap';
import { mutate } from 'swr';

import useUsedTemplates from '@/components/hooks/useUsedTemplates';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Tooltip from '@/components/Utils/Tooltip';
import ROUTES from '@/constants/routes';
import { createSnapshot, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

type PublishResourceModalProps = {
    toggle: () => void;
    resource: Resource;
};

const PublishResourceModal: FC<PublishResourceModalProps> = ({ toggle, resource }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isAssignHandleSelected, setIsAssignHandleSelected] = useState(false);
    const [isLoadingPublishing, setIsLoadingPublishing] = useState(false);
    const { usedTemplates, isLoading: isLoadingUsedTemplates } = useUsedTemplates({ resource });
    const formId = useId();
    const router = useRouter();

    const canPublish = usedTemplates && usedTemplates.length > 0;

    const handlePublish = async () => {
        if (!selectedTemplateId) {
            toast.error('Please select a template to publish the resource');
            return;
        }
        try {
            setIsLoadingPublishing(true);
            const snapshotId = await createSnapshot({ id: resource.id, template_id: selectedTemplateId, register_handle: isAssignHandleSelected });
            mutate([resource.id, resourcesUrl, 'getSnapshots']);
            const snapshotUrl = reverse(ROUTES.RESOURCE_SNAPSHOT, { id: resource.id, snapshotId });
            router.push(snapshotUrl);

            toast.success('Resource published successfully');
        } catch (e) {
            toast.error('An error occurred while publishing the resource');
        } finally {
            setIsLoadingPublishing(false);
        }
    };
    const isLoading = isLoadingUsedTemplates || isLoadingPublishing;

    return (
        <ModalWithLoading isOpen toggle={toggle} isLoading={isLoading}>
            <ModalHeader toggle={toggle}>Publish resource</ModalHeader>
            <ModalBody>
                {!canPublish && (
                    <Alert color="danger">
                        Publishing is only possible when at least one template is used in this resource. Only data linked to a template are persisted
                        when publishing.
                    </Alert>
                )}
                {canPublish && (
                    <Form>
                        <FormGroup>
                            <Label for={`${formId}-template`}>
                                <Tooltip message="The selected template determines which data is stored when publishing. All data that is not part of the selected templates is not published.">
                                    Template
                                </Tooltip>
                            </Label>
                            <Input
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                value={selectedTemplateId}
                                type="select"
                                id={`${formId}-template`}
                            >
                                <option value="" disabled>
                                    Select template...
                                </option>
                                {usedTemplates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.label}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <Tooltip message="Assign a handle (i.e., a unique resolvable identifier) to the published version of this resource">
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            onChange={(e) => setIsAssignHandleSelected(e.target.checked)}
                                            checked={isAssignHandleSelected}
                                        />{' '}
                                        Assign handle to resource
                                    </Label>
                                </Tooltip>
                            </div>
                        </FormGroup>
                    </Form>
                )}
            </ModalBody>
            {canPublish && (
                <ModalFooter>
                    <Button color="primary" onClick={handlePublish}>
                        Publish
                    </Button>
                </ModalFooter>
            )}
        </ModalWithLoading>
    );
};

export default PublishResourceModal;
