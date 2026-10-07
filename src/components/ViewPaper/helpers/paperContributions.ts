import { orderBy } from 'lodash';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

/**
 * The contribution tab order. Shared by the paper page and its canonical tag, which must agree on the first
 * one — so ties (default labels like "Contribution 1" repeat) break on the id, which both sides have.
 */
export const sortPaperContributions = <T extends { id: string; label: string }>(contributions: T[]) =>
    orderBy(contributions, ['label', 'id'], ['asc', 'desc']);

/**
 * `/papers/R1`, `/papers/R1/contributions` and `/papers/R1/<first contribution>` all render the default
 * view, so they share the bare path as canonical; any other segment keeps its own path.
 */
export const getPaperCanonicalPath = (resourceId: string, segment: string | undefined, firstContributionId?: string) =>
    !segment || segment === 'contributions' || segment === firstContributionId
        ? reverse(ROUTES.VIEW_PAPER, { resourceId })
        : reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId, contributionId: segment });
