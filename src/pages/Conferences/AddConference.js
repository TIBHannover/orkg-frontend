import { Component } from 'react';
import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import { createOrganization, createConference } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'slices/authSlice';
import PropTypes from 'prop-types';
import REGEX from 'constants/regex';
import { connect } from 'react-redux';
import { reverse } from 'named-urls';
import { getPublicUrl } from 'utils';
import slugify from 'slugify';
import ROUTES from 'constants/routes';
import Tooltip from 'components/Utils/Tooltip';
import TitleBar from 'components/TitleBar/TitleBar';
import { ORGANIZATIONS_TYPES, ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import { useSelector, useDispatch } from 'react-redux';

const AddConference = () => {
    const params = useParams();
    console.log(params.id);
    const [redirect, setRedirect] = useState(false);
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [displayId, setDisplayId] = useState('');
    const [permalink, setPermalink] = useState('');
    const [logo, setLogo] = useState('');
    const [date, setDate] = useState('');
    const [isDoubleBlind, setIsDoubleBlind] = useState(false);
    const [editorState, setEditorState] = useState('edit');
    const organizationType = ORGANIZATIONS_TYPES.find(t => t.label === params.type)?.id;
    const displayType = organizationType === 'GENERAL' ? 'organization' : organizationType === 'CONFERENCE' ? 'conference' : '';
    const publicOrganizationRoute = `${getPublicUrl()}${reverse(
        organizationType === 'GENERAL' ? ROUTES.ORGANIZATION : organizationType === 'CONFERENCE' ? ROUTES.EVENT : '',
        { id: ' ' },
    )}`;
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Create conference series - ORKG';
    }, [displayType]);

    const createNewOrganization = async () => {
        setEditorState('loading');
        // const { name, logo, website, permalink, organizationType, date, isDoubleBlind } = this.state;

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
        // if (logo.length === 0) {
        // toast.error('Please upload an organization logo');
        // setEditorState('edit');
        // return;
        // }

        /* if (organizationType.length === 0) {
            toast.error('Please select an organization type');
            setEditorState('edit');
            return;
        } */

        if (ORGANIZATIONS_TYPES.find(t => t.id === organizationType)?.requireDate && date.length === 0) {
            toast.error('Please select conference date');
            setEditorState('edit');
            return;
        }

        try {
            // create conference
            const responseJson = await createConference(params.id, name, website, permalink, {
                date,
                is_double_blind: true,
            });
            console.log(responseJson);
            navigateToConference(responseJson.display_id);
        } catch (error) {
            setEditorState('edit');
            console.error(error);
            toast.error(`Error creating conference series ${error.message}`);
        }
    };

    const navigateToConference = display_id => {
        setEditorState('edit');
        // setDisplayId(display_id);
        setRedirect(false);
        setName('');
        setDisplayId('');
        setWebsite('');
        setPermalink('');
        navigate(
            reverse(organizationType === 'GENERAL' ? ROUTES.ORGANIZATION : organizationType === 'CONFERENCE' ? ROUTES.EVENT : '', { id: display_id }),
        );
    };

    const handlePreview = async e => {
        e.preventDefault();
        const file = e.target.files[0];
        const reader = new FileReader();
        if (e.target.files.length === 0) {
            return;
        }
        reader.onloadend = e => {
            setLogo([reader.result]);
        };
        reader.readAsDataURL(file);
    };

    const loading = editorState === 'loading';
    // if (redirect) {
    // setRedirect(false);
    // setName('');
    // setDisplayId('');
    // setWebsite('');
    // setPermalink('');

    // return <Navigate to={reverse(ROUTES.ORGANIZATION, { id: displayId })} />;
    // }

    return (
        <>
            <TitleBar>Create conference series</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!!user && user.isCurationAllowed && (
                    <Form className="ps-3 pe-3 pt-2">
                        <FormGroup>
                            <Label for="organizationName">Name</Label>
                            <Input
                                onChange={e => {
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
                                        onChange={e => setPermalink(e.target.value)}
                                        type="text"
                                        name="permalink"
                                        id="organizationPermalink"
                                        disabled={loading}
                                        placeholder="name"
                                        value={permalink}
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="organizationWebsite">Website</Label>
                            <Input
                                onChange={e => setWebsite(e.target.value)}
                                type="text"
                                name="website"
                                id="organizationWebsite"
                                disabled={loading}
                                value={website}
                                placeholder="https://www.example.com"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="conferenceDate">Conference date</Label>
                            <Input
                                onChange={e => setDate(e.target.value)}
                                type="date"
                                name="date"
                                id="conferenceDate"
                                value={date}
                                placeholder="yyyy-mm-dd"
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Input
                                onChange={e => setIsDoubleBlind(e.target.value)}
                                type="checkbox"
                                name="isDoubleBlind"
                                id="doubleBlind"
                                checked={isDoubleBlind}
                            />
                            <Label for="doubleBlind" check>
                                Double blind
                                <Tooltip message="By default the conference is considered single-blind." />
                            </Label>
                        </FormGroup>
                        {/* <FormGroup>
                            <Label for="organizationLogo">Logo</Label>
                            <br />
                            {logo && logo.length > 0 && (
                                <div className="mb-2">
                                    <img src={logo} style={{ width: '20%', height: '20%' }} alt="organization logo" />
                                </div>
                            )}
                            <Input type="file" id="organizationLogo" onChange={handlePreview} />
                            </FormGroup> */}

                        <Button color="primary" onClick={createNewOrganization} className="mb-2 mt-2" disabled={loading}>
                            {!loading ? 'Create organization' : <span>Loading</span>}
                        </Button>
                    </Form>
                )}
                {(!user || !user.isCurationAllowed) && (
                    <>
                        <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => dispatch(openAuthDialog({ action: 'signin' }))}>
                            <Icon className="me-1" icon={faUser} /> Sign in to create organization
                        </Button>
                    </>
                )}
            </Container>
        </>
    );
};

export default AddConference;
