import {
    CreateLiteratureListRequest,
    LiteratureListListSectionRequest,
    LiteratureListsApi,
    LiteratureListsApiFindAllRequest,
    LiteratureListTextSectionRequest,
    PublishLiteratureListRequest,
    UpdateLiteratureListRequest,
} from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toAuthorRequest } from '@/services/backend/mapAuthor';
import { PublishedParam, UpdateAuthor, VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const literatureListsUrl = `${urlNoTrailingSlash}/literature-lists`;

const literatureListsApi = new LiteratureListsApi(configuration);

export const getLiteratureLists = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    published,
    ...params
}: Omit<WithPaginationParams<LiteratureListsApiFindAllRequest>, 'visibility' | 'published'> & VisibilityParam & PublishedParam) =>
    literatureListsApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as LiteratureListsApiFindAllRequest['visibility'],
            published: published ?? undefined,
        }),
    );

export const getLiteratureListPublishedContentById = (listId: string, contentId: string) =>
    literatureListsApi.findPublishedContentById({ id: listId, contentId });

export const getLiteratureList = (id: string) => literatureListsApi.findById({ id });

export type UpdateLiteratureListSectionList = LiteratureListListSectionRequest;
export type UpdateLiteratureListSectionText = LiteratureListTextSectionRequest;

export type UpdateLiteratureListParams = Omit<UpdateLiteratureListRequest, 'authors'> & {
    authors?: UpdateAuthor[];
};

export const createLiteratureList = (data: Omit<CreateLiteratureListRequest, 'authors'> & { authors: UpdateAuthor[] }) =>
    literatureListsApi
        .createRaw({ createLiteratureListRequest: { ...data, authors: data.authors.map(toAuthorRequest) } as CreateLiteratureListRequest })
        .then(getCreatedId);

export const updateLiteratureList = (id: string, data: UpdateLiteratureListParams) =>
    literatureListsApi.update({
        id,
        updateLiteratureListRequest: { ...data, authors: data.authors?.map(toAuthorRequest) } as UpdateLiteratureListRequest,
    });

export const deleteLiteratureListSection = ({ listId, sectionId }: { listId: string; sectionId: string }) =>
    literatureListsApi.deleteSection({ id: listId, sectionId });

export const createLiteratureListSection = ({
    listId,
    index,
    data,
}: {
    listId: string;
    index: number;
    data: UpdateLiteratureListSectionList | UpdateLiteratureListSectionText;
}) => literatureListsApi.createSectionAtIndexRaw({ id: listId, index, literatureListsCreateSectionRequest: data }).then(getCreatedId);

export const updateLiteratureListSection = ({
    listId,
    sectionId,
    data,
}: {
    listId: string;
    sectionId: string;
    data: UpdateLiteratureListSectionList | UpdateLiteratureListSectionText;
}) => literatureListsApi.updateSection({ id: listId, sectionId, literatureListsUpdateSectionRequest: data });

export const publishList = (listId: string, data: PublishLiteratureListRequest) =>
    literatureListsApi.publishRaw({ id: listId, publishLiteratureListRequest: data }).then(getCreatedId);
