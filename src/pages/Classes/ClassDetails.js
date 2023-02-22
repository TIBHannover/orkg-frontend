import { faFileCsv, faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TabsContainer from 'components/Class/TabsContainer';
import ImportCSVInstances from 'components/ClassInstances/ImportCSVInstances';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes.js';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button, Container } from 'reactstrap';
import { getClassById } from 'services/backend/classes';

function ClassDetails() {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
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
                setLabel(responseJson.label);
                setURI(responseJson.uri);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error(err);
                setLabel(null);
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
                        titleAddition="Class"
                    >
                        {label || (
                            <i>
                                <small>No label</small>
                            </i>
                        )}
                    </TitleBar>
                    <TabsContainer id={params.id} editMode={editMode} uri={uri} label={label} key={keyInstances} />
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
