import { faSave, faTable, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Alert, Button, Container, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { Link } from 'react-router-dom';

const TYPES = [
    {
        classId: CLASSES.SOFTWARE,
        label: 'Software',
        icon: faSave
    },
    {
        classId: CLASSES.DATASET,
        label: 'Dataset',
        icon: faTable
    },
    {
        classId: CLASSES.PAPER,
        label: 'Paper',
        icon: faFile
    }
];

const ContentTypeNew = () => {
    const history = useHistory();
    const params = useParams();

    const [selectedClassId, setSelectedClassId] = useState();
    const [title, setTitle] = useState('');
    const [resource, setResource] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    useEffect(() => {
        setSelectedClassId(params.type || TYPES[0].classId);
    }, [params.type]);

    const handleCreate = async () => {
        setIsLoading(true);
        const _resource = await createResource(title, [selectedClassId]);
        setResource(_resource);
        history.push(reverse(ROUTES.CONTENT_TYPE, { id: _resource.id, type: selectedClassId, mode: 'edit' }));
    };

    return (
        <>
            <TitleBar>Add to ORKG</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {TYPES.map(type => (
                    <Button
                        key={type.classId}
                        color={type.classId === selectedClassId ? 'primary' : 'link'}
                        className={`px-2 me-4 ${type.classId !== selectedClassId && 'text-decoration-none text-dark'}`}
                        onClick={() => setSelectedClassId(type.classId)}
                        style={{ width: 80 }}
                    >
                        <div style={{ fontSize: 30 }}>
                            <Icon icon={type.icon} className={type.classId !== selectedClassId ? 'text-secondary' : ''} />
                        </div>
                        {type.label}
                    </Button>
                ))}
                <hr />
                {(selectedClassId === CLASSES.DATASET || selectedClassId === CLASSES.SOFTWARE) && (
                    <FormGroup>
                        <Label for="title">Title</Label>
                        <InputGroup>
                            <Input value={title} onChange={e => setTitle(e.target.value)} type="text" name="value" id="title" disabled={isLoading} />
                            {!resource?.id && (
                                <Button color="primary" onClick={handleCreate}>
                                    Create
                                </Button>
                            )}
                        </InputGroup>
                    </FormGroup>
                )}
                {selectedClassId === CLASSES.PAPER && (
                    <>
                        <Alert color="info" fade={false}>
                            The add paper wizard guides you through the steps to add a paper
                        </Alert>
                        <p>
                            <Link to={reverse(ROUTES.ADD_PAPER.GENERAL_DATA)}>
                                <Button color="light">Add paper wizard</Button>
                            </Link>
                        </p>
                    </>
                )}
            </Container>
        </>
    );
};

export default ContentTypeNew;
