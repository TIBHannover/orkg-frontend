import { ContentTypeClass, ContentTypesApi, ContentTypesApiFindAllRequest } from '@orkg/orkg-client';
import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { ALL_CONTENT_TYPES_ID, urlNoTrailingSlash } from '@/constants/misc';
import { configuration, transformPaginationParams } from '@/services/backend/backendApi';
import { getComparisons } from '@/services/backend/comparisons';
import { getLiteratureLists } from '@/services/backend/literatureLists';
import { mergePaginateResponses, toCamelPage } from '@/services/backend/misc';
import { observatoriesApi } from '@/services/backend/observatories';
import { getPaper, getPapers } from '@/services/backend/papers';
import { getResources } from '@/services/backend/resources';
import { getReviews } from '@/services/backend/reviews';
import { getRSStatements, getRSTemplates } from '@/services/backend/rosettaStone';
import { getTemplates } from '@/services/backend/templates';
import { FilterConfig, Item, PaginatedResponse, Pagination, PublishedParam, Resource, SortByParam, VisibilityParam } from '@/services/backend/types';
import { getVisualizations } from '@/services/backend/visualizations';

export const contentTypesUrl = `${urlNoTrailingSlash}/content-types`;

const contentTypesApi = new ContentTypesApi(configuration);

export type GetContentParams = {
    filterConfig?: FilterConfig[];
    page?: number;
    size?: number;
    createdBy?: string;
    observatoryId?: string;
    organizationId?: string;
    researchField?: string;
    includeSubfields?: boolean;
    sdg?: string;
    authorId?: string;
    authorName?: string;
} & SortByParam &
    VisibilityParam &
    PublishedParam;

export const getGenericContentTypes = async ({
    classes,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    page,
    size,
    sortBy,
    createdBy,
    observatoryId,
    organizationId,
    researchField,
    includeSubfields,
    sdg,
    authorId,
    authorName,
}: { classes?: ContentTypeClass[] } & Omit<GetContentParams, 'filterConfig' | 'published'>): Promise<Pagination<Item>> => {
    const response = await contentTypesApi.findAll(
        transformPaginationParams({
            page,
            size,
            sortBy,
            classes,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as ContentTypesApiFindAllRequest['visibility'],
            createdBy,
            observatoryId,
            organizationId,
            researchField,
            includeSubfields,
            sdg,
            authorId,
            authorName,
        }),
    );
    return {
        ...response,
        content: response.content.map((item) => item as unknown as Item),
    };
};

