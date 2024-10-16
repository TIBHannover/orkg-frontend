import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { ALL_CONTENT_TYPES_ID, url as baseUrl } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { getComparisons } from 'services/backend/comparisons';
import { getLiteratureLists } from 'services/backend/literatureLists';
import { mergePaginateResponses, prepareParams } from 'services/backend/misc';
import { observatoriesUrl } from 'services/backend/observatories';
import { getPapers } from 'services/backend/papers';
import { getResources } from 'services/backend/resources';
import { getReviews } from 'services/backend/reviews';
import { getRSTemplates } from 'services/backend/rosettaStone';
import { getTemplates } from 'services/backend/templates';
import {
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
} from 'services/backend/types';
import { getVisualizations } from 'services/backend/visualizations';

export const contentTypesUrl = `${baseUrl}content-types/`;

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
    PublishedParam;

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
}: { classes: string[] } & GetContentParams): Promise<PaginatedResponse<Item>> => {
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
    });
    return submitGetRequest(`${contentTypesUrl}?${params}&classes=${classes.join(',')}`, {
        'Content-Type': 'Content-Type: application/json;charset=UTF-8',
    });
};

const getAPIFunction = (cType: string, paramsObj: Omit<GetContentParams, 'contentType'>) => {
    switch (cType) {
        case ALL_CONTENT_TYPES_ID:
            return getGenericContentTypes({
                ...paramsObj,
                classes: ['PAPER', 'COMPARISON', 'VISUALIZATION', 'TEMPLATE', 'LITERATURE_LIST', 'SMART_REVIEW'],
            });
        case CLASSES.PAPER:
            if (!paramsObj.filter_config || paramsObj.filter_config?.length === 0) {
                return getPapers(paramsObj);
            }
            if (paramsObj.observatory_id) {
                return submitGetRequest(
                    `${observatoriesUrl}${encodeURIComponent(paramsObj.observatory_id)}/papers?${qs.stringify(
                        { ...paramsObj, filter_config: JSON.stringify(paramsObj.filter_config) },
                        { skipNulls: true },
                    )}`,
                );
            }
            return getGenericContentTypes({ ...paramsObj, classes: ['PAPER'] });
        case CLASSES.COMPARISON:
            return getComparisons(paramsObj);
        case CLASSES.SMART_REVIEW_PUBLISHED:
            return getReviews(paramsObj);
        case CLASSES.VISUALIZATION:
            return getVisualizations(paramsObj);
        case CLASSES.LITERATURE_LIST_PUBLISHED:
            return getLiteratureLists(paramsObj);
        case CLASSES.PROBLEM:
            return getResources({ ...paramsObj, include: [cType] });
        case CLASSES.NODE_SHAPE:
            return getTemplates(paramsObj);
        case CLASSES.ROSETTA_NODE_SHAPE:
            return getRSTemplates(paramsObj);
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
}: { contentType: string } & GetContentParams): Promise<PaginatedResponse<Resource | Item>> => {
    // Sort is not supported in this endpoint
    const sort = sortBy?.map((p) => `${p.property},${p.direction}`);
    const paramsObj = {
        observatory_id,
        research_field,
        include_subfields,
        page,
        size,
        sort,
        visibility,
        filter_config,
        sdg,
        published,
        created_by,
        organization_id,
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
