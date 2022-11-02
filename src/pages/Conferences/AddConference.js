import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import { createConference } from 'services/backend/conferencesseries';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'slices/authSlice';
import REGEX from 'constants/regex';
import { reverse } from 'named-urls';
import { getPublicUrl } from 'utils';
import slugify from 'slugify';
import ROUTES from 'constants/routes';
import Tooltip from 'components/Utils/Tooltip';
import TitleBar from 'components/TitleBar/TitleBar';
import { useSelector, useDispatch } from 'react-redux';

const AddConference = () => {
    const params = useParams();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [permalink, setPermalink] = useState('');
    const [date, setDate] = useState('');
    const [isDoubleBlind, setIsDoubleBlind] = useState(false);
    const [editorState, setEditorState] = useState('edit');
    const publicConferenceRoute = `${getPublicUrl()}${reverse(ROUTES.EVENT_SERIES, { id: ' ' })}`;
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Create conference series - ORKG';
    }, []);

    const navigateToConference = display_id => {
        setEditorState('edit');
        setName('');
        setWebsite('');
        setPermalink('');
        navigate(reverse(ROUTES.EVENT_SERIES, { id: display_id }));
    };

    const createNewConference = async () => {
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

        if (date.length === 0) {
            toast.error('Please select conference date');
            setEditorState('edit');
            return;
        }

        try {
            const responseJson = await createConference(params.id, name, website, permalink, {
                date,
                is_double_blind: isDoubleBlind,
            });
            navigateToConference(responseJson.display_id);
        } catch (error) {
            setEditorState('edit');
            console.error(error);
            toast.error(`Error creating conference series ${error.message}`);
        }
    };

    const loading = editorState === 'loading';

    return (
        <>
            <TitleBar>Create conference series</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!!user && user.isCurationAllowed && (
                    <Form className="ps-3 pe-3 pt-2">
                        <FormGroup>
                            <Label for="conferenceName">Name</Label>
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
                                id="conferenceName"
                                disabled={loading}
                                value={name}
                            />
                        </FormGroup>

                        <FormGroup>
                            <div>
                                <Label for="conferencePermalink">
                                    Permalink
                                    <Tooltip message="Permalink field allows to identify the conference page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                </Label>
                                <InputGroup>
                                    <span className="input-group-text">{publicConferenceRoute}</span>
                                    <Input
                                        onChange={e => setPermalink(e.target.value)}
                                        type="text"
                                        name="permalink"
                                        id="conferencePermalink"
                                        disabled={loading}
                                        placeholder="name"
                                        value={permalink}
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="conferenceWebsite">Website</Label>
                            <Input
                                onChange={e => setWebsite(e.target.value)}
                                type="text"
                                name="website"
                                id="conferenceWebsite"
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
                                onChange={e => setIsDoubleBlind(e.target.checked)}
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

                        <Button color="primary" onClick={createNewConference} className="mb-2 mt-2" disabled={loading}>
                            {!loading ? 'Create conference' : <span>Loading</span>}
                        </Button>
                    </Form>
                )}
                {(!user || !user.isCurationAllowed) && (
                    <>
                        <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => dispatch(openAuthDialog({ action: 'signin' }))}>
                            <Icon className="me-1" icon={faUser} /> Sign in to create conference
                        </Button>
                    </>
                )}
            </Container>
        </>
    );
};

export default AddConference;
