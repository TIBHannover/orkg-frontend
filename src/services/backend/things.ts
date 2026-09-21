import { ThingRepresentation, ThingsApi, ThingsApiFindAllRequest, VisibilityFilter } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, transformPaginationParams } from '@/services/backend/backendApi';
import { VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const thingsUrl = `${urlNoTrailingSlash}/things`;

const thingsApi = new ThingsApi(configuration);

export type Thing = ThingRepresentation;

export const getThing = (id: string) => thingsApi.findById({ id });

/**
 * `GET /things` historically read the visibility filter from a `type` query parameter while the
 * spec named it `visibility`. The backend has since aligned with the spec on every deployment
 * (`visibility` is honored, `type` is ignored), so the generated operation is used as-is.
 *
 * No default visibility: on this mixed endpoint the filter only ever matches resources (literals,
 * predicates and classes have no visibility), so even `ALL_LISTED` empties those types — the search
 * page lost every literal/class/predicate when it was sent by default. The legacy `type=ALL_LISTED`
 * was a no-op for the same reason. A visibility is forwarded only when a caller explicitly asks for one.
 */
export const getThings = ({ visibility, ...params }: Omit<WithPaginationParams<ThingsApiFindAllRequest>, 'visibility'> & VisibilityParam) =>
    thingsApi.findAll({
        ...transformPaginationParams(params),
        // `visibility` doubles as an entity-type filter for some callers: entity classes and the
        // pseudo-visibility 'combined' are not wire visibilities, so they are simply not sent
        ...(visibility && Object.values(VisibilityFilter).includes(visibility as VisibilityFilter)
            ? { visibility: visibility as VisibilityFilter }
            : {}),
    });
