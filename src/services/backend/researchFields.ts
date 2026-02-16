import { ResearchFieldsApi, ResearchFieldsApiFindAllRequest } from '@orkg/orkg-client';

import { url, urlNoTrailingSlash } from '@/constants/misc';
import backendApi, { configuration } from '@/services/backend/backendApi';
import { PaginatedResponse, Resource } from '@/services/backend/types';

export const researchFieldUrl = `${url}research-fields/`;
export const researchFieldApi = backendApi.extend(() => ({ prefixUrl: researchFieldUrl }));

export const newResearchFieldUrl = `${urlNoTrailingSlash}/research-fields`;
const newResearchFieldApi = new ResearchFieldsApi(configuration);

export const getResearchFields = (params: ResearchFieldsApiFindAllRequest) => newResearchFieldApi.findAll(params);

export type FieldChildren = {
    child_count: number;
    resource: Resource;
};

export const getFieldChildren = ({ fieldId }: { fieldId: string }) =>
    researchFieldApi
        .get<PaginatedResponse<FieldChildren>>(`${fieldId}/children?page=0&size=9999`)
        .json()
        .then((res) => res.content);

export const getFieldParents = async ({ fieldId }: { fieldId: string }): Promise<Resource[]> => {
    const parents: Resource[] = [];

    const fetchParents = async (currentFieldId: string): Promise<void> => {
        const response = await researchFieldApi.get<any>(`${currentFieldId}/parents`).json();
        const parentFields = response.content;

        if (parentFields?.length) {
            parents.push(parentFields[0]);
            await fetchParents(parentFields[0].id);
        }
    };

    await fetchParents(fieldId);

    return parents;
};
