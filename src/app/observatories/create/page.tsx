'use client';

import Autocomplete from 'components/Autocomplete/Autocomplete';
import { OptionType } from 'components/Autocomplete/types';
import Option from 'components/AutocompleteObservatory/CustomComponents/Option';
import useAuthentication from 'components/hooks/useAuthentication';
import Unauthorized from 'components/Unauthorized/Unauthorized';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import requireAuthentication from 'requireAuthentication';
import { createObservatory } from 'services/backend/observatories';
import { getAllOrganizations, getOrganization, organizationsUrl } from 'services/backend/organizations';
import { Organization } from 'services/backend/types';
import slugify from 'slugify';
import useSWR from 'swr';
import { getPublicUrl } from 'utils';
import { z } from 'zod';

const observatorySchema = z.object({
    observatoryName: z.string().min(1, 'Please enter an observatory name').max(MAX_LENGTH_INPUT),
    permalink: z.string().regex(new RegExp(REGEX.PERMALINK), 'Only underscores ( _ ), numbers, and letters are allowed in the permalink field'),
    description: z.string().min(1, 'Please enter an observatory description').max(MAX_LENGTH_INPUT),
    researchField: z
        .object({ id: z.string() })
        .nullable()
        .refine((val) => val !== null, 'Please enter an observatory research field'),
    organization: z
        .object({ id: z.string() })
        .nullable()
        .refine((val) => val !== null, 'Please select an organization'),
});

const CreateObservatory = () => {
    const searchParams = useSearchParams();
    const organizationId = searchParams.get('organizationId') || '';
    const { data: prefilledOrganization } = useSWR(organizationId ? [organizationId, organizationsUrl, 'getOrganization'] : null, ([params]) =>
        getOrganization(params),
    );
    const { data: organizations, isLoading } = useSWR([organizationsUrl, 'getAllOrganizations'], () => getAllOrganizations());

    const [editorState, setEditorState] = useState('edit');
    const [observatoryName, setObservatoryName] = useState('');
    const [description, setDescription] = useState('');
    const [researchField, setResearchField] = useState<OptionType | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(prefilledOrganization || null);
    const [permalink, setPermalink] = useState('');
    const { isCurationAllowed } = useAuthentication();

    const publicObservatoryRoute = `${getPublicUrl()}${reverse(ROUTES.OBSERVATORY, { id: ' ' })}`;

    const router = useRouter();

    const createNewObservatory = async () => {
        setEditorState('loading');

        try {
            const validatedData = observatorySchema.parse({
                observatoryName,
                permalink,
                description,
                researchField,
                organization,
            });

            const observatory = await createObservatory({
                observatory_name: validatedData.observatoryName,
                organization_id: validatedData.organization?.id ?? '',
                description: validatedData.description,
                research_field: validatedData.researchField?.id ?? '',
                display_id: validatedData.permalink,
            });
            setEditorState('edit');
            setObservatoryName('');
            setDescription('');
            setResearchField(null);
            setPermalink('');
            router.push(reverse(ROUTES.OBSERVATORY, { id: observatory.display_id }));
        } catch (error) {
            setEditorState('edit');
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => {
                    toast.error(err.message);
                });
            } else {
                console.error(error);
                toast.error(`Error creating an observatory: ${(error as Error).message}`);
            }
        }
    };

    useEffect(() => {
        if (prefilledOrganization) {
            setOrganization(prefilledOrganization);
        }
    }, [organizationId, prefilledOrganization]);

    const loading = editorState === 'loading';

    if (!isCurationAllowed) {
        return <Unauthorized />;
    }

    return (
        <>
            <Container className="d-flex align-items-center">
                <h3 className="h4 my-4 flex-grow-1">Create observatory</h3>
            </Container>

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="ps-3 pe-3 pt-2">
                    <FormGroup>
                        <Label for="ObservatoryName">Name</Label>
                        <Input
                            onChange={(e) => {
                                setObservatoryName(e.target.value);
                                setPermalink(
                                    slugify(e.target.value.trim(), {
                                        replacement: '_',
                                        remove: /[*+~%\\<>/;.(){}?,'"!:@\\#\-^|]/g,
                                        lower: false,
                                    }),
                                );
                            }}
                            type="text"
                            name="name"
                            id="ObservatoryName"
                            disabled={loading}
                            value={observatoryName}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </FormGroup>
                    <FormGroup>
                        <div>
                            <Label for="observatoryPermalink">
                                Permalink
                                <Tooltip message="Permalink field allows to identify the observatory page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                            </Label>
                            <InputGroup>
                                <span className="input-group-text">{publicObservatoryRoute}</span>
                                <Input
                                    onChange={(e) => setPermalink(e.target.value)}
                                    type="text"
                                    name="permalink"
                                    id="observatoryPermalink"
                                    disabled={loading}
                                    placeholder="name"
                                    value={permalink}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </InputGroup>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label for="select-organization">Organization</Label>
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
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="ObservatoryResearchField">Research field</Label>
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
                    </FormGroup>
                    <FormGroup>
                        <Label for="ObservatoryDescription">Observatory description</Label>
                        <Input
                            onChange={(e) => setDescription(e.target.value)}
                            type="textarea"
                            name="description"
                            value={description}
                            id="ObservatoryDescription"
                            disabled={loading}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                        <div className="text-muted text-end">
                            {description?.length}/{MAX_LENGTH_INPUT}
                        </div>
                    </FormGroup>
                    <Button color="primary" onClick={createNewObservatory} className="mt-2 mb-2" isLoading={loading}>
                        Create observatory
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateObservatory);
