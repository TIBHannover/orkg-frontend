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
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && literal && (
                <>
                    <TitleBar>Literal</TitleBar>

                    <Container>
                        <div className="box flow-root pt-6 pb-6 pl-6 pr-6 rounded">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold mb-0 flex flex-wrap items-center gap-2 break-words">
                                    <span className="break-words">
                                        {literal?.label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </span>
                                </h2>
                            </div>
                            <ItemMetadata item={literal} showDataType showCreatedAt showCreatedBy showProvenance showExtractionMethod />
                        </div>
                    </Container>

                    <Container className="mt-4">
                        <div className="py-6 box rounded">
                            <h3 className="ml-4">Statements</h3>
                            <ObjectStatements id={literalId} showInfoTabLink={false} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
};

export default Literal;
