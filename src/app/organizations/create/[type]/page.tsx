'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Form, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';
import slugify from 'slugify';
import { mutate } from 'swr';
import { z } from 'zod';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ControlledImageUpload from '@/components/Form/ControlledImageUpload/ControlledImageUpload';
import ControlledTextArea from '@/components/Form/ControlledTextArea/ControlledTextArea';
import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useZodForm from '@/components/Form/hooks/useZodForm';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import TooltipQuestion from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createOrganization, getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { getPublicUrl } from '@/utils';

const createOrganizationSchema = z.object({
    name: z.string().trim().min(1, 'Please enter an organization name'),
    permalink: z.string().regex(new RegExp(REGEX.PERMALINK), 'Only underscores ( _ ), numbers, and letters are allowed in the permalink field'),
    website: z.httpUrl({ error: 'Please enter a valid website URL' }),
    description: z.string().trim(),
    logo: z.union([z.instanceof(File), z.string().min(1, 'Please upload an organization logo')]),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

// The create endpoint still takes the logo as a base64 data URL in the JSON body
// (unlike update, which sends the File as multipart).
const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const AddOrganization = () => {
    const params = useParams<{ type: string }>();
    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.label === params.type);
    const publicOrganizationRoute = `${getPublicUrl()}${reverse(ROUTES.ORGANIZATION, { type: organizationType?.label ?? '', id: '' })}`;
    const { user } = useAuthentication();
    const router = useRouter();

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { isSubmitting, errors },
    } = useZodForm({
        schema: createOrganizationSchema,
        defaultValues: { name: '', permalink: '', website: '', description: '', logo: '' },
    });

    useEffect(() => {
        document.title = `Create ${organizationType?.alternateLabel} - ORKG`;
    }, [organizationType]);

    useEffect(() => {
        const subscription = watch((values, { name: changedField }) => {
            if (changedField === 'name') {
                setValue(
                    'permalink',
                    slugify((values.name ?? '').trim(), {
                        replacement: '_',
                        remove: /[*+~%\\<>/;.(){}?,'"!:@#\-^|]/g,
                        lower: false,
                    }),
                );
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    const onSubmit = async (values: CreateOrganizationFormValues) => {
        toast.clear();

        try {
            const logo = values.logo instanceof File ? await readFileAsDataUrl(values.logo) : values.logo;
            const organizationId = await createOrganization(
                values.name,
                logo,
                user?.id ?? '',
                values.website,
                values.permalink,
                organizationType?.id ?? '',
                values.description || undefined,
            );
            const organization = await getOrganization(organizationId);
            // SWR is configured with `revalidateIfStale: false`, so a cached listing would keep hiding the new
            // organization. Drop the cached lists instead of only revalidating them: the listing pages aren't
            // mounted here, so they would otherwise never refetch.
            await mutate(
                (key) =>
                    Array.isArray(key) && key.includes(organizationsUrl) && (key.includes('getAllOrganizations') || key.includes('getConferences')),
                undefined,
            );
            router.push(reverse(ROUTES.ORGANIZATION, { type: organizationType?.label ?? '', id: organization.displayId }));
        } catch (error) {
            const handled = await applyServerErrorsToForm(error, {
                setError,
                // Backend create request field -> form field.
                fieldMap: { organization_name: 'name', organization_logo: 'logo', url: 'website', display_id: 'permalink' },
                knownFields: Object.keys(createOrganizationSchema.shape),
            });
            if (!handled) {
                toast.warning(`Something went wrong while creating the ${organizationType?.alternateLabel ?? 'organization'}`);
            }
        }
    };

    return (
        <>
            <TitleBar>Create {organizationType?.alternateLabel}</TitleBar>
            <Container>
                <Card className="box rounded p-12">
                    <Card.Content className="gap-6 p-0">
                        {!!user && user.isCurationAllowed && (
                            <Form className="flex flex-col gap-6 px-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
                                <FormRootError message={errors.root?.server?.message} />

                                <ControlledTextField
                                    control={control}
                                    name="name"
                                    label="Name"
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledTextField
                                    control={control}
                                    name="permalink"
                                    label={
                                        <>
                                            Permalink
                                            <TooltipQuestion message="Permalink field allows to identify the organization page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                        </>
                                    }
                                    prefix={publicOrganizationRoute}
                                    placeholder="name"
                                    maxLength={MAX_LENGTH_INPUT}
                                    isDisabled={isSubmitting}
                                />

                                <ControlledTextField
                                    control={control}
                                    name="website"
                                    type="url"
                                    label="Website"
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
                                    alt="Organization logo preview"
                                    isDisabled={isSubmitting}
                                />

                                <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isSubmitting}>
                                    Create organization
                                </ButtonWithLoading>
                            </Form>
                        )}
                        {(!user || !user.isCurationAllowed) && (
                            <Button variant="tertiary" className="mt-2 mb-2 w-fit p-0" onPress={() => signIn('keycloak')}>
                                <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in to create organization
                            </Button>
                        )}
                    </Card.Content>
                </Card>
            </Container>
        </>
    );
};

export default AddOrganization;
