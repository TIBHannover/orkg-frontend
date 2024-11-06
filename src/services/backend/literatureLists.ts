import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
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
    ObservatoryIdParam,
    ResearchFieldIdParams,
} from 'services/backend/types';

export const listsUrl = `${url}literature-lists/`;

export const getLiteratureLists = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    research_field,
    include_subfields,
    observatory_id,
    sdg,
    published,
}: PaginationParams &
    VerifiedParam &
    VisibilityParam &
    CreatedByParam &
    SdgParam &
    PublishedParam &
    ObservatoryIdParam &
    ResearchFieldIdParams): Promise<PaginatedResponse<LiteratureList>> => {
    const params = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        published,
        research_field,
        include_subfields,
    });
    return submitGetRequest(`${listsUrl}?${params}`);
};

export const getLiteratureListPublishedContentById = (listId: string, paperId: string): Promise<Paper | Resource> => {
    return submitGetRequest(`${listsUrl}${listId}/published-contents/${paperId}`);
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
export type UpdateLiteratureListSectionText = Omit<LiteratureListSectionText, 'id' | 'type'>;

export type UpdateLiteratureListParams = Partial<
    Omit<LiteratureList, 'id' | 'research_fields' | 'sdgs' | 'sections'> & { research_fields: string[] } & { sdgs: string[] } & {
        sections: (UpdateLiteratureListSectionText | UpdateLiteratureListSectionList)[];
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

export const deleteLiteratureListSection = ({ listId, sectionId }: { listId: string; sectionId: string }): Promise<null> => {
    return submitDeleteRequest(`${listsUrl}${listId}/sections/${sectionId}`, {
        'Content-Type': 'application/vnd.orkg.literature-list-section.v1+json',
        Accept: 'application/vnd.orkg.literature-list-section.v1+json',
    });
};

export const createLiteratureListSection = ({
    listId,
    index,
    data,
}: {
    listId: string;
    index: number;
    data: UpdateLiteratureListSectionList | UpdateLiteratureListSectionText;
}): Promise<null> => {
    return submitPostRequest(
        `${listsUrl}${listId}/sections/${index}`,
        {
            'Content-Type': 'application/vnd.orkg.literature-list-section.v1+json',
            Accept: 'application/vnd.orkg.literature-list-section.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const updateLiteratureListSection = ({
    listId,
    sectionId,
    data,
}: {
    listId: string;
    sectionId: string;
    data: Partial<UpdateLiteratureListSectionList | UpdateLiteratureListSectionText>;
}): Promise<null> => {
    return submitPutRequest(
        `${listsUrl}${listId}/sections/${sectionId}`,
        {
            'Content-Type': 'application/vnd.orkg.literature-list-section.v1+json',
            Accept: 'application/vnd.orkg.literature-list-section.v1+json',
        },
        data,
    );
};
