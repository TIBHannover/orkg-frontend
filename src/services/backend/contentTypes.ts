import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID, url as baseUrl } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { getComparisons } from '@/services/backend/comparisons';
import { getLiteratureLists } from '@/services/backend/literatureLists';
import { mergePaginateResponses, prepareParams } from '@/services/backend/misc';
import { observatoriesApi } from '@/services/backend/observatories';
import { getPaper, getPapers } from '@/services/backend/papers';
import { getResources } from '@/services/backend/resources';
import { getReviews } from '@/services/backend/reviews';
import { getRSStatements, getRSTemplates } from '@/services/backend/rosettaStone';
import { getTemplates } from '@/services/backend/templates';
import {
    AuthorIdParam,
    CreatedByParam,
    FilterConfig,
    Item,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    ResearchFieldIdParams,
    Resource,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from '@/services/backend/types';
import { getVisualizations } from '@/services/backend/visualizations';

export const contentTypesUrl = `${baseUrl}content-types/`;
export const contentTypesApi = backendApi.extend(() => ({ prefixUrl: contentTypesUrl }));

export type GetContentParams = {
    filter_config?: FilterConfig[];
} & PaginationParams &
    VisibilityParam &
    VerifiedParam &
    CreatedByParam &
    SdgParam &
    ObservatoryIdParam &
    OrganizationIdParam &
    ResearchFieldIdParams &
    PublishedParam &
    AuthorIdParam;

export const getGenericContentTypes = ({
    classes,
    page = 0,
    size = 999,
    sortBy = [
        {
            property: 'created_at',
            direction: 'desc',
        },
    ],
    verified,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    organization_id,
    research_field,
    include_subfields,
    sdg,
    author_id,
}: { classes?: string[] } & GetContentParams) => {
    const params = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        organization_id,
        research_field,
        sdg,
        include_subfields,
        author_id,
    });
    return contentTypesApi
        .get<PaginatedResponse<Item>>('', {
            searchParams: `?${params}${classes ? `&classes=${classes.join(',')}` : ''}`,
        })
        .json();
};

const getAPIFunction = async (cType: string, paramsObj: Omit<GetContentParams, 'contentType'>) => {
    switch (cType) {
        case ALL_CONTENT_TYPES_ID:
            return getGenericContentTypes({
                ...paramsObj,
                classes: ['PAPER', 'COMPARISON', 'VISUALIZATION', 'TEMPLATE', 'LITERATURE_LIST', 'SMART_REVIEW'],
            });
        case CLASSES.PAPER:
            if (!paramsObj.filter_config || paramsObj.filter_config?.length === 0) {
                if (paramsObj.author_id) {
                    return getGenericContentTypes({ ...paramsObj, classes: ['PAPER'] });
                }
                return getPapers(paramsObj);
            }
            if (paramsObj.observatory_id) {
                const result = await observatoriesApi
                    .get<any>(`${encodeURIComponent(paramsObj.observatory_id)}/papers`, {
                        searchParams: qs.stringify({ ...paramsObj, filter_config: JSON.stringify(paramsObj.filter_config) }, { skipNulls: true }),
                    })
                    .json();
                const papers = await Promise.all(result.content.map((p: Resource) => getPaper(p.id)));
                return { ...result, content: papers };
            }
            return getGenericContentTypes({ ...paramsObj, classes: ['PAPER'] });
        case CLASSES.COMPARISON:
            if (paramsObj.author_id) {
                return getGenericContentTypes({ ...paramsObj, classes: ['COMPARISON'] });
            }
            return getComparisons(paramsObj);
        case CLASSES.SMART_REVIEW_PUBLISHED:
            if (paramsObj.author_id) {
                return getGenericContentTypes({ ...paramsObj, classes: ['SMART_REVIEW'] });
            }
            return getReviews(paramsObj);
        case CLASSES.VISUALIZATION:
            if (paramsObj.author_id) {
                return getGenericContentTypes({ ...paramsObj, classes: ['VISUALIZATION'] });
            }
            return getVisualizations(paramsObj);
        case CLASSES.LITERATURE_LIST_PUBLISHED:
            if (paramsObj.author_id) {
                return getGenericContentTypes({ ...paramsObj, classes: ['LITERATURE_LIST'] });
            }
            return getLiteratureLists(paramsObj);
        case CLASSES.PROBLEM:
            return getResources({ ...paramsObj, include: [cType] });
        case CLASSES.NODE_SHAPE:
            return getTemplates(paramsObj);
        case CLASSES.ROSETTA_NODE_SHAPE:
            return getRSTemplates(paramsObj);
        case CLASSES.ROSETTA_STONE_STATEMENT:
            return getRSStatements(paramsObj);
        default:
            return getGenericContentTypes({ ...paramsObj, classes: [cType] }); // default fallback
    }
};

/**
 * Get content
 * @param {Number} page Page number
 * @param {Number} size Number of items per page
 * @param {SortByOptions} sortBy Sort field
 * @param {string} contentType Class ID Filter
 * @param {FilterConfig} filters The filter config to use
 * @return {Promise} Promise of paginated list of content type
 */
export const getContentTypes = ({
    page = 0,
    size = 9999,
    sortBy = [
        {
            property: 'created_at',
            direction: 'desc',
        },
    ],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    contentType = CLASSES.PAPER,
    filter_config = [],
    research_field,
    include_subfields,
    observatory_id,
    organization_id,
    created_by,
    sdg,
    published,
    author_id,
}: { contentType: string } & GetContentParams): Promise<PaginatedResponse<Resource | Item>> => {
    const paramsObj = {
        observatory_id,
        research_field,
        include_subfields,
        page,
        size,
        sortBy,
        visibility,
        filter_config,
        sdg,
        published,
        created_by,
        organization_id,
        author_id,
    };
    if (visibility === VISIBILITY_FILTERS.TOP_RECENT) {
        const paramsFeaturedObj = { ...paramsObj, visibility: VISIBILITY_FILTERS.FEATURED };
        const paramsNoFeaturedObj = { ...paramsObj, visibility: VISIBILITY_FILTERS.NON_FEATURED };
        return Promise.all([getAPIFunction(contentType, paramsFeaturedObj), getAPIFunction(contentType, paramsNoFeaturedObj)]).then(
            ([featured, noFeatured]) => mergePaginateResponses(featured, noFeatured),
        );
    }
    return getAPIFunction(contentType, paramsObj);
};
