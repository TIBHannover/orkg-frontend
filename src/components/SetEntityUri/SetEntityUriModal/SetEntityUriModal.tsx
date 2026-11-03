'use client';

import { Form, Modal, toast } from '@heroui/react';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useConfirmDiscardChanges from '@/components/Form/hooks/useConfirmDiscardChanges';
import useZodForm from '@/components/Form/hooks/useZodForm';
import { requiredUriSchema } from '@/components/Form/schemas/uriSchema';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { updateClass } from '@/services/backend/classes';
import { updatePredicate } from '@/services/backend/predicates';
import { updateResource } from '@/services/backend/resources';

const setEntityUriSchema = z.object({
    uri: requiredUriSchema,
});

type SetEntityUriFormValues = z.infer<typeof setEntityUriSchema>;

type SetEntityUriModalProps = {
    entityId: string;
    entityType: (typeof ENTITIES)[keyof typeof ENTITIES];
    toggle: () => void;
    /** Called after the URI was set successfully, e.g. to refresh the page data */
    onUpdated?: () => void;
};

const SetEntityUriModal = ({ entityId, entityType, toggle, onUpdated }: SetEntityUriModalProps) => {
    const {
        control,
        handleSubmit,
        setError,
        formState: { isDirty, isSubmitting, errors },
    } = useZodForm({
        schema: setEntityUriSchema,
        defaultValues: { uri: '' },
    });

    const { requestClose } = useConfirmDiscardChanges({ isDirty, onClose: toggle });

    const onSubmit = async (values: SetEntityUriFormValues) => {
        toast.clear();

        try {
            if (entityType === ENTITIES.RESOURCE) {
                await updateResource(entityId, { uri: values.uri });
            } else if (entityType === ENTITIES.PREDICATE) {
                await updatePredicate(entityId, { uri: values.uri });
            } else if (entityType === ENTITIES.CLASS) {
                await updateClass(entityId, { uri: values.uri });
            } else {
                throw new Error(`Setting the URI of a ${entityType} is not supported`);
            }
            toast.success('URI set successfully');
            onUpdated?.();
            toggle();
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                knownFields: Object.keys(setEntityUriSchema.shape),
            });
            if (!handled) {
                toast.warning('Something went wrong while setting the URI');
            }
        }
    };

    return (
        <Modal.Backdrop
            className="z-[1055]"
            isOpen
            onOpenChange={(open) => {
                if (!open && !isSubmitting) requestClose();
            }}
            isDismissable={!isSubmitting}
        >
            <Modal.Container>
                <Modal.Dialog>
                    <Form onSubmit={handleSubmit(onSubmit)} className="contents">
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Set URI</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="flex flex-col gap-4">
                                <FormRootError message={errors.root?.server?.message} />

                                <ControlledTextField
                                    control={control}
                                    name="uri"
                                    type="url"
                                    label="URI"
                                    placeholder="https://example.org/ontology#Term"
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                    description="Please provide the URI of this entity in an external ontology. Once set, the URI cannot be changed or removed."
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <ButtonWithLoading type="submit" variant="primary" isLoading={isSubmitting}>
                                Save
                            </ButtonWithLoading>
                        </Modal.Footer>
                    </Form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SetEntityUriModal;
