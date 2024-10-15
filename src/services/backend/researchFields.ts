import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { PaginatedResponse, Resource } from 'services/backend/types';

export const researchFieldUrl = `${url}research-fields/`;

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
}): Promise<PaginatedResponse<Resource>> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort, visibility },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${researchFieldUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}research-problems?${params}`);
};

export const getFieldChildren = ({ fieldId }: { fieldId: string }) =>
    submitGetRequest(`${researchFieldUrl}${fieldId}/children`).then((res) => res.content);
