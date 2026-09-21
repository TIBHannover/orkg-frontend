import { CreatePaperRequest, PapersApi, PapersApiFindAllRequest, PublishPaperRequest, UpdatePaperRequest } from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toAuthorRequest } from '@/services/backend/mapAuthor';
import {
    CreatePaperParams,
    Paper,
    PublishedParam,
    UpdatePaperParams,
    VerifiedParam,
    VisibilityParam,
    WithPaginationParams,
} from '@/services/backend/types';

export const papersUrl = `${urlNoTrailingSlash}/papers`;

const papersApi = new PapersApi(configuration);

export const getPaper = (id: string) => papersApi.findById({ id });

export const updatePaper = (id: string, data: UpdatePaperParams) =>
    papersApi.update({ id, updatePaperRequest: { ...data, authors: data.authors?.map(toAuthorRequest) } as UpdatePaperRequest });

export const createPaper = (data: CreatePaperParams): Promise<string> =>
    papersApi.createRaw({ createPaperRequest: { ...data, authors: data.authors.map(toAuthorRequest) } as CreatePaperRequest }).then(getCreatedId);

// existence checks must match the editable head version, never a published snapshot
export const getPaperByDoi = async (doi: string): Promise<Paper | null> => {
    const papers = await papersApi.findAll({ doi, published: false });
    return papers.content[0] ?? null;
};

export const getPaperByTitle = async (title: string): Promise<Paper | null> => {
    const papers = await papersApi.findAll({ title, exact: true, published: false });
    return papers.content?.[0] ?? null;
};

export const getPapers = ({
    verified,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    published,
    ...params
}: Omit<WithPaginationParams<PapersApiFindAllRequest>, 'verified' | 'visibility' | 'published'> & VerifiedParam & VisibilityParam & PublishedParam) =>
    papersApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as PapersApiFindAllRequest['visibility'],
            verified: verified ?? undefined,
            published: published ?? undefined,
        }),
    );

export const publishPaper = (paperId: string, data: PublishPaperRequest) =>
    papersApi.publishRaw({ id: paperId, publishPaperRequest: data }).then(getCreatedId);

// snapshot consumers only read id/subject/predicate/object/label/classes, which are identical in both shapes
export const getPublishedContents = (paperId: string) => papersApi.findPublishedContentsById({ id: paperId });
