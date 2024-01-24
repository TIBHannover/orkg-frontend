'use client';

import Link from 'components/NextJsMigration/Link';
import { faFileCsv, faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TabsContainer from 'components/Class/TabsContainer';
import ImportCSVInstances from 'components/ClassInstances/ImportCSVInstances';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ROUTES from 'constants/routes.js';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import { useEffect, useState } from 'react';
import { getClassById } from 'services/backend/classes';
import useParams from 'components/NextJsMigration/useParams';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import EditableHeader from 'components/EditableHeader';
import ItemMetadata from 'components/Search/ItemMetadata';
import { ENTITIES } from 'constants/graphSettings';
import { Button, Container } from 'reactstrap';

function ClassDetails() {
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [classObject, setClassObject] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [keyInstances, setKeyInstances] = useState(1);
    const [modalImportIsOpen, setModalImportIsOpen] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { id } = useParams();

    useEffect(() => {
        const findClass = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getClassById(id);
                document.title = `${responseJson.label} - Class - ORKG`;
                setLabel(responseJson.label);
                setClassObject(responseJson);
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
    }, [id]);

    const handleHeaderChange = val => {
        setLabel(val);
    };

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
                                    href={`${ROUTES.ADD_RESOURCE}?classes=${id}`}
                                    className="float-end btn btn-secondary flex-shrink-0 btn-sm"
                                    style={{ marginRight: 2 }}
                                >
                                    <Icon icon={faPlus} /> Add resource
                                </RequireAuthentication>

                                <RequireAuthentication
                                    style={{ marginRight: 2 }}
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    onClick={() => setModalImportIsOpen(true)}
                                >
                                    <Icon icon={faFileCsv} /> Import instances
                                </RequireAuthentication>
                                {!isEditMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => toggleIsEditMode()}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        Class
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container className={`box pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        {!isEditMode ? (
                            <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                            </h3>
                        ) : (
                            <EditableHeader id={id} value={label} onChange={handleHeaderChange} entityType={ENTITIES.CLASS} curatorsOnly={true} />
                        )}

                        <ItemMetadata item={classObject} showCreatedAt={true} showCreatedBy={true} editMode={isEditMode} />
                    </Container>
                    <TabsContainer id={id} editMode={isEditMode} classObject={classObject} label={label} key={keyInstances} setLabel={setLabel} />
                    <ImportCSVInstances
                        classId={id}
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
