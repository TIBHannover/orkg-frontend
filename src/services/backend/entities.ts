import { submitGetRequest } from 'network';
import { resourcesUrl } from 'services/backend/resources';
import { predicatesUrl } from 'services/backend/predicates';
import { classesUrl } from 'services/backend/classes';
import { Class, Predicate, Resource } from 'services/backend/types';

export const getEntity = (id: string): Promise<Resource | Predicate | Class> =>
    submitGetRequest(`${resourcesUrl}${id}/`)
        .catch(() => submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`))
        .catch(() => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`));

export default getEntity;
