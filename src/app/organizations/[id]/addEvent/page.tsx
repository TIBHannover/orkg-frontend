'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Form, Input, InputGroup, Label, ListBox, Select, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import slugify from 'slugify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import TooltipQuestion from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { CONFERENCE_REVIEW_TYPE } from '@/constants/organizationsTypes';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createConference, getConferenceById } from '@/services/backend/conferences-series';
import { getPublicUrl } from '@/utils';

const AddConference = () => {
    const params = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [permalink, setPermalink] = useState('');
    const [startDate, setStartDate] = useState('');
    const [reviewType, setReviewType] = useState<string>(CONFERENCE_REVIEW_TYPE.find((t) => t.label === 'Single-blind')?.id ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const publicConferenceRoute = `${getPublicUrl()}${reverse(ROUTES.EVENT_SERIES, { id: '' })}`;
    const { user } = useAuthentication();
    const router = useRouter();

    useEffect(() => {
        document.title = 'Create conference series - ORKG';
    }, []);

    const navigateToConference = (displayId: string) => {
        setName('');
        setWebsite('');
        setPermalink('');
        router.push(reverse(ROUTES.EVENT_SERIES, { id: displayId }));
    };

    const createNewConference = async () => {
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
        if (startDate.length === 0) {
            toast.danger('Please select conference date');
            setIsLoading(false);
            return;
        }
        if (reviewType.length === 0) {
            toast.danger('Please select conference review process');
            setIsLoading(false);
            return;
        }

        try {
            const conferenceId = await createConference(params.id, name, website, permalink, {
                start_date: startDate,
                review_type: reviewType,
            });
            const conference = await getConferenceById(conferenceId);
            navigateToConference(conference.display_id);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.danger(`Error creating conference series ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create conference event</TitleBar>
            <Container>
                <Card className="box rounded p-12">
                    <Card.Content className="gap-6 p-0">
                        {!!user && user.isCurationAllowed && (
                            <Form
                                className="flex flex-col gap-6 px-4 pt-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void createNewConference();
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
                                    <Label htmlFor="conferenceName">Name</Label>
                                    <Input id="conferenceName" type="text" maxLength={MAX_LENGTH_INPUT} />
                                </TextField>

                                <TextField fullWidth name="permalink" isDisabled={isLoading} value={permalink} onChange={setPermalink}>
                                    <Label htmlFor="conferencePermalink">
                                        Permalink
                                        <TooltipQuestion message="Permalink field allows to identify the conference page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                    </Label>
                                    <InputGroup>
                                        <InputGroup.Prefix>{publicConferenceRoute}</InputGroup.Prefix>
                                        <InputGroup.Input id="conferencePermalink" placeholder="name" maxLength={MAX_LENGTH_INPUT} />
                                    </InputGroup>
                                </TextField>

                                <TextField fullWidth name="website" isDisabled={isLoading} value={website} onChange={setWebsite}>
                                    <Label htmlFor="conferenceWebsite">Website</Label>
                                    <Input id="conferenceWebsite" type="text" placeholder="https://www.example.com" maxLength={MAX_LENGTH_INPUT} />
                                </TextField>

                                <TextField fullWidth name="date" isDisabled={isLoading} value={startDate} onChange={setStartDate}>
                                    <Label htmlFor="conferenceDate">Conference date</Label>
                                    <Input id="conferenceDate" type="date" placeholder="yyyy-mm-dd" />
                                </TextField>

                                <Select
                                    fullWidth
                                    name="reviewType"
                                    isDisabled={isLoading}
                                    value={reviewType}
                                    onChange={(value) => setReviewType((value as string) ?? '')}
                                >
                                    <Label htmlFor="conferenceReviewType">Review process</Label>
                                    <Select.Trigger id="conferenceReviewType">
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {CONFERENCE_REVIEW_TYPE.map((option) => (
                                                <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                                                    {option.label}
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            ))}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>

                                <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isLoading}>
                                    Create conference event
                                </ButtonWithLoading>
                            </Form>
                        )}
                        {(!user || !user.isCurationAllowed) && (
                            <Button variant="tertiary" className="mt-2 mb-2 w-fit p-0" onPress={() => signIn('keycloak')}>
                                <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in to create conference event
                            </Button>
                        )}
                    </Card.Content>
                </Card>
            </Container>
        </>
    );
};

export default AddConference;
