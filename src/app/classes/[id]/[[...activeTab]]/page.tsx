'use client';

import { faFileCsv, faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import Link from 'next/link';
import { useState } from 'react';
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
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA, CREATE_NEW_RESOURCE_CONTENT_TYPES } from '@/constants/contentTypes';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { classesUrl, getClassById } from '@/services/backend/classes';

const ClassDetails = () => {
    const [keyInstances, setKeyInstances] = useState<number>(1);
    const [modalImportIsOpen, setModalImportIsOpen] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { id } = useParams();

    const fetcher = async (_id: string) => {
        const response = await getClassById(_id);
        document.title = `${response.label} - Class - ORKG`;
        return response;
    };

    const { data: classObject, error, isLoading, mutate } = useSWR(id ? [id, classesUrl, 'getClassById'] : null, ([params]) => fetcher(params));

    const handleHeaderChange = () => {
        mutate();
    };

    const label = classObject?.label ?? '';
    const isSpecialSchemaClass = CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(id);
    const hasSpecialCreateRoute = isSpecialSchemaClass && id in CREATE_NEW_RESOURCE_CONTENT_TYPES;

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && classObject && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!isSpecialSchemaClass && (
                                    <>
                                        <RequireAuthentication
                                            component={Link}
                                            data-slot="button"
                                            href={`${ROUTES.CREATE_RESOURCE}?classes=${id}`}
                                            className={`${buttonVariants({ size: 'sm' })} button--orkg-secondary`}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add resource
                                        </RequireAuthentication>

                                        <RequireAuthentication
                                            component={Button}
                                            size="sm"
                                            className="button--orkg-secondary"
                                            onPress={() => setModalImportIsOpen(true)}
                                        >
                                            <FontAwesomeIcon icon={faFileCsv} className="mr-1" /> Import instances
                                        </RequireAuthentication>
                                    </>
                                )}
                                {hasSpecialCreateRoute && (
                                    <RequireAuthentication
                                        component={Link}
                                        data-slot="button"
                                        href={CREATE_NEW_RESOURCE_CONTENT_TYPES[id]}
                                        className={`${buttonVariants({ size: 'sm' })} button--orkg-secondary`}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create new instance
                                    </RequireAuthentication>
                                )}
                                {!isEditMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        className="button--orkg-secondary"
                                        size="sm"
                                        onPress={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="button--orkg-secondary-darker" size="sm" onPress={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        Class
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container>
                        <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            <div className="mb-6">
                                {!isEditMode ? (
                                    <h2 className="text-2xl font-semibold mb-0 flex flex-wrap items-center gap-2 break-words">
                                        <span className="break-words">
                                            {label || (
                                                <i>
                                                    <small>No label</small>
                                                </i>
                                            )}
                                        </span>
                                    </h2>
                                ) : (
                                    <EditableHeader id={id} value={label} onChange={handleHeaderChange} entityType={ENTITIES.CLASS} curatorsOnly />
                                )}
                            </div>

                            <ItemMetadata item={classObject} showCreatedAt showCreatedBy editMode={isEditMode} />
                        </div>
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
};

export default ClassDetails;
