import { Form, Modal, toast } from '@heroui/react';
import { Organization, UpdateOrganizationRequestProperties } from '@orkg/orkg-client';
import capitalize from 'capitalize';
import { FC } from 'react';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledImageUpload from '@/components/Form/ControlledImageUpload/ControlledImageUpload';
import ControlledTextArea from '@/components/Form/ControlledTextArea/ControlledTextArea';
import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useConfirmDiscardChanges from '@/components/Form/hooks/useConfirmDiscardChanges';
import useZodForm from '@/components/Form/hooks/useZodForm';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { getOrganizationLogoUrl, updateOrganization } from '@/services/backend/organizations';

const editOrganizationSchema = z.object({
    name: z.string().trim().min(1, 'Please enter an organization name'),
    homepage: z.httpUrl({ error: 'Please enter a valid homepage URL' }),
    description: z.string(),
    logo: z.union([z.instanceof(File), z.string().min(1, 'Please upload an organization image')]),
});

type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;

const toFormValues = (organization: Organization): EditOrganizationFormValues => ({
    name: organization.name,
    homepage: organization.homepage,
    description: organization.description ?? '',
    logo: organization.id ? getOrganizationLogoUrl(organization.id) : '',
});

type EditOrganizationProps = {
    toggle: () => void;
    updateOrganizationMetadata: (organizationData: Organization, logoChanged: boolean) => void;
    organizationData: Organization;
    typeName: string;
};

const EditOrganization: FC<EditOrganizationProps> = ({ toggle, organizationData, updateOrganizationMetadata, typeName }) => {
    const {
        control,
        handleSubmit,
        setError,
        formState: { dirtyFields, isDirty, isSubmitting, errors },
    } = useZodForm({
        schema: editOrganizationSchema,
        values: toFormValues(organizationData),
    });

    const { requestClose } = useConfirmDiscardChanges({ isDirty, onClose: toggle });

    const onSubmit = async (values: EditOrganizationFormValues) => {
        toast.clear();

        const properties: UpdateOrganizationRequestProperties = {};
        if (dirtyFields.name) {
            properties.name = values.name;
        }
        if (dirtyFields.homepage) {
            // Naming asymmetry in the backend: the read model exposes `homepage`, but the update request expects `url`.
            properties.url = values.homepage;
        }
        if (dirtyFields.description) {
            properties.description = values.description;
        }
        const logo = values.logo instanceof File ? values.logo : undefined;

        if (Object.keys(properties).length === 0 && !logo) {
            toggle();
            return;
        }

        try {
            await updateOrganization({ id: organizationData.id, logo, properties });
            toast.success(`${organizationData.name} updated successfully`);
            updateOrganizationMetadata(
                { ...organizationData, name: values.name, homepage: values.homepage, description: values.description },
                Boolean(logo),
            );
            toggle();
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                // Naming asymmetry: the backend update request uses `url`, the form field is `homepage`.
                fieldMap: { url: 'homepage' },
                knownFields: Object.keys(editOrganizationSchema.shape),
            });
            if (!handled) {
                toast.warning(`Something went wrong while updating ${organizationData.name}`);
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
                            <Modal.Heading>Update {typeName}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="flex flex-col gap-4">
                                <FormRootError message={errors.root?.server?.message} />

                                <ControlledTextField
                                    control={control}
                                    name="name"
                                    label={`${capitalize(typeName)} name`}
                                    placeholder={`${typeName} name`}
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledTextField
                                    control={control}
                                    name="homepage"
                                    type="url"
                                    label={`${capitalize(typeName)} URL`}
                                    placeholder="https://www.example.com"
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledTextArea
                                    control={control}
                                    name="description"
                                    label="Description"
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledImageUpload
                                    control={control}
                                    name="logo"
                                    label="Logo"
                                    uploadLabel="Upload logo"
                                    changeLabel="Change logo"
                                    alt={`${typeName} logo preview`}
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

export default EditOrganization;
