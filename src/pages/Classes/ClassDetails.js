import { useState, useEffect } from 'react';
import { Container, Table, Button } from 'reactstrap';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getClassById } from 'services/backend/classes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileCsv, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ClassInstances from 'components/ClassInstances/ClassInstances';
import ImportCSVInstances from 'components/ClassInstances/ImportCSVInstances';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import { Link, useParams, useLocation } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';

function ClassDetails(props) {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [keyInstances, setKeyInstances] = useState(1);
    const [template, setTemplate] = useState(null);
    const [uri, setURI] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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
                    predicateId: PREDICATES.TEMPLATE_OF_CLASS
                })
                    .then(statements =>
                        Promise.all(statements.filter(statement => statement.subject.classes?.includes(CLASSES.TEMPLATE)).map(st => st.subject))
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
                    <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                        <Table bordered>
                            <tbody>
                                <tr>
                                    <th scope="row">ID</th>
                                    <td> {params.id}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Label</th>
                                    <td>
                                        {label ? (
                                            label
                                        ) : (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">URI</th>
                                    <td>
                                        <i>{uri && uri !== 'null' ? <a href={uri}>{uri}</a> : 'Not Defined'}</i>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Template</th>
                                    <td>
                                        {template ? (
                                            <Link to={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label}</Link>
                                        ) : (
                                            <i>
                                                Not Defined <Link to={`${reverse(ROUTES.ADD_TEMPLATE)}?classID=${params.id}`}>Create a template</Link>
                                            </i>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <hr />

                        <div className="d-flex align-items-center">
                            <h1 className="h5 mt-4 mb-4 flex-grow-1">Statements</h1>
                            {!editMode ? (
                                <RequireAuthentication
                                    component={Button}
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            )}
                        </div>
                        <div className="clearfix">
                            <StatementBrowser
                                rootNodeType={ENTITIES.CLASS}
                                enableEdit={editMode}
                                syncBackend={editMode}
                                openExistingResourcesInDialog={false}
                                initialSubjectId={params.id}
                                initialSubjectLabel={label}
                                newStore={true}
                                propertiesAsLinks={true}
                                resourcesAsLinks={true}
                            />
                        </div>

                        <ClassInstances classId={params.id} key={keyInstances} />
                        <ImportCSVInstances
                            classId={params.id}
                            showDialog={modalImportIsOpen}
                            toggle={() => setModalImportIsOpen(v => !v)}
                            callBack={() => setKeyInstances(Math.random())}
                        />
                    </Container>
                </>
            )}
        </>
    );
}

export default ClassDetails;
