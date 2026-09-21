import { ResearchFieldsApi, ResearchFieldsApiFindAllRequest, ResearchFieldWithChildCountRepresentation } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';
import { Resource } from '@/services/backend/types';

export const researchFieldUrl = `${urlNoTrailingSlash}/research-fields`;

const researchFieldsApi = new ResearchFieldsApi(configuration);

export const getResearchFields = (params: ResearchFieldsApiFindAllRequest) => researchFieldsApi.findAll(params);

export const getFieldChildren = ({ fieldId }: { fieldId: string }): Promise<ResearchFieldWithChildCountRepresentation[]> =>
    researchFieldsApi.findAllChildrenByParentId({ id: fieldId, page: 0, size: 9999 }).then((res) => res.content);

// the hierarchy endpoint returns the whole ancestor closure in one request; walking parentIds
// locally reproduces the previous one-request-per-level chain (first parent, bottom-up, self
// excluded) without the N round trips
export const getFieldParents = async ({ fieldId }: { fieldId: string }): Promise<Resource[]> => {
    const hierarchy = await researchFieldsApi.findResearchFieldHierarchyByResearchFieldId({ id: fieldId, size: 9999 });
    const entriesById = new Map(hierarchy.content.map((entry) => [entry.resource.id, entry]));
    const parents: Resource[] = [];
    let current = entriesById.get(fieldId);
    while (current && current.parentIds.length > 0) {
        const parent = entriesById.get(current.parentIds[0]);
        if (!parent || parents.some((p) => p.id === parent.resource.id)) {
            break;
        }
        parents.push(parent.resource);
        current = parent;
    }
    return parents;
};
