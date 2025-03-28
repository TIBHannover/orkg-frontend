'use client';

import useSWR from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getParentResearchFields, statementsUrl } from '@/services/backend/statements';
import { getFeaturedTemplates, templatesUrl } from '@/services/backend/templates';
import { Resource } from '@/services/backend/types';
import { filterObjectOfStatementsByPredicateAndClass } from '@/utils';

/**
 * featuredTemplates are templates linked to the selected research field and its parents and the research problems
 */
const useFeaturedTemplates = () => {
    const { entity, statements } = useEntity();

    // Research field
    const { context } = useDataBrowserState();

    const { data: researchFieldParents } = useSWR(
        context.researchField ? [context.researchField, statementsUrl, 'getParentResearchFields'] : null,
        ([params]) => getParentResearchFields(params),
    );

    // Research problems
    let researchProblemsIDs = [];
    if (entity && 'classes' in entity && entity.classes?.includes(CLASSES.CONTRIBUTION) && statements && statements?.length > 0) {
        researchProblemsIDs = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_RESEARCH_PROBLEM, false, CLASSES.PROBLEM).map(
            (s: Resource) => s.id,
        );
    }

    const { data: featuredTemplates, isLoading } = useSWR(
        [
            {
                researchFields: researchFieldParents?.map((r) => r.id) ?? [],
                researchProblems: researchProblemsIDs,
            },
            templatesUrl,
            'getFeaturedTemplates',
        ],
        ([params]) => getFeaturedTemplates(params),
    );

    return { featuredTemplates, isLoading };
};

export default useFeaturedTemplates;
