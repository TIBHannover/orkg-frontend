import { compact, uniq } from 'lodash';
import useSWR from 'swr';

import { PREDICATES } from '@/constants/graphSettings';
import { getStatements } from '@/services/backend/statements';
import { Thing } from '@/services/backend/things';

export const fetchQuantityKindFromSubjectId = async (subjectId: string): Promise<Thing | null> => {
    // The quantity kind normally hangs off the unit (P45076 → P45074); the direct lookup
    // only covers legacy data, so both are fired together rather than sequentially.
    const [directStatements, unitStatements] = await Promise.all([
        getStatements({ subjectId, predicateId: PREDICATES.HAS_QUANTITY_KIND }),
        getStatements({ subjectId, predicateId: PREDICATES.QUANTITY_VALUE_UNIT }),
    ]);

    const directQuantityKind = directStatements.find((statement) => statement.object?.id);
    if (directQuantityKind?.object?.id) {
        return directQuantityKind.object;
    }

    const unitIds = uniq(compact(unitStatements.map((statement) => statement.object?.id)));
    if (!unitIds.length) {
        return null;
    }

    const unitQuantityKindGroups = await Promise.all(
        unitIds.map((id) => getStatements({ subjectId: id, predicateId: PREDICATES.HAS_QUANTITY_KIND })),
    );
    const hasQuantityKind = unitQuantityKindGroups.flat().find((statement) => statement.object?.id);
    return hasQuantityKind?.object ?? null;
};

export default function useQuantityKind(subjectId: string | null) {
    const { data, error, isLoading } = useSWR(subjectId ? ['quantity-kind', subjectId] : null, ([, id]) => fetchQuantityKindFromSubjectId(id), {
        revalidateOnFocus: false,
    });

    return {
        quantityKind: data ?? null,
        isLoading,
        error,
    };
}
