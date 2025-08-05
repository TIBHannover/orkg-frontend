'use client';

import { useEffect } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import ObjectStatements from '@/components/Resource/Tabs/ObjectStatements';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { getLiteral, literalsUrl } from '@/services/backend/literals';

const Literal = () => {
    const { id: literalId } = useParams();

    useEffect(() => {
        document.title = `${literalId} - Literal - ORKG`;
    }, [literalId]);

    const { data: literal, error, isLoading } = useSWR(literalId ? [literalId, literalsUrl, 'getLiteral'] : null, ([params]) => getLiteral(params));

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && literal && (
                <>
                    <TitleBar>Literal</TitleBar>

                    <Container className="box pt-4 pb-4 ps-4 pe-4  rounded">
                        <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {literal?.label || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>
                        <ItemMetadata item={literal} showDataType showCreatedAt showCreatedBy showProvenance showExtractionMethod />
                    </Container>

                    <Container className="mt-3 px-0 py-4 box rounded">
                        <h3 className="ms-3">Statements</h3>
                        <ObjectStatements id={literalId} />
                    </Container>
                </>
            )}
        </>
    );
};

export default Literal;
