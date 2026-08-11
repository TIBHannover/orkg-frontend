import { Button, Form, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { FC } from 'react';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledTextArea from '@/components/Form/ControlledTextArea/ControlledTextArea';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useConfirmDiscardChanges from '@/components/Form/hooks/useConfirmDiscardChanges';
import useZodForm from '@/components/Form/hooks/useZodForm';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import { SmartDescriptiveProperty } from '@/components/SmartSuggestions/DescriptivePropertySuggestions';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createLiteral } from '@/services/backend/literals';
import { createPredicate } from '@/services/backend/predicates';
import { createLiteralStatement } from '@/services/backend/statements';

const createPropertySchema = z.object({
    description: z.string(),
});

type CreatePropertyFormValues = z.infer<typeof createPropertySchema>;

type ConfirmCreatePropertyModalProps = {
    label: string;
    isOpen: boolean;
    toggle: () => void;
    onCreate?: (property: { description?: string; label?: string; id: string }) => void;
};

const ConfirmCreatePropertyModal: FC<ConfirmCreatePropertyModalProps> = ({ label, isOpen, toggle, onCreate }) => {
    const {
        control,
        handleSubmit,
        setValue,
        setError,
        formState: { isSubmitting, isDirty, errors },
    } = useZodForm({
        schema: createPropertySchema,
        defaultValues: { description: '' },
    });

    const { requestClose } = useConfirmDiscardChanges({ isDirty, onClose: toggle });

    const onSubmit = async ({ description }: CreatePropertyFormValues) => {
        try {
            const propertyId = await createPredicate(label);
            if (description.trim() !== '') {
                const descriptionLiteralId = await createLiteral(description);
                await createLiteralStatement(propertyId, PREDICATES.DESCRIPTION, descriptionLiteralId);
            }
            onCreate?.({ description, label, id: propertyId });
            toggle();
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                knownFields: Object.keys(createPropertySchema.shape),
            });
            if (!handled) {
                toast.danger('An error occurred while creating the property. Please reload the page and try again');
            }
        }
    };

    // z-[1060] stacks above the z-[1055] DataBrowserDialog backdrop
    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open && !isSubmitting) requestClose();
            }}
            isDismissable={!isSubmitting}
            className="z-[1060]"
        >
            <Modal.Container>
                <Modal.Dialog>
                    <Form onSubmit={handleSubmit(onSubmit)} className="contents">
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Are you sure you need a new property?</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="flex flex-col gap-5">
                            <FormRootError message={errors.root?.server?.message} />
                            <p className="text-sm text-muted">
                                Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                            </p>
                            <TextField fullWidth isDisabled value={label}>
                                <Label>Label</Label>
                                <Input name="label" type="text" />
                            </TextField>
                            <ControlledTextArea
                                control={control}
                                name="description"
                                label={
                                    <>
                                        Description <span className="text-muted font-normal italic">(optional)</span>
                                    </>
                                }
                                description="A short description helps others understand when to use this property"
                                placeholder="E.g. date of acceptance of the resource"
                                maxLength={MAX_LENGTH_INPUT}
                                rows={5}
                                isDisabled={isSubmitting}
                                endContent={
                                    <SmartDescriptiveProperty
                                        propertyLabel={label}
                                        setDescription={(description) => setValue('description', description, { shouldDirty: true })}
                                    />
                                }
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="ghost" type="button" onPress={requestClose} isDisabled={isSubmitting}>
                                Cancel
                            </Button>
                            <ButtonWithLoading type="submit" variant="primary" isLoading={isSubmitting}>
                                Create property
                            </ButtonWithLoading>
                        </Modal.Footer>
                    </Form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ConfirmCreatePropertyModal;
