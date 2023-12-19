import { url } from 'constants/misc';
import { submitPutRequest, submitDeleteRequest, submitPostRequest, submitGetRequest } from 'network';
import { getStatementsBySubjectAndPredicate, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { indexContribution } from 'services/similarity';
import { toast } from 'react-toastify';
import qs from 'qs';
import { PaginatedResponse, Resource, Statement } from 'services/backend/types';

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
            extraction_method: string,
            name: string;
        }[];
    };
};

// Save full paper and index contributions in the similarity service
export const saveFullPaper = (data: PaperData, mergeIfExists: boolean = false): Promise<Resource> =>
    submitPostRequest(`${papersUrl}?mergeIfExists=${mergeIfExists}`, { 'Content-Type': 'application/json' }, data).then(async paper => {
        Promise.all(await indexContributionsByPaperId(paper.id)).catch(() =>
            toast.warning('Similarity service seems to be down, skipping paper indexing'),
        );
        return paper;
    });

export const getIsVerified = (id: string): Promise<null> =>
    submitGetRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsVerified = (id: string): Promise<null> =>
    submitPutRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsUnverified = (id: string): Promise<null> =>
    submitDeleteRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const indexContributionsByPaperId = async (paperId: string): Promise<{ message: string }[]> => {
    const contributionStatements = await getStatementsBySubjectAndPredicate({
        subjectId: paperId,
        predicateId: PREDICATES.HAS_CONTRIBUTION,
    });

    return contributionStatements.map(statement => indexContribution(statement.object.id) as unknown as { message: string }); // first as unknown before 'indexContribution' is not yet typed
};

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
    items: size = 9999,
    sortBy = 'paper.created_at',
    desc = true,
    returnContent = false,
}: {
    id: string;
    page?: number;
    items?: number;
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
