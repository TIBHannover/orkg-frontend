import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { PaginatedResponse, PaginationParams, Paper, Resource, Statement, VerifiedParam, VisibilityParam } from 'services/backend/types';
import { prepareParams } from 'services/backend/misc';

export const papersUrl = `${url}papers/`;

type PaperData = {
    paper: {
        title: string;
        doi: string;
        authors: {
            label: string;
            id?: string;
            orcid?: string;
        }[];
        publicationMonth: string;
        publicationYear: string;
        publishedIn: string;
        url: string;
        researchField: string;
        contributions: {
            extraction_method: string;
            name: string;
        }[];
    };
};

export const saveFullPaper = (data: PaperData, mergeIfExists: boolean = false): Promise<Resource> =>
    submitPostRequest(`${papersUrl}?mergeIfExists=${mergeIfExists}`, { 'Content-Type': 'application/json' }, data);

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

    const resources = await submitGetRequest(`${papersUrl}?${params}`).then(res => (returnContent ? res.content : res));
    return resources;
};

export const getPapers = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}: PaginationParams & VerifiedParam & VisibilityParam): Promise<PaginatedResponse<Paper>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility });
    return submitGetRequest(`${papersUrl}?${params}`, {
        'Content-Type': 'application/vnd.orkg.paper.v2+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.paper.v2+json',
    });
};
