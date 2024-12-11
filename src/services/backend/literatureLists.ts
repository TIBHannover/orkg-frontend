import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import backendApi, { getCreatedIdFromHeaders } from 'services/backend/backendApi';
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
export const listsApi = backendApi.extend(() => ({ prefixUrl: listsUrl }));
const LITERATURE_LISTS_CONTENT_TYPE = 'application/vnd.orkg.literature-list.v1+json';
const LITERATURE_LISTS_SECTION_CONTENT_TYPE = 'application/vnd.orkg.literature-list-section.v1+json';

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
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & PublishedParam & ObservatoryIdParam & ResearchFieldIdParams) => {
    const searchParams = prepareParams({
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
    return listsApi
        .get<PaginatedResponse<LiteratureList>>('', {
            searchParams,
            headers: {
                Accept: LITERATURE_LISTS_CONTENT_TYPE,
            },
        })
        .json();
};

export const getLiteratureListPublishedContentById = (listId: string, paperId: string) => {
    return listsApi.get<Paper | Resource>(`${listId}/published-contents/${paperId}`).json();
};

export const getLiteratureList = (id: string) => {
    return listsApi
        .get<LiteratureList>(id, {
            headers: {
                Accept: LITERATURE_LISTS_CONTENT_TYPE,
            },
        })
        .json();
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

export const updateLiteratureList = (id: string, data: UpdateLiteratureListParams) => {
    return listsApi
        .put<void>(`${id}`, {
            json: data,
            headers: {
                Accept: LITERATURE_LISTS_CONTENT_TYPE,
                'Content-Type': LITERATURE_LISTS_CONTENT_TYPE,
            },
        })
        .json();
};

export const deleteLiteratureListSection = ({ listId, sectionId }: { listId: string; sectionId: string }) => {
    return listsApi
        .delete<void>(`${listId}/sections/${sectionId}`, {
            headers: {
                Accept: LITERATURE_LISTS_SECTION_CONTENT_TYPE,
            },
        })
        .json();
};

export const createLiteratureListSection = ({
    listId,
    index,
    data,
}: {
    listId: string;
    index: number;
    data: UpdateLiteratureListSectionList | UpdateLiteratureListSectionText;
}) => {
    return listsApi
        .post<void>(`${listId}/sections/${index}`, {
            json: data,
            headers: {
                'Content-Type': LITERATURE_LISTS_SECTION_CONTENT_TYPE,
                Accept: LITERATURE_LISTS_SECTION_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const updateLiteratureListSection = ({
    listId,
    sectionId,
    data,
}: {
    listId: string;
    sectionId: string;
    data: Partial<UpdateLiteratureListSectionList | UpdateLiteratureListSectionText>;
}) => {
    return listsApi
        .put<void>(`${listId}/sections/${sectionId}`, {
            json: data,
            headers: {
                'Content-Type': LITERATURE_LISTS_SECTION_CONTENT_TYPE,
                Accept: LITERATURE_LISTS_SECTION_CONTENT_TYPE,
            },
        })
        .json();
};
