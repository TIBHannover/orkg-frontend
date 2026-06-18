'use client';

import { faUpload, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Form, Input, InputGroup, Label, TextArea, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FileTrigger } from 'react-aria-components';
import slugify from 'slugify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
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
import { createOrganization, getOrganization } from '@/services/backend/organizations';
import { getPublicUrl } from '@/utils';

const AddOrganization = () => {
    const params = useParams<{ type: string }>();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [permalink, setPermalink] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.label === params.type);
    const publicOrganizationRoute = `${getPublicUrl()}${reverse(ROUTES.ORGANIZATION, { type: organizationType?.label ?? '', id: '' })}`;
    const { user } = useAuthentication();

    const router = useRouter();

    useEffect(() => {
        document.title = `Create ${organizationType?.alternateLabel} - ORKG`;
    }, [organizationType]);

    const navigateToOrganization = (displayId: string) => {
        setName('');
        setWebsite('');
        setPermalink('');
        setDescription('');
        router.push(reverse(ROUTES.ORGANIZATION, { type: organizationType?.label ?? '', id: displayId }));
    };

    const createNewOrganization = async () => {
        setIsLoading(true);

        if (!name || name.length === 0) {
            toast.danger('Please enter an organization name');
            setIsLoading(false);
            return;
        }
        if (!new RegExp(REGEX.PERMALINK).test(permalink)) {
            toast.danger('Only underscores ( _ ), numbers, and letters are allowed in the permalink field');
            setIsLoading(false);
            return;
        }
        if (!new RegExp(REGEX.URL).test(website)) {
            toast.danger('Please enter a valid website URL');
            setIsLoading(false);
            return;
        }
        if (logo.length === 0) {
            toast.danger('Please upload an organization logo');
            setIsLoading(false);
            return;
        }

        try {
            const organizationId = await createOrganization(name, logo, user?.id ?? '', website, permalink, organizationType?.id ?? '', description);
            const organization = await getOrganization(organizationId);
            navigateToOrganization(organization.displayId);
        } catch (error) {
            console.error(error);
            const message =
                (error as { errors?: { message: string }[] })?.errors?.[0]?.message ?? (error instanceof Error ? error.message : 'Unknown error');
            toast.danger(`Error creating ${organizationType?.alternateLabel}: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        const file = files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <TitleBar>Create {organizationType?.alternateLabel}</TitleBar>
            <Container>
                <Card className="box rounded p-12">
                    <Card.Content className="gap-6 p-0">
                        {!!user && user.isCurationAllowed && (
                            <Form
                                className="flex flex-col gap-6 px-4 pt-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void createNewOrganization();
                                }}
                            >
                                <TextField
                                    fullWidth
                                    name="name"
                                    isDisabled={isLoading}
                                    value={name}
                                    onChange={(value: string) => {
                                        setName(value);
                                        setPermalink(
                                            slugify(value.trim(), {
                                                replacement: '_',
                                                remove: /[*+~%\\<>/;.(){}?,'"!:@#\-^|]/g,
                                                lower: false,
                                            }),
                                        );
                                    }}
                                >
                                    <Label htmlFor="organizationName">Name</Label>
                                    <Input id="organizationName" type="text" maxLength={MAX_LENGTH_INPUT} />
                                </TextField>

                                <TextField fullWidth name="permalink" isDisabled={isLoading} value={permalink} onChange={setPermalink}>
                                    <Label htmlFor="organizationPermalink">
                                        Permalink
                                        <TooltipQuestion message="Permalink field allows to identify the organization page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                    </Label>
                                    <InputGroup>
                                        <InputGroup.Prefix>{publicOrganizationRoute}</InputGroup.Prefix>
                                        <InputGroup.Input id="organizationPermalink" placeholder="name" maxLength={MAX_LENGTH_INPUT} />
                                    </InputGroup>
                                </TextField>

                                <TextField fullWidth name="website" isDisabled={isLoading} value={website} onChange={setWebsite}>
                                    <Label htmlFor="organizationWebsite">Website</Label>
                                    <Input id="organizationWebsite" type="text" placeholder="https://www.example.com" maxLength={MAX_LENGTH_INPUT} />
                                </TextField>

                                <TextField fullWidth name="description" isDisabled={isLoading} value={description} onChange={setDescription}>
                                    <Label htmlFor="organizationDescription">Description</Label>
                                    <TextArea id="organizationDescription" rows={4} maxLength={MAX_LENGTH_INPUT} />
                                </TextField>

                                <div className="flex flex-col gap-2">
                                    <Label>Logo</Label>
                                    {logo && logo.length > 0 && (
                                        <div>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={logo} className="w-1/5" alt="organization logo" />
                                        </div>
                                    )}
                                    <FileTrigger acceptedFileTypes={['image/*']} onSelect={handleFileSelect}>
                                        <Button variant="secondary" isDisabled={isLoading} className="w-fit">
                                            <FontAwesomeIcon icon={faUpload} />
                                            {logo ? 'Change logo' : 'Upload logo'}
                                        </Button>
                                    </FileTrigger>
                                </div>

                                <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isLoading}>
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
