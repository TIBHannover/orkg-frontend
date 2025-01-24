'use client';

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import useRosettaStatements from 'components/RosettaStone/SingleStatement/hooks/useStatements';
import ItemMetadata from 'components/Search/ItemMetadata';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import useParams from 'components/useParams/useParams';
import { useEffect } from 'react';
import { Button, Container, ListGroup } from 'reactstrap';

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
                        <ItemMetadata item={statement} showCreatedAt showCreatedBy showProvenance showExtractionMethod editMode={isEditMode} />
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
