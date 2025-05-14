'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Container, Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import slugify from 'slugify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { createOrganization, getOrganization } from '@/services/backend/organizations';
import { getPublicUrl } from '@/utils';

const AddOrganization = () => {
    const params = useParams();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [permalink, setPermalink] = useState('');
    const [logo, setLogo] = useState('');
    const [editorState, setEditorState] = useState('edit');
    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.label === params.type);
    const publicOrganizationRoute = `${getPublicUrl()}${reverse(ROUTES.ORGANIZATION, { type: organizationType?.label, id: ' ' })}`;
    const { user } = useAuthentication();

    const router = useRouter();

    useEffect(() => {
        document.title = `Create ${organizationType?.alternateLabel} - ORKG`;
    }, [organizationType]);

    const navigateToOrganization = (display_id) => {
        setEditorState('edit');
        setName('');
        setWebsite('');
        setPermalink('');
        router.push(reverse(ROUTES.ORGANIZATION, { type: organizationType?.label, id: display_id }));
    };

    const createNewOrganization = async () => {
        setEditorState('loading');

        if (!name || name.length === 0) {
            toast.error('Please enter an organization name');
            setEditorState('edit');
            return;
        }
        if (!new RegExp(REGEX.PERMALINK).test(permalink)) {
            toast.error('Only underscores ( _ ), numbers, and letters are allowed in the permalink field');
            setEditorState('edit');
            return;
        }
        if (!new RegExp(REGEX.URL).test(website)) {
            toast.error('Please enter a valid website URL');
            setEditorState('edit');
            return;
        }
        if (logo.length === 0) {
            toast.error('Please upload an organization logo');
            setEditorState('edit');
            return;
        }

        try {
            const organizationId = await createOrganization(name, logo[0], user.id, website, permalink, organizationType?.id);
            const organization = await getOrganization(organizationId);
            navigateToOrganization(organization.display_id);
        } catch (error) {
            setEditorState('edit');
            console.log(error);
            toast.error(`Error creating ${organizationType?.alternateLabel}: ${error.errors[0].message}`);
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        const reader = new FileReader();
        if (e.target.files.length === 0) {
            return;
        }
        reader.onloadend = () => {
            setLogo([reader.result]);
        };
        reader.readAsDataURL(file);
    };
    const loading = editorState === 'loading';

    return (
        <>
            <TitleBar>Create {organizationType?.alternateLabel}</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!!user && user.isCurationAllowed && (
                    <Form className="ps-3 pe-3 pt-2" onSubmit={(e) => e.preventDefault()}>
                        <FormGroup>
                            <Label for="organizationName">Name</Label>
                            <Input
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setPermalink(
                                        slugify(e.target.value.trim(), {
                                            replacement: '_',
                                            remove: /[*+~%\\<>/;.(){}?,'"!:@#\-^|]/g,
                                            lower: false,
                                        }),
                                    );
                                }}
                                type="text"
                                name="name"
                                id="organizationName"
                                disabled={loading}
                                value={name}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>

                        <FormGroup>
                            <div>
                                <Label for="organizationPermalink">
                                    Permalink
                                    <Tooltip message="Permalink field allows to identify the organization page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                </Label>
                                <InputGroup>
                                    <span className="input-group-text">{publicOrganizationRoute}</span>
                                    <Input
                                        onChange={(e) => setPermalink(e.target.value)}
                                        type="text"
                                        name="permalink"
                                        id="organizationPermalink"
                                        disabled={loading}
                                        placeholder="name"
                                        value={permalink}
                                        maxLength={MAX_LENGTH_INPUT}
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="organizationWebsite">Website</Label>
                            <Input
                                onChange={(e) => setWebsite(e.target.value)}
                                type="text"
                                name="website"
                                id="organizationWebsite"
                                disabled={loading}
                                value={website}
                                placeholder="https://www.example.com"
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="organizationLogo">Logo</Label>
                            <br />
                            {logo && logo.length > 0 && (
                                <div className="mb-2">
                                    <img src={logo} style={{ width: '20%', height: '20%' }} alt="organization logo" />
                                </div>
                            )}
                            <Input type="file" id="organizationLogo" onChange={handlePreview} />
                        </FormGroup>

                        <ButtonWithLoading type="submit" color="primary" onClick={createNewOrganization} className="mb-2 mt-2" isLoading={loading}>
                            Create organization
                        </ButtonWithLoading>
                    </Form>
                )}
                {(!user || !user.isCurationAllowed) && (
                    <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => signIn('keycloak')}>
                        <FontAwesomeIcon className="me-1" icon={faUser} /> Sign in to create organization
                    </Button>
                )}
            </Container>
        </>
    );
};

export default AddOrganization;
