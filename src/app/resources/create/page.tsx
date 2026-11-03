'use client';

import { Cite } from '@citation-js/core';
import { Form, Label, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import useSWR from 'swr';
import { z } from 'zod';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import FormRootError from '@/components/Form/FormRootError/FormRootError';
import useZodForm from '@/components/Form/hooks/useZodForm';
import { uriSchema } from '@/components/Form/schemas/uriSchema';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA } from '@/constants/contentTypes';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { createLiteral } from '@/services/backend/literals';
import { createResource } from '@/services/backend/resources';
import { createLiteralStatement } from '@/services/backend/statements';

const createResourceSchema = z.object({
    label: z.string().trim().min(1, 'Please enter a resource label'),
    uri: uriSchema,
});

type CreateResourceFormValues = z.infer<typeof createResourceSchema>;

const CreateResourcePage = () => {
    const isDOI = new RegExp(REGEX.DOI_ID);
    const { isCurationAllowed } = useAuthentication();

    const router = useRouter();

    const [classes, setClasses] = useQueryState<string[]>('classes', {
        defaultValue: [],
        parse: (value) => value.split(','),
    });

    const { data: classesData, isLoading: isLoadingDefaultClasses } = useSWR(
        // only admins can add research field resources
        classes && classes.length > 0 ? [classes.filter((c) => isCurationAllowed || c !== CLASSES.RESEARCH_FIELD), classesUrl, 'getClassById'] : null,
        ([params]) => Promise.all(params.map((p) => getClassById(p))),
    );

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        formState: { isSubmitting, errors },
    } = useZodForm({
        schema: createResourceSchema,
        defaultValues: { label: '', uri: '' },
    });

    useEffect(() => {
        document.title = 'Create resource - ORKG';
    }, []);

    const onSubmit = async (values: CreateResourceFormValues) => {
        toast.clear();

        if (!isCurationAllowed && classes && classes.some((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x))) {
            toast.danger(
                `The selected option ${classes
                    .filter((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x))
                    .join(', ')} cannot be set manually; it is reserved for managing content types in the system`,
            );
            return;
        }

        if (isDOI.test(values.label)) {
            const doi = values.label;
            try {
                const responseJson = await Cite.async(doi);
                setValue('label', responseJson.data[0].title);
                const newResourceId = await createResource({
                    label: responseJson.data[0].title,
                    classes: classesData ? classesData.map((c) => c.id) : [],
                    uri: values.uri || undefined,
                });
                const literalDoiId = await createLiteral(doi);
                await createLiteralStatement(newResourceId, PREDICATES.HAS_DOI, literalDoiId);
                toast.success('Resource created successfully');
                router.push(`${reverse(ROUTES.RESOURCE, { id: newResourceId })}?noRedirect&isEditMode=true`);
            } catch (error) {
                const handled = await applyServerErrorsToForm(error, {
                    setError,
                    knownFields: Object.keys(createResourceSchema.shape),
                });
                if (!handled) {
                    setError('root.server', {
                        type: 'server',
                        message: `Error finding DOI: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    });
                }
            }
        } else {
            try {
                const newResourceId = await createResource({
                    label: values.label,
                    classes: classesData ? classesData.map((c) => c.id) : [],
                    uri: values.uri || undefined,
                });
                toast.success('Resource created successfully');
                router.push(`${reverse(ROUTES.RESOURCE, { id: newResourceId })}?noRedirect&isEditMode=true`);
            } catch (error) {
                const handled = await applyServerErrorsToForm(error, {
                    setError,
                    knownFields: Object.keys(createResourceSchema.shape),
                });
                if (!handled) {
                    toast.warning('Something went wrong while creating the resource');
                }
            }
        }
    };

    const handleClassSelect = async (selected: MultiValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'create-option') {
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                const newClasses = [...classes];
                newClasses[foundIndex] = newClass.id;
                setClasses(newClasses);
            } else {
                return null;
            }
        } else {
            if (!isCurationAllowed && selected && selected.some((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x.id))) {
                toast.danger(
                    `The selected option ${selected
                        .filter((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x.id))
                        .map((x) => x.label)
                        .join(', ')} cannot be set manually; it is reserved for managing content types in the system`,
                );
                return null;
            }
            setClasses(selected.map((x) => x.id));
        }
        return null;
    };

    return (
        <>
            <TitleBar>Create resource</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <Form className="flex flex-col gap-6 pt-2" onSubmit={handleSubmit(onSubmit)}>
                        <FormRootError message={errors.root?.server?.message} />

                        <ControlledTextField
                            control={control}
                            name="label"
                            label="Resource label or DOI"
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
                            description="Please provide the URI if you are using a resource defined in an external ontology"
                        />

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="select-classes">
                                Classes <span className="text-muted font-normal italic">(optional)</span>
                            </Label>
                            {!isLoadingDefaultClasses && (
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    onChange={(selected, action) => {
                                        handleClassSelect(selected, action);
                                    }}
                                    placeholder="Select or type to enter a class"
                                    value={classesData as OptionType[] | undefined}
                                    openMenuOnFocus
                                    allowCreate
                                    isClearable
                                    isMulti
                                    enableExternalSources
                                    inputId="select-classes"
                                />
                            )}
                            {isLoadingDefaultClasses && <div>Loading default classes</div>}
                        </div>

                        <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isSubmitting}>
                            Create resource
                        </ButtonWithLoading>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateResourcePage);
