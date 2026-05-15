import { redirect } from 'next/navigation';

import { PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getStatements } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

export default async function Visualization({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let comparisonId: string | undefined;
    try {
        const statements = (await getStatements({ objectId: id, predicateId: PREDICATES.HAS_VISUALIZATION })) as Statement[];
        comparisonId = statements?.[0]?.subject.id;
    } catch (e) {
        console.error(e);
    }

    if (!comparisonId) {
        redirect(`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`);
    }
    redirect(`${reverse(ROUTES.COMPARISON, { comparisonId })}#Vis${id}`);
}
