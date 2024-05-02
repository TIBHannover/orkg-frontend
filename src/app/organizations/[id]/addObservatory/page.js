'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { MAX_DESCRIPTION_LENGTH } from 'components/Observatory/EditObservatory';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useRouter from 'components/NextJsMigration/useRouter';
import useParams from 'components/NextJsMigration/useParams';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import { createObservatory } from 'services/backend/observatories';
import { getOrganization } from 'services/backend/organizations';
import { openAuthDialog } from 'slices/authSlice';
import slugify from 'slugify';
import { getPublicUrl } from 'utils';
import { MAX_LENGTH_INPUT } from 'constants/misc';

const AddObservatory = () => {
    const params = useParams();
    const [editorState, setEditorState] = useState('edit');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [researchField, setResearchField] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [permalink, setPermalink] = useState('');
    const publicObservatoryRoute = `${getPublicUrl()}${reverse(ROUTES.OBSERVATORY, { id: ' ' })}`;
    const [isLoadingOrganization, setIsLoadingOrganization] = useState(true);
    const [errorLoadingOrganization, setErrorLoadingOrganization] = useState(null);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const router = useRouter();

    const createNewObservatory = async () => {
        setEditorState('loading');
        if (!name && name.length === 0) {
            toast.error('Please enter an observatory name');
            setEditorState('edit');
            return;
        }

        if (!new RegExp(REGEX.PERMALINK).test(permalink)) {
            toast.error('Only underscores ( _ ), numbers, and letters are allowed in the permalink field');
            setEditorState('edit');
            return;
        }

        if (!description && description.length === 0) {
            toast.error('Please enter an observatory description');
            setEditorState('edit');
            return;
        }

        if (!researchField && researchField.length === 0) {
            toast.error('Please enter an observatory research field');
            setEditorState('edit');
            return;
        }

        try {
            const observatory = await createObservatory(name, params.id, description, researchField.id, permalink);
            navigateToObservatory(observatory.display_id);
        } catch (error) {
            setEditorState('edit');
            console.error(error);
            toast.error(`Error creating an observatory ${error.message}`);
        }
    };

    const navigateToObservatory = (display_id) => {
        setEditorState('edit');
        setName('');
        setDescription('');
        setResearchField('');
        setPermalink('');
        router.push(reverse(ROUTES.OBSERVATORY, { id: display_id }));
    };

    useEffect(() => {
        const loadOrganization = (id) => {
            setIsLoadingOrganization(true);
            getOrganization(id)
                .then((organization) => {
                    document.title = `${organization.name} - ORKG`;
                    setOrganizationName(organization.name);
                    setIsLoadingOrganization(false);
                })
                .catch((err) => {
                    setErrorLoadingOrganization(err);
                    setIsLoadingOrganization(false);
                    setOrganizationName('');
                    console.error(err);
                });
        };
        loadOrganization(params.id);
    }, [params.id]);

    const loading = editorState === 'loading';

    return (
        <>
            {isLoadingOrganization && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoadingOrganization && errorLoadingOrganization && (
                <>{errorLoadingOrganization.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>
            )}
            {!isLoadingOrganization && !errorLoadingOrganization && (
                <>
                    <Container className="d-flex align-items-center">
                        <h3 className="h4 my-4 flex-grow-1">Create observatory in {organizationName}</h3>
                    </Container>

                    <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                        {user && user.isCurationAllowed && (
                            <div className="ps-3 pe-3 pt-2">
                                <FormGroup>
                                    <Label for="ObservatoryName">Name</Label>
                                    <Input
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
                                        type="text"
                                        name="name"
                                        id="ObservatoryName"
                                        disabled={loading}
                                        value={name}
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
                                    <Label for="ObservatoryResearchField">Research field</Label>
                                    <AutoComplete
                                        entityType={ENTITIES.RESOURCE}
                                        optionsClass={CLASSES.RESEARCH_FIELD}
                                        onItemSelected={async (rf) => {
                                            setResearchField({ ...rf, label: rf.value });
                                        }}
                                        value={researchField}
                                        allowCreate={false}
                                        ols={false}
                                        autoLoadOption
                                        isDisabled={loading}
                                        inputId="ObservatoryResearchField"
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
                                        maxLength={MAX_DESCRIPTION_LENGTH}
                                    />
                                    <div className="text-muted text-end">
                                        {description?.length}/{MAX_DESCRIPTION_LENGTH}
                                    </div>
                                </FormGroup>
                                <Button color="primary" onClick={createNewObservatory} className="mt-4 mb-2" isLoading={loading}>
                                    Create observatory
                                </Button>
                            </div>
                        )}
                        {(!user || !user.isCurationAllowed) && (
                            <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => dispatch(openAuthDialog({ action: 'signin' }))}>
                                <Icon className="me-1" icon={faUser} /> Sign in to create an observatory
                            </Button>
                        )}
                    </Container>
                </>
            )}
        </>
    );
};

export default AddObservatory;
