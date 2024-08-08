'use client';

import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatement, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWR from 'swr';

const RSStatementPage = () => {
    const { id } = useParams<{ id: string }>();
    const { isEditMode } = useIsEditMode();
    const {
        data: statement,
        isLoading,
        error,
        mutate: reloadStatement,
    } = useSWR(id ? [id, rosettaStoneUrl, 'getStatement'] : null, ([params]) => getStatement(params));

    useEffect(() => {
        document.title = `Statement - ORKG`;
    }, []);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError />)}
            {!isLoading && !error && statement && (
                <>
                    <TitleBar>Statement</TitleBar>

                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {statement?.id || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>
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
