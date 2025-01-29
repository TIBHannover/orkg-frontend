import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { getComparison } from 'services/backend/comparisons';
import { mergePaginateResponses } from 'services/backend/misc';
import { getPaper } from 'services/backend/papers';
import { Contributor, Item, PaginatedResponse, PaginationParams, Resource, VerifiedParam, VisibilityParam } from 'services/backend/types';
import { getVisualization } from 'services/backend/visualizations';

export const problemsUrl = `${url}problems/`;
export const problemsApi = backendApi.extend(() => ({ prefixUrl: problemsUrl }));

export const getResearchFieldsByResearchProblemId = (problemId: string) =>
    problemsApi
        .get<
            {
                field: Resource;
                freq: number;
            }[]
        >(`${encodeURIComponent(problemId)}/fields`)
        .json();

export const getContributorsByResearchProblemId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return problemsApi
        .get<
            {
                user: Contributor;
                contributions: number;
            }[]
        >(`${encodeURIComponent(id)}/users`, {
            searchParams,
        })
        .json();
};

export type ResearchProblemTopAuthor = {
    author: {
        value: string | Resource;
    };
    papers: number;
};

export const getAuthorsByResearchProblemId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return problemsApi
        .get<PaginatedResponse<ResearchProblemTopAuthor>>(`${encodeURIComponent(id)}/authors`, {
            searchParams,
        })
        .json();
};

type ResearchProblemParams = {
    id: string;
    classes?: string[];
} & PaginationParams &
    VisibilityParam &
    VerifiedParam;

const getAPIFunction = async (paramsObj: ResearchProblemParams) => {
    const result = await problemsApi
        .get<PaginatedResponse<Resource>>(encodeURIComponent(paramsObj.id), {
            searchParams: qs.stringify({
                page: paramsObj.page,
                size: paramsObj.size,
                sort: paramsObj.sortBy?.map((p) => `${p.property},${p.direction}`),
                visibility: paramsObj.visibility,
                classes: paramsObj.classes?.join(','),
            }),
        })
        .json();
    const papers = await Promise.all(
        result.content.map((p: Resource) => {
            if (paramsObj.classes?.includes(CLASSES.PAPER)) {
                return getPaper(p.id).then((_p) => ({ ..._p, _class: CLASSES.PAPER.toLowerCase() }));
            }
            if (paramsObj.classes?.includes(CLASSES.COMPARISON)) {
                return getComparison(p.id).then((_p) => ({ ..._p, _class: CLASSES.COMPARISON.toLowerCase() }));
            }
            if (paramsObj.classes?.includes(CLASSES.VISUALIZATION)) {
                return getVisualization(p.id).then((_p) => ({ ..._p, _class: CLASSES.VISUALIZATION.toLowerCase() }));
            }
            return p;
        }),
    );
    return { ...result, content: papers as Item[] };
};

export const getResearchProblemContent = ({
    id,
    page = 0,
    size = 9999,
    sortBy = [
        {
            property: 'created_at',
            direction: 'desc',
        },
    ],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
}: ResearchProblemParams) => {
    const sort = sortBy?.map((p) => `${p.property},${p.direction}`);
    const searchParams = {
        page,
        size,
        sort,
        visibility,
        classes: classes.join(','),
    };

    if (visibility === VISIBILITY_FILTERS.TOP_RECENT) {
        const paramsFeaturedObj = { ...searchParams, visibility: VISIBILITY_FILTERS.FEATURED };
        const paramsNoFeaturedObj = { ...searchParams, visibility: VISIBILITY_FILTERS.NON_FEATURED };
        return Promise.all([getAPIFunction({ ...paramsFeaturedObj, id, classes }), getAPIFunction({ ...paramsNoFeaturedObj, id, classes })]).then(
            ([featured, noFeatured]) => mergePaginateResponses(featured, noFeatured),
        );
    }
    return getAPIFunction({ ...searchParams, id, classes });
};
