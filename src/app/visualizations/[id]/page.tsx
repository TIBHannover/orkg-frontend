'use client';

import { reverse } from 'named-urls';
import { redirect } from 'next/navigation';
import useSWR from 'swr';

import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

/**
 * Component for redirecting visualization IDs to the comparison view
 */
export default function Visualization() {
    const params = useParams();
    const visualizationId = params.id;

    const {
        data: statements,
        isLoading,
        error,
    } = useSWR(
        visualizationId ? [{ objectId: visualizationId, predicateId: PREDICATES.HAS_VISUALIZATION }, statementsUrl, 'getStatements'] : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
    );

    const comparisonId = statements?.[0]?.subject.id;

    if (!isLoading && (!comparisonId || error)) {
        return redirect(`${reverse(ROUTES.RESOURCE, { id: visualizationId })}?noRedirect`);
    }
    if (!isLoading && comparisonId) {
        return redirect(`${reverse(ROUTES.COMPARISON, { comparisonId })}#Vis${visualizationId}`);
    }
    return <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>;
}
