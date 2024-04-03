import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { prepareParams } from 'services/backend/misc';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import {
    CreateContribution,
    CreatePaperParams,
    CreatedByParam,
    ExtractionMethod,
    PaginatedResponse,
    PaginationParams,
    Paper,
    Resource,
    SdgParam,
    Statement,
    UpdatePaperParams,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const papersUrl = `${url}papers/`;

export const getPaper = (id: string): Promise<Paper> =>
    submitGetRequest(`${papersUrl}${id}`, {
        'Content-Type': 'application/vnd.orkg.paper.v2+json',
        Accept: 'application/vnd.orkg.paper.v2+json',
    });

export const updatePaper = (id: string, data: UpdatePaperParams): Promise<Paper> =>
    submitPutRequest(
        `${papersUrl}${id}`,
        {
            'Content-Type': 'application/vnd.orkg.paper.v2+json',
            Accept: 'application/vnd.orkg.paper.v2+json',
        },
        data,
    );

export const createPaper = (data: CreatePaperParams): Promise<string> =>
    submitPostRequest(
        `${papersUrl}`,
        {
            'Content-Type': 'application/vnd.orkg.paper.v2+json',
            Accept: 'application/vnd.orkg.paper.v2+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header

export const getIsVerified = (id: string): Promise<null> =>
    submitGetRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsVerified = (id: string): Promise<null> =>
    submitPutRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsUnverified = (id: string): Promise<null> =>
    submitDeleteRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

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
    sortBy = 'paper.created_at',
    desc = true,
    returnContent = false,
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    returnContent?: boolean;
}): Promise<
    PaginatedResponse<
        Resource & {
            path: Resource[][];
        }
    >
> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { linkedTo: id, page, size, sort, desc },
        {
            skipNulls: true,
        },
    );

    const resources = await submitGetRequest(`${papersUrl}?${params}`).then((res) => (returnContent ? res.content : res));
    return resources;
};

export const getPaperByDoi = async (doi: string): Promise<Paper | null> => {
    const papers: PaginatedResponse<Paper> = await submitGetRequest(`${papersUrl}?doi=${encodeURIComponent(doi)}`, {
        'Content-Type': 'application/vnd.orkg.paper.v2+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.paper.v2+json',
    });
    return papers.content[0] ?? null;
};

export const getPaperByTitle = async (title: string): Promise<Paper | null> => {
    const papers: PaginatedResponse<Paper> = await submitGetRequest(`${papersUrl}?title=${encodeURIComponent(title)}&exact=true`, {
        'Content-Type': 'application/vnd.orkg.paper.v2+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.paper.v2+json',
    });
    return papers.content?.[0] ?? null;
};

export const getPapers = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    sdg,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam): Promise<PaginatedResponse<Paper>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, sdg });
    return submitGetRequest(`${papersUrl}?${params}`, {
        'Content-Type': 'application/vnd.orkg.paper.v2+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.paper.v2+json',
    });
};

type CreateContributionParams = {
    paperId: string;
    contributionStatements: {
        extraction_method?: ExtractionMethod;
    } & CreateContribution;
};

export const createContribution = ({ paperId, contributionStatements }: CreateContributionParams): Promise<string> =>
    submitPostRequest(
        `${papersUrl}${paperId}/contributions`,
        {
            'Content-Type': 'application/vnd.orkg.contribution.v2+json',
            Accept: 'application/vnd.orkg.contribution.v2+json',
        },
        contributionStatements,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));
