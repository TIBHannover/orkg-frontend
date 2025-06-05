'use client';

import { faFileCsv, faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Container } from 'reactstrap';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import TabsContainer from '@/components/Class/TabsContainer';
import ImportCSVInstances from '@/components/ClassInstances/ImportCSVInstances';
import EditableHeader from '@/components/EditableHeader';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { classesUrl, getClassById } from '@/services/backend/classes';

function ClassDetails() {
    const [keyInstances, setKeyInstances] = useState(1);
    const [modalImportIsOpen, setModalImportIsOpen] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { id } = useParams();

    const fetcher = async (_id) => {
        const response = await getClassById(_id);
        document.title = `${response.label} - Class - ORKG`;
        return response;
    };

    const { data: classObject, error, isLoading, mutate } = useSWR(id ? [id, classesUrl, 'getClassById'] : null, ([params]) => fetcher(params));

    const handleHeaderChange = (value) => {
        mutate();
    };

    const label = classObject?.label ?? '';

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Link}
                                    href={`${ROUTES.CREATE_RESOURCE}?classes=${id}`}
                                    className="float-end btn btn-secondary flex-shrink-0 btn-sm"
                                    style={{ marginRight: 2 }}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add resource
                                </RequireAuthentication>

                                <RequireAuthentication
                                    style={{ marginRight: 2 }}
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    onClick={() => setModalImportIsOpen(true)}
                                >
                                    <FontAwesomeIcon icon={faFileCsv} /> Import instances
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
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
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
                            <EditableHeader id={id} value={label} onChange={handleHeaderChange} entityType={ENTITIES.CLASS} curatorsOnly />
                        )}

                        <ItemMetadata item={classObject} showCreatedAt showCreatedBy editMode={isEditMode} />
                    </Container>
                    <TabsContainer id={id} editMode={isEditMode} classObject={classObject} label={label} key={keyInstances} />
                    <ImportCSVInstances
                        classId={id}
                        showDialog={modalImportIsOpen}
                        toggle={() => setModalImportIsOpen((v) => !v)}
                        callBack={() => setKeyInstances(Math.random())}
                    />
                </>
            )}
        </>
    );
}

export default ClassDetails;
