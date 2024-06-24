import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest, submitPutRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    LiteratureList,
    LiteratureListSectionText,
    PaginatedResponse,
    PaginationParams,
    Paper,
    PublishedParam,
    Resource,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const listsUrl = `${url}literature-lists/`;

export const getLiteratureLists = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    sdg,
    published,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & PublishedParam): Promise<PaginatedResponse<LiteratureList>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, sdg, published });
    return submitGetRequest(`${listsUrl}?${params}`);
};

export const getLiteratureListPublishedContentById = (listId: string, paperId: string): Promise<Paper | Resource> => {
    return submitGetRequest(`${listsUrl}/${listId}/published-contents/${paperId}`);
};

export const getLiteratureList = (id: string): Promise<LiteratureList> => {
    return submitGetRequest(`${listsUrl}${id}`);
};

export type UpdateLiteratureListSectionList = {
    entries: {
        id: string;
        description: string;
    }[];
};

export type UpdateLiteratureListParams = Partial<
    Omit<LiteratureList, 'id' | 'research_fields' | 'sdgs' | 'sections'> & { research_fields: string[] } & { sdgs: string[] } & {
        sections: (Omit<LiteratureListSectionText, 'id' | 'type'> | UpdateLiteratureListSectionList)[];
    }
>;

export const updateLiteratureList = (id: string, data: UpdateLiteratureListParams): Promise<null> => {
    return submitPutRequest(
        `${listsUrl}${id}`,
        {
            'Content-Type': 'application/vnd.orkg.literature-list.v1+json',
            Accept: 'application/vnd.orkg.literature-list.v1+json',
        },
        data,
    );
};