const getAPIFunction = async (cType: string, paramsObj: GetContentParams): Promise<Pagination<Resource | Item>> => {
    const { filterConfig, published, ...listingParams } = paramsObj;
    const { page, size, sortBy, visibility, createdBy, observatoryId, organizationId, researchField, includeSubfields, sdg } = paramsObj;
    switch (cType) {
        case ALL_CONTENT_TYPES_ID:
            return getGenericContentTypes({
                ...listingParams,
                classes: ['PAPER', 'COMPARISON', 'VISUALIZATION', 'TEMPLATE', 'LITERATURE_LIST', 'SMART_REVIEW'],
            });
        case CLASSES.PAPER:
            if (!filterConfig || filterConfig?.length === 0) {
                if (paramsObj.authorId || paramsObj.authorName) {
                    return getGenericContentTypes({ ...listingParams, classes: ['PAPER'] });
                }
                return getPapers({
                    page,
                    size,
                    sortBy,
                    visibility,
                    createdBy,
                    observatoryId,
                    researchField,
                    includeSubfields,
                    sdg,
                    // listings show head versions only unless a caller explicitly asks otherwise
                    published: published ?? false,
                });
            }
            if (observatoryId) {
                // the observatory papers endpoint is not part of the generated client; it expects
                // the wire parameter names
                const result = await observatoriesApi
                    .get<any>(`${encodeURIComponent(observatoryId)}/papers`, {
                        searchParams: qs.stringify(
                            {
                                page,
                                size,
                                sortBy,
                                visibility,
                                created_by: createdBy,
                                observatory_id: observatoryId,
                                organization_id: organizationId,
                                research_field: researchField,
                                include_subfields: includeSubfields,
                                sdg,
                                published,
                                filter_config: JSON.stringify(filterConfig),
                            },
                            { skipNulls: true },
                        ),
                    })
                    .json();
                const papers = await Promise.all(result.content.map((p: Resource) => getPaper(p.id)));
                return toCamelPage({ ...result, content: papers });
            }
            return getGenericContentTypes({ ...listingParams, classes: ['PAPER'] });
        case CLASSES.COMPARISON:
            if (paramsObj.authorId || paramsObj.authorName) {
                return getGenericContentTypes({ ...listingParams, classes: ['COMPARISON'] });
            }
            return getComparisons({
                page,
                size,
                sortBy,
                visibility,
                createdBy,
                observatoryId,
                organizationId,
                researchField,
                includeSubfields,
                sdg,
                published,
            });
        case CLASSES.SMART_REVIEW_PUBLISHED:
            if (paramsObj.authorId || paramsObj.authorName) {
                return getGenericContentTypes({ ...listingParams, classes: ['SMART_REVIEW'] });
            }
            return getReviews({
                page,
                size,
                sortBy,
                visibility,
                createdBy,
                observatoryId,
                organizationId,
                researchField,
                includeSubfields,
                sdg,
                published,
            });
        case CLASSES.VISUALIZATION:
            if (paramsObj.authorId || paramsObj.authorName) {
                return getGenericContentTypes({ ...listingParams, classes: ['VISUALIZATION'] });
            }
            // the generated visualizations endpoint has no sdg filter; the SDG page
            // explicitly excludes visualizations, so nothing loses that filter
            return getVisualizations({ page, size, sortBy, visibility, createdBy, observatoryId, organizationId, researchField, includeSubfields });
        case CLASSES.LITERATURE_LIST_PUBLISHED:
            if (paramsObj.authorId || paramsObj.authorName) {
                return getGenericContentTypes({ ...listingParams, classes: ['LITERATURE_LIST'] });
            }
            return getLiteratureLists({
                page,
                size,
                sortBy,
                visibility,
                createdBy,
                observatoryId,
                organizationId,
                researchField,
                includeSubfields,
                sdg,
                published,
            });
        case CLASSES.PROBLEM:
            return getResources({ page, size, sortBy, visibility, createdBy, observatoryId, include: [cType] });
        case CLASSES.NODE_SHAPE:
            return getTemplates({
                page,
                size,
                sortBy,
                visibility,
                createdBy,
                observatoryId,
                organizationId,
                researchField,
                includeSubfields,
            });
        case CLASSES.ROSETTA_NODE_SHAPE:
            // rosetta stone representations carry no _class discriminator; CardFactory routes them by contentType
            return getRSTemplates({ page, size, sortBy, visibility, createdBy, observatoryId }) as unknown as Promise<Pagination<Resource | Item>>;
        case CLASSES.ROSETTA_STONE_STATEMENT:
            return getRSStatements({ page, size, sortBy, visibility, observatoryId }) as unknown as Promise<Pagination<Resource | Item>>;
        default:
            // `contentType` comes from a free-form URL param, so it is not necessarily a valid
            // classes= filter; fall back to a class-filtered resource listing like CLASSES.PROBLEM
            return getResources({ page, size, sortBy, visibility, createdBy, observatoryId, include: [cType] });
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
            property: 'createdAt',
            direction: 'desc',
        },
    ],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    contentType = CLASSES.PAPER,
    filterConfig = [],
    researchField,
    includeSubfields,
    observatoryId,
    organizationId,
    createdBy,
    sdg,
    published,
    authorId,
    authorName,
}: { contentType: string } & GetContentParams): Promise<Pagination<Resource | Item>> => {
    const paramsObj = {
        observatoryId,
        researchField,
        includeSubfields,
        page,
        size,
        sortBy,
        visibility,
        filterConfig,
        sdg,
        published,
        createdBy,
        organizationId,
        authorId,
        authorName,
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
