'use client';

import { Form, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useZodForm from '@/components/Form/hooks/useZodForm';
import { uriSchema } from '@/components/Form/schemas/uriSchema';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { createPredicate } from '@/services/backend/predicates';

const createPropertySchema = z.object({
    label: z.string().trim().min(1, 'Please enter a property label'),
    uri: uriSchema,
});

type CreatePropertyFormValues = z.infer<typeof createPropertySchema>;

const AddProperty = () => {
    const router = useRouter();

    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, errors },
    } = useZodForm({
        schema: createPropertySchema,
        defaultValues: { label: '', uri: '' },
    });

    useEffect(() => {
        document.title = 'Add property - ORKG';
    }, []);

    const onSubmit = async (values: CreatePropertyFormValues) => {
        toast.clear();

        try {
            const newPropertyId = await createPredicate(values.label, undefined, values.uri || undefined);
            toast.success('Property created successfully');
            router.push(`${reverse(ROUTES.PROPERTY, { id: newPropertyId })}?isEditMode=true`);
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                knownFields: Object.keys(createPropertySchema.shape),
            });
            if (!handled) {
                toast.warning('Something went wrong while creating the property');
            }
        }
    };

    return (
        <>
            <TitleBar>Create property</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <Form className="flex flex-col gap-6 pt-2" onSubmit={handleSubmit(onSubmit)}>
                        <FormRootError message={errors.root?.server?.message} />

                        <ControlledTextField
                            control={control}
                            name="label"
                            label="Property label"
                            maxLength={MAX_LENGTH_INPUT}
                            isDisabled={isSubmitting}
                        />

                        <ControlledTextField
                            control={control}
                            name="uri"
                            type="url"
                            label={
                                <>
                                    URI <span className="text-muted font-normal italic">(optional)</span>
                                </>
                            }
                            placeholder="https://example.org/ontology#Term"
                            maxLength={MAX_LENGTH_INPUT}
                            isDisabled={isSubmitting}
                            description="Please provide the URI if you are using a property defined in an external ontology"
                        />

                        <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isSubmitting}>
                            Create property
                        </ButtonWithLoading>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(AddProperty);
