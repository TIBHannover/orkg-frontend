import { Form, Modal, toast } from '@heroui/react';
import { FC } from 'react';
import { mutate } from 'swr';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledAutocompleteContributor from '@/components/Form/ControlledAutocompleteContributor/ControlledAutocompleteContributor';
import ControlledSelect from '@/components/Form/ControlledSelect/ControlledSelect';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useConfirmDiscardChanges from '@/components/Form/hooks/useConfirmDiscardChanges';
import useZodForm from '@/components/Form/hooks/useZodForm';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import { Contributor, Organization } from '@/services/backend/types';
import { addUserToObservatory } from '@/services/backend/users';

const addMemberSchema = z.object({
    organizationId: z.string().min(1, 'Please select an organization'),
    // The explicit `: boolean` matters: without it TypeScript infers a type predicate for the check,
    // which zod uses to narrow the field to a non-null `Contributor` — the empty form couldn't be typed then.
    contributor: z.custom<Contributor | null>().refine((value): boolean => value !== null, 'Please select a contributor'),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

type AddMemberProps = {
    toggle: () => void;
    observatoryId: string;
    organizationsList: Organization[];
};

const AddMember: FC<AddMemberProps> = ({ toggle, observatoryId, organizationsList }) => {
    const {
        control,
        handleSubmit,
        setError,
        formState: { isDirty, isSubmitting, errors },
    } = useZodForm({
        schema: addMemberSchema,
        values: {
            // With a single organization there is nothing to choose, so preselect it.
            organizationId: organizationsList.length === 1 ? organizationsList[0].id : '',
            contributor: null,
        },
    });

    const { requestClose } = useConfirmDiscardChanges({ isDirty, onClose: toggle });

    const onSubmit = async ({ organizationId, contributor }: AddMemberFormValues) => {
        if (!contributor) {
            return;
        }
        try {
            await addUserToObservatory(contributor.id, observatoryId, organizationId);
            toast.success('Member added successfully');
            mutate((key: unknown) => Array.isArray(key) && key[key.length - 1] === 'getUsersByObservatoryId');
            toggle();
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                // The backend request uses snake_case field names, the form fields are camelCase.
                fieldMap: { contributor_id: 'contributor', organization_id: 'organizationId' },
                knownFields: Object.keys(addMemberSchema.shape),
            });
            if (!handled) {
                toast.warning('Something went wrong while adding the member');
            }
        }
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open && !isSubmitting) requestClose();
            }}
            isDismissable={!isSubmitting}
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-md">
                    <Form onSubmit={handleSubmit(onSubmit)} className="contents">
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Add a member</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="flex flex-col gap-4 p-1">
                                <FormRootError message={errors.root?.server?.message} />

                                <ControlledSelect
                                    control={control}
                                    name="organizationId"
                                    label="Organization"
                                    placeholder="Select an organization"
                                    options={organizationsList.map(({ id, name }) => ({ id, label: name }))}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledAutocompleteContributor
                                    control={control}
                                    name="contributor"
                                    label="Contributor"
                                    currentContributor={false}
                                    isDisabled={isSubmitting}
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

export default AddMember;
