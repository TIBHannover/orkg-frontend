'use client';

import { faBars, faComments, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Button, Container, Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';

import { supportedContentTypes } from '@/components/ContentType/types';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import { CLASSES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import requireAuthentication from '@/requireAuthentication';
import { createResource } from '@/services/backend/resources';

const TYPES = [
    ...supportedContentTypes,
    {
        id: CLASSES.PAPER,
        label: 'Paper',
        icon: faFile,
    },
    {
        id: CLASSES.SMART_REVIEW,
        label: 'Review',
        icon: faComments,
    },
    {
        id: CLASSES.LITERATURE_LIST,
        label: 'List',
        icon: faBars,
    },
];

const ContentTypeNew = () => {
    const router = useRouter();
    const params = useParams();

    const [selectedClassId, setSelectedClassId] = useState();
    const [title, setTitle] = useState('');
    const [resource, setResource] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    useEffect(() => {
        setSelectedClassId(params.type || TYPES[0].id);
    }, [params.type]);

    useEffect(() => {
        document.title = `Add to ORKG - ORKG`;
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const _resource = await createResource(title, [selectedClassId]);
            setResource(_resource);
            router.push(`${reverse(ROUTES.CONTENT_TYPE, { id: _resource.id, type: selectedClassId })}?isEditMode=true`);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            toast.error(`Error creating resource : ${error.message}`);
        }
    };

    return (
        <>
            <TitleBar>Add to ORKG</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {TYPES.map((type) => (
                    <Button
                        key={type.id}
                        color={type.id === selectedClassId ? 'primary' : 'link'}
                        className={`px-2 me-4 ${type.id !== selectedClassId && 'text-decoration-none text-dark'}`}
                        onClick={() => setSelectedClassId(type.id)}
                        style={{ width: 80 }}
                    >
                        <div style={{ fontSize: 30 }}>
                            <FontAwesomeIcon icon={type.icon} className={type.id !== selectedClassId ? 'text-secondary' : ''} />
                        </div>
                        {upperFirst(pluralize(type?.label || '', 0, false))}
                    </Button>
                ))}

                <hr />
                {(selectedClassId === CLASSES.DATASET || selectedClassId === CLASSES.SOFTWARE) && (
                    <Form>
                        <FormGroup>
                            <Label for="title">Title</Label>
                            <InputGroup>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    type="text"
                                    maxLength={MAX_LENGTH_INPUT}
                                    name="value"
                                    id="title"
                                    disabled={isLoading}
                                />
                                {!resource?.id && (
                                    <Button type="submit" color="primary" onClick={handleCreate}>
                                        Create
                                    </Button>
                                )}
                            </InputGroup>
                        </FormGroup>
                    </Form>
                )}
                {selectedClassId === CLASSES.PAPER && (
                    <>
                        <Alert color="info" fade={false}>
                            The add paper form guides you through the steps to add a paper
                        </Alert>
                        <p>
                            <Link href={reverse(ROUTES.ADD_PAPER)}>
                                <Button color="light">Add paper form</Button>
                            </Link>
                        </p>
                    </>
                )}
                {selectedClassId === CLASSES.SMART_REVIEW && (
                    <>
                        <Alert color="info" fade={false}>
                            Visit the add review page to create a new ORKG Review
                        </Alert>
                        <p>
                            <Link href={reverse(ROUTES.REVIEW_NEW)}>
                                <Button color="light">Add review</Button>
                            </Link>
                        </p>
                    </>
                )}
                {selectedClassId === CLASSES.LITERATURE_LIST && (
                    <>
                        <Alert color="info" fade={false}>
                            Visit the add list page to create a new ORKG List
                        </Alert>
                        <p>
                            <Link href={reverse(ROUTES.LIST_NEW)}>
                                <Button color="light">Add list</Button>
                            </Link>
                        </p>
                    </>
                )}
            </Container>
        </>
    );
};

export default requireAuthentication(ContentTypeNew);
