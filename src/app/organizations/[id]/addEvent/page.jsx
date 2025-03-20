'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from 'components/hooks/useAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import useParams from 'components/useParams/useParams';
import Tooltip from 'components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { CONFERENCE_REVIEW_TYPE } from 'constants/organizationsTypes';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Container, Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import { createConference } from 'services/backend/conferences-series';
import slugify from 'slugify';
import { getPublicUrl } from 'utils';

const AddConference = () => {
    const params = useParams();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [permalink, setPermalink] = useState('');
    const [startDate, setStartDate] = useState('');
    const [reviewType, setReviewType] = useState('');
    const [editorState, setEditorState] = useState('edit');
    const publicConferenceRoute = `${getPublicUrl()}${reverse(ROUTES.EVENT_SERIES, { id: ' ' })}`;
    const { user } = useAuthentication();
    const router = useRouter();

    useEffect(() => {
        document.title = 'Create conference series - ORKG';
        // make single-blind the default option
        setReviewType(CONFERENCE_REVIEW_TYPE.find((t) => t.label === 'Single-blind')?.id);
    }, []);

    const navigateToConference = (displayId) => {
        setEditorState('edit');
        setName('');
        setWebsite('');
        setPermalink('');
        router.push(reverse(ROUTES.EVENT_SERIES, { id: displayId }));
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

        if (startDate.length === 0) {
            toast.error('Please select conference date');
            setEditorState('edit');
            return;
        }

        if (reviewType.length === 0) {
            toast.error('Please select conference review process');
            setEditorState('edit');
            return;
        }

        try {
            const responseJson = await createConference(params.id, name, website, permalink, {
                start_date: startDate,
                review_type: reviewType,
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
            <TitleBar>Create conference event</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!!user && user.isCurationAllowed && (
                    <Form className="ps-3 pe-3 pt-2">
                        <FormGroup>
                            <Label for="conferenceName">Name</Label>
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
                                id="conferenceName"
                                disabled={loading}
                                value={name}
                                maxLength={MAX_LENGTH_INPUT}
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
                                        onChange={(e) => setPermalink(e.target.value)}
                                        type="text"
                                        name="permalink"
                                        id="conferencePermalink"
                                        disabled={loading}
                                        placeholder="name"
                                        value={permalink}
                                        maxLength={MAX_LENGTH_INPUT}
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="conferenceWebsite">Website</Label>
                            <Input
                                onChange={(e) => setWebsite(e.target.value)}
                                type="text"
                                name="website"
                                id="conferenceWebsite"
                                disabled={loading}
                                value={website}
                                placeholder="https://www.example.com"
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="conferenceDate">Conference date</Label>
                            <Input
                                onChange={(e) => setStartDate(e.target.value)}
                                type="date"
                                name="date"
                                id="conferenceDate"
                                value={startDate}
                                placeholder="yyyy-mm-dd"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="conferenceReviewType">Review process</Label>
                            <Input
                                onChange={(e) => {
                                    setReviewType(CONFERENCE_REVIEW_TYPE.find((t) => t.id === e.target.value)?.id);
                                }}
                                value={reviewType}
                                name="reviewType"
                                type="select"
                                id="conferenceReviewType"
                            >
                                {CONFERENCE_REVIEW_TYPE.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <ButtonWithLoading color="primary" onClick={createNewConference} className="mb-2 mt-2" isLoading={loading}>
                            Create conference event
                        </ButtonWithLoading>
                    </Form>
                )}
                {(!user || !user.isCurationAllowed) && (
                    <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => signIn('keycloak')}>
                        <FontAwesomeIcon className="me-1" icon={faUser} /> Sign in to create conference event
                    </Button>
                )}
            </Container>
        </>
    );
};

export default AddConference;
