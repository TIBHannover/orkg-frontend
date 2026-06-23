import { Alert, Button, Checkbox, Label, ListBox, Modal, Select, toast, Tooltip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FC, useId, useState } from 'react';
import { mutate } from 'swr';

import useUsedTemplates from '@/components/hooks/useUsedTemplates';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
            toast.danger('Please select a template to publish the resource');
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
            toast.danger('An error occurred while publishing the resource');
        } finally {
            setIsLoadingPublishing(false);
        }
    };
    const isLoading = isLoadingUsedTemplates || isLoadingPublishing;

    return (
        <ModalWithLoading isOpen toggle={toggle} isLoading={isLoading} size="lg">
            <Modal.Header>
                <Modal.CloseTrigger />
                <Modal.Heading>Publish resource</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
                {!canPublish && (
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Publishing requires a template</Alert.Title>
                            <Alert.Description>
                                Publishing is only possible when at least one template is used in this resource. Only data linked to a template are
                                persisted when publishing.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                {canPublish && (
                    <div className="flex flex-col gap-4">
                        <Select
                            className="w-full"
                            placeholder="Select template..."
                            value={selectedTemplateId || null}
                            onChange={(key) => setSelectedTemplateId(key == null ? '' : String(key))}
                        >
                            <Label htmlFor={`${formId}-template`} className="flex items-center gap-1">
                                Template
                                <Tooltip>
                                    <Tooltip.Trigger>
                                        <span aria-label="Template help" className="text-secondary cursor-help">
                                            (?)
                                        </span>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content showArrow className="max-w-xs">
                                        <Tooltip.Arrow />
                                        The selected template determines which data is stored when publishing. All data that is not part of the
                                        selected templates is not published.
                                    </Tooltip.Content>
                                </Tooltip>
                            </Label>
                            <Select.Trigger id={`${formId}-template`}>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    {usedTemplates.map((template) => (
                                        <ListBox.Item key={template.id} id={template.id} textValue={template.label}>
                                            {template.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Checkbox id={`${formId}-handle`} isSelected={isAssignHandleSelected} onChange={setIsAssignHandleSelected}>
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    Assign handle to resource
                                </Checkbox.Content>
                            </Checkbox>
                            <Tooltip>
                                <Tooltip.Trigger>
                                    <span aria-label="Handle help" className="text-secondary cursor-help">
                                        (?)
                                    </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow className="max-w-xs">
                                    <Tooltip.Arrow />
                                    Assign a handle (i.e., a unique resolvable identifier) to the published version of this resource
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                    </div>
                )}
            </Modal.Body>
            {canPublish && (
                <Modal.Footer>
                    <Button variant="primary" onPress={handlePublish}>
                        Publish
                    </Button>
                </Modal.Footer>
            )}
        </ModalWithLoading>
    );
};

export default PublishResourceModal;
