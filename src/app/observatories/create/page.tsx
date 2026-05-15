'use client';

import { Input, InputGroup, Label, TextArea, TextField, toast } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import slugify from 'slugify';
import useSWR from 'swr';
import { z } from 'zod';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import { OptionType } from '@/components/Autocomplete/types';
import Option from '@/components/AutocompleteObservatory/CustomComponents/Option';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import Container from '@/components/Ui/Structure/Container';
import Unauthorized from '@/components/Unauthorized/Unauthorized';
import Tooltip from '@/components/Utils/Tooltip';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { createObservatory, getObservatoryById } from '@/services/backend/observatories';
import { getAllOrganizations, getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Organization } from '@/services/backend/types';
import { getPublicUrl } from '@/utils';

const observatorySchema = z.object({
    name: z.string().min(1, { error: 'Please enter an observatory name' }).max(MAX_LENGTH_INPUT),
    permalink: z.string().regex(new RegExp(REGEX.PERMALINK), {
        error: 'Only underscores ( _ ), numbers, and letters are allowed in the permalink field',
    }),
    description: z.string().min(1, { error: 'Please enter an observatory description' }).max(MAX_LENGTH_INPUT),
    researchField: z
        .object({ id: z.string() })
        .nullable()
        .refine((val) => val !== null, { error: 'Please enter an observatory research field' }),
    organization: z
        .object({ id: z.string() })
        .nullable()
        .refine((val) => val !== null, { error: 'Please select an organization' }),
});

const CreateObservatory = () => {
    const searchParams = useSearchParams();
    const organizationId = searchParams.get('organizationId') || '';
    const { data: prefilledOrganization } = useSWR(organizationId ? [organizationId, organizationsUrl, 'getOrganization'] : null, ([params]) =>
        getOrganization(params),
    );
    const { data: organizations, isLoading } = useSWR([organizationsUrl, 'getAllOrganizations'], () => getAllOrganizations());

    const [editorState, setEditorState] = useState('edit');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [researchField, setResearchField] = useState<OptionType | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(prefilledOrganization || null);
    const [permalink, setPermalink] = useState('');
    const { isCurationAllowed } = useAuthentication();

    const publicObservatoryRoute = `${getPublicUrl()}${reverse(ROUTES.OBSERVATORY, { id: '' })}`;

    const router = useRouter();

    const createNewObservatory = async () => {
        setEditorState('loading');

        try {
            const validatedData = observatorySchema.parse({
                name,
                permalink,
                description,
                researchField,
                organization,
            });

            const newObservatoryId = await createObservatory({
                name: validatedData.name,
                organization_id: validatedData.organization?.id ?? '',
                description: validatedData.description,
                research_field: validatedData.researchField?.id ?? '',
                display_id: validatedData.permalink,
            });
            const observatory = await getObservatoryById(newObservatoryId);
            setEditorState('edit');
            setName('');
            setDescription('');
            setResearchField(null);
            setPermalink('');
            router.push(reverse(ROUTES.OBSERVATORY, { id: observatory.display_id }));
        } catch (error) {
            setEditorState('edit');
            if (error instanceof z.ZodError) {
                error.issues.forEach((err) => {
                    toast.danger(err.message);
                });
            } else {
                console.error(error);
                toast.danger(`Error creating an observatory: ${(error as Error).message}`);
            }
        }
    };

    useEffect(() => {
        if (prefilledOrganization) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOrganization(prefilledOrganization);
        }
    }, [organizationId, prefilledOrganization]);

    const loading = editorState === 'loading';

    if (!isCurationAllowed) {
        return <Unauthorized />;
    }

    return (
        <>
            <Container className="flex items-center">
                <h3 className="text-2xl my-6 grow">Create observatory</h3>
            </Container>
            <Container>
                <div className="box rounded py-6 px-12">
                    <div className="px-4 pt-2 flex flex-col gap-5">
                        <TextField fullWidth isDisabled={loading}>
                            <Label htmlFor="ObservatoryName">Name</Label>
                            <Input
                                id="ObservatoryName"
                                type="text"
                                name="name"
                                value={name}
                                maxLength={MAX_LENGTH_INPUT}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setPermalink(
                                        slugify(e.target.value.trim(), {
                                            replacement: '_',
                                            remove: /[*+~%\\<>/;.(){}?,'"!:@\\#\-^|]/g,
                                            lower: false,
                                        }),
                                    );
                                }}
                            />
                        </TextField>

                        <TextField fullWidth isDisabled={loading}>
                            <Label htmlFor="observatoryPermalink">
                                Permalink
                                <Tooltip message="Permalink field allows to identify the observatory page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                            </Label>
                            <InputGroup fullWidth className="flex-col items-stretch sm:flex-row sm:items-center">
                                <InputGroup.Prefix className="min-w-0 justify-start break-all border-b sm:border-b-0 sm:break-normal">
                                    {publicObservatoryRoute}
                                </InputGroup.Prefix>
                                <InputGroup.Input
                                    id="observatoryPermalink"
                                    name="permalink"
                                    placeholder="name"
                                    value={permalink}
                                    maxLength={MAX_LENGTH_INPUT}
                                    onChange={(e) => setPermalink(e.target.value)}
                                />
                            </InputGroup>
                        </TextField>

                        <div>
                            <Label htmlFor="select-organization">Organization</Label>
                            <Select
                                isDisabled={!!prefilledOrganization}
                                value={organization}
                                components={{ Option }}
                                options={isLoading ? [] : organizations}
                                onChange={(value) => setOrganization(value as Organization)}
                                getOptionValue={({ id }) => id}
                                getOptionLabel={({ name }) => name}
                                inputId="select-organization"
                                isClearable
                                classNamePrefix="react-select"
                                classNames={customClassNames as any}
                                styles={customStyles as any}
                                menuPosition="fixed"
                            />
                        </div>

                        <div>
                            <Label htmlFor="ObservatoryResearchField">Research field</Label>
                            <Autocomplete
                                entityType={ENTITIES.RESOURCE}
                                includeClasses={[CLASSES.RESEARCH_FIELD]}
                                onChange={(rf) => setResearchField(rf)}
                                value={researchField}
                                enableExternalSources={false}
                                isDisabled={loading}
                                inputId="ObservatoryResearchField"
                                allowCreate={false}
                            />
                        </div>

                        <TextField fullWidth isDisabled={loading}>
                            <Label htmlFor="ObservatoryDescription">Observatory description</Label>
                            <TextArea
                                id="ObservatoryDescription"
                                name="description"
                                value={description}
                                maxLength={MAX_LENGTH_INPUT}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="text-gray-500 text-right text-sm">
                                {description?.length}/{MAX_LENGTH_INPUT}
                            </div>
                        </TextField>

                        <ButtonWithLoading variant="primary" onClick={createNewObservatory} className="mt-1 mb-1" isLoading={loading}>
                            Create observatory
                        </ButtonWithLoading>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateObservatory);
