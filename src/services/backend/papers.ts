import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import qs from 'qs';
import backendApi, { getCreatedIdFromHeaders } from 'services/backend/backendApi';
import { prepareParams } from 'services/backend/misc';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import {
    CreateContribution,
    CreatePaperParams,
    CreatedByParam,
    ExtractionMethod,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    Paper,
    ResearchFieldIdParams,
    Resource,
    SdgParam,
    Statement,
    UpdatePaperParams,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const papersUrl = `${url}papers/`;
export const papersApi = backendApi.extend(() => ({ prefixUrl: papersUrl }));
const PAPERS_CONTENT_TYPE = 'application/vnd.orkg.paper.v2+json';
const CONTRIBUTIONS_CONTENT_TYPE = 'application/vnd.orkg.contribution.v2+json';

export const getPaper = (id: string) =>
    papersApi
        .get<Paper>(id, {
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .json();

export const updatePaper = (id: string, data: UpdatePaperParams) =>
    papersApi
        .put<Paper>(id, {
            json: data,
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .json();

export const createPaper = (data: CreatePaperParams): Promise<string> =>
    papersApi
        .post<void>('', {
            json: data,
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const markAsVerified = (id: string) => papersApi.put<void>(`${id}/metadata/verified`).json();

export const markAsUnverified = (id: string) => papersApi.delete<void>(`${id}/metadata/verified`).json();

export const getOriginalPaperId = (paperId: string) => {
    const getPaperId = async (id: string): Promise<string> => {
        const statements = (await getStatementsByObjectAndPredicate({
            objectId: id,
            predicateId: PREDICATES.HAS_PREVIOUS_VERSION,
        })) as Statement[];

        // finding the original paperId from the published version
        if (!statements?.[0]?.subject.classes?.includes(CLASSES.PAPER)) {
            return getPaperId(statements[0].subject.id);
        }
        return statements?.[0]?.subject.id;
    };
    const pId = getPaperId(paperId);
    return pId;
};

export const getPapersLinkedToResource = async ({
    id,
    page = 0,
    size = 9999,
    sortBy = [{ property: 'paper.created_at', direction: 'desc' }],
    returnContent = false,
}: {
    id: string;
    returnContent?: boolean;
} & PaginationParams) => {
    const searchParams = qs.stringify(
        { linked_to: id, page, size },
        {
            skipNulls: true,
        },
    );

    const resources = await papersApi
        .get<
            PaginatedResponse<
                Resource & {
                    path: Resource[][];
                }
            >
        >('', {
            searchParams,
        })
        .json()
        .then((res) => (returnContent ? res.content : res));
    return resources;
};

export const getPaperByDoi = async (doi: string): Promise<Paper | null> => {
    const papers = await papersApi
        .get<PaginatedResponse<Paper>>('', {
            searchParams: `doi=${encodeURIComponent(doi)}`,
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .json();
    return papers.content[0] ?? null;
};

export const getPaperByTitle = async (title: string): Promise<Paper | null> => {
    const papers = await papersApi
        .get<PaginatedResponse<Paper>>('', {
            searchParams: `title=${encodeURIComponent(title)}&exact=true`,
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .json();
    return papers.content?.[0] ?? null;
};

export const getPapers = ({
    page = 0,
    size = 999,
    sortBy,
    verified,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    research_field,
    include_subfields,
    sdg,
}: PaginationParams & VisibilityParam & VerifiedParam & CreatedByParam & SdgParam & ObservatoryIdParam & ResearchFieldIdParams) => {
    const searchParams = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        research_field,
        include_subfields,
    });
    return papersApi
        .get<PaginatedResponse<Paper>>('', {
            searchParams,
            headers: {
                'Content-Type': PAPERS_CONTENT_TYPE,
                Accept: PAPERS_CONTENT_TYPE,
            },
        })
        .json();
};

type CreateContributionParams = {
    paperId: string;
    contributionStatements: {
        extraction_method?: ExtractionMethod;
    } & CreateContribution;
};

export const createContribution = ({ paperId, contributionStatements }: CreateContributionParams) =>
    papersApi
        .post<void>(`${paperId}/contributions`, {
            json: contributionStatements,
            headers: {
                'Content-Type': CONTRIBUTIONS_CONTENT_TYPE,
                Accept: CONTRIBUTIONS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
