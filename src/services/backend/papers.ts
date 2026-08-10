import { CreatePaperRequest, PapersApi, PapersApiFindAllRequest, PublishPaperRequest, UpdatePaperRequest } from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { PREDICATES } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { getStatements } from '@/services/backend/statements';
import {
    CreatePaperParams,
    Paper,
    PublishedParam,
    Statement,
    UpdatePaperParams,
    VerifiedParam,
    VisibilityParam,
    WithPaginationParams,
} from '@/services/backend/types';

export const papersUrl = `${urlNoTrailingSlash}/papers`;

const papersApi = new PapersApi(configuration);

export const getPaper = (id: string) => papersApi.findById({ id });

export const updatePaper = (id: string, data: UpdatePaperParams) => papersApi.update({ id, updatePaperRequest: data as UpdatePaperRequest });

export const createPaper = (data: CreatePaperParams): Promise<string> =>
    papersApi.createRaw({ createPaperRequest: data as CreatePaperRequest }).then(getCreatedId);

// the head paper is the center of a star graph linking to its snapshots via hasPublishedVersion,
// so the head of a published version is the subject of the single incoming statement
export const getOriginalPaperId = async (paperId: string): Promise<string | undefined> => {
    const statements = (await getStatements({
        objectId: paperId,
        predicateId: PREDICATES.HAS_PUBLISHED_VERSION,
    })) as Statement[];
    return statements?.[0]?.subject.id;
};

// existence checks must match the editable head version, never a published snapshot
export const getPaperByDoi = async (doi: string): Promise<Paper | null> => {
    const papers = await papersApi.findAll({ doi, published: 'false' });
    return papers.content[0] ?? null;
};

export const getPaperByTitle = async (title: string): Promise<Paper | null> => {
    const papers = await papersApi.findAll({ title, exact: true, published: 'false' });
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
            // the generated request type declares published as a string, unlike the app-level boolean
            published: published != null ? String(published) : undefined,
        }),
    );

export const publishPaper = (paperId: string, data: PublishPaperRequest) =>
    papersApi.publishRaw({ id: paperId, publishPaperRequest: data }).then(getCreatedId);

// snapshot consumers only read id/subject/predicate/object/label/classes, which are identical in both shapes
export const getPublishedContents = (paperId: string) =>
    papersApi.findPublishedContentsById({ id: paperId }) as unknown as Promise<{ statements: Statement[] }>;
