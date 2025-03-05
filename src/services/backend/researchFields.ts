import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { PaginatedResponse, Resource } from 'services/backend/types';

export const researchFieldUrl = `${url}research-fields/`;
export const researchFieldApi = backendApi.extend(() => ({ prefixUrl: researchFieldUrl }));

export const getResearchProblemsByResearchFieldId = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    subfields = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    subfields?: boolean;
    visibility?: string;
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const searchParams = qs.stringify(
        { page, size, sort, visibility },
        {
            skipNulls: true,
        },
    );
    return researchFieldApi
        .get<PaginatedResponse<Resource>>(`${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}research-problems`, {
            searchParams,
        })
        .json();
};

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
