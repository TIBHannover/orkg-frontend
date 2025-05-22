import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { url as baseUrl } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import {
    Class,
    CreatedByParam,
    Literal,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    Predicate,
    Resource,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from '@/services/backend/types';

export const thingsUrl = `${baseUrl}things/`;
export const thingsApi = backendApi.extend(() => ({ prefixUrl: thingsUrl }));

export type Thing = Resource | Predicate | Class | Literal;

export const getThing = (id: string) => thingsApi.get<Thing>(id).json();

export const getThings = ({
    q = null,
    exact = false,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by = undefined,
    createdAtStart = null,
    createdAtEnd = null,
    include = [],
    exclude = [],
    observatory_id = undefined,
    organization_id = undefined,
    page = 0,
    size = 9999,
    sortBy = [
        {
            property: 'created_at',
            direction: 'desc',
        },
    ],
}: {
    q?: string | null;
    exact?: boolean;
    createdAtStart?: string | null;
    createdAtEnd?: string | null;
    include?: string[];
    exclude?: string[];
} & PaginationParams &
    VisibilityParam &
    VerifiedParam &
    CreatedByParam &
    SdgParam &
    ObservatoryIdParam &
    OrganizationIdParam) => {
    const sort = sortBy?.map((p) => `${p.property},${p.direction}`);
    const searchParams = qs.stringify(
        {
            page,
            size,
            ...(q ? { q, exact } : { sort }),
            ...(!['Literal', 'Predicate', 'Class'].includes(visibility) ? { type: visibility } : {}),
            created_by,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            ...(include?.length ? { include: include.join(',') } : {}),
            ...(exclude?.length ? { exclude: exclude.join(',') } : {}),
            observatory_id,
            organization_id,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return thingsApi
        .get<PaginatedResponse<Thing>>('', {
            searchParams,
        })
        .json();
};
