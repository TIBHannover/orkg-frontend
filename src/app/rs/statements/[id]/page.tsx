'use client';

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useRosettaStatements from '@/components/RosettaStone/SingleStatement/hooks/useStatements';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { Thing } from '@/services/backend/things';

const RSStatementPage = () => {
    const { id } = useParams<{ id: string }>();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const { data: statement, isLoading, error, mutate: reloadStatement } = useRosettaStatements({ id });

    useEffect(() => {
        document.title = `Statement - ORKG`;
    }, []);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && statement && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!isEditMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                {isEditMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        Statement
                    </TitleBar>

                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {statement?.id || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>
                        <ItemMetadata
                            item={statement as unknown as Thing}
                            showCreatedAt
                            showCreatedBy
                            showProvenance
                            showExtractionMethod
                            editMode={isEditMode}
                        />
                    </Container>

                    <Container className="mt-3 p-0">
                        <ListGroup>
                            <SingleStatement showContext key={statement.id} statement={statement} reloadStatements={reloadStatement} />
                        </ListGroup>
                    </Container>
                </>
            )}
        </>
    );
};

export default RSStatementPage;
