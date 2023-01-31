import { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getClassById } from 'services/backend/classes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileCsv, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import ImportCSVInstances from 'components/ClassInstances/ImportCSVInstances';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import { Link, useParams, useLocation } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';
import TabsContainer from 'components/Class/TabsContainer';

function ClassDetails() {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [template, setTemplate] = useState(null);
    const [uri, setURI] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [keyInstances, setKeyInstances] = useState(1);
    const [modalImportIsOpen, setModalImportIsOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const params = useParams();

    useEffect(() => {
        const findClass = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getClassById(params.id);
                document.title = `${responseJson.label} - Class - ORKG`;
                // Get the template of the class
                getStatementsByObjectAndPredicate({
                    objectId: params.id,
                    predicateId: PREDICATES.TEMPLATE_OF_CLASS,
                })
                    .then(statements =>
                        Promise.all(statements.filter(statement => statement.subject.classes?.includes(CLASSES.TEMPLATE)).map(st => st.subject)),
                    )
                    .then(templates => {
                        if (templates.length > 0) {
                            setTemplate(templates[0]);
                        } else {
                            setTemplate(null);
                        }
                    });
                setLabel(responseJson.label);
                setURI(responseJson.uri);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error(err);
                setLabel(null);
                setTemplate(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findClass();
    }, [location, params.id]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {' '}
                                <RequireAuthentication
                                    component={Link}
                                    to={`${ROUTES.ADD_RESOURCE}?classes=${params.id}`}
                                    className="float-end btn btn-secondary flex-shrink-0 btn-sm"
                                    style={{ marginRight: 2 }}
                                >
                                    <Icon icon={faPlus} /> Add resource
                                </RequireAuthentication>
                                {!editMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => setEditMode(v => !v)}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button
                                        style={{ marginRight: 2 }}
                                        className="flex-shrink-0"
                                        color="secondary-darker"
                                        size="sm"
                                        onClick={() => setEditMode(v => !v)}
                                    >
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                <RequireAuthentication component={Button} size="sm" color="secondary" onClick={() => setModalImportIsOpen(true)}>
                                    <Icon icon={faFileCsv} /> Import Instances
                                </RequireAuthentication>
                            </>
                        }
                    >
                        Class:{' '}
                        {label || (
                            <i>
                                <small>No label</small>
                            </i>
                        )}
                    </TitleBar>
                    <TabsContainer id={params.id} editMode={editMode} uri={uri} template={template} label={label} key={keyInstances} />
                    <ImportCSVInstances
                        classId={params.id}
                        showDialog={modalImportIsOpen}
                        toggle={() => setModalImportIsOpen(v => !v)}
                        callBack={() => setKeyInstances(Math.random())}
                    />
                </>
            )}
        </>
    );
}

export default ClassDetails;
