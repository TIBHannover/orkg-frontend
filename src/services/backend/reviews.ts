import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import backendApi, { getCreatedIdFromHeaders } from 'services/backend/backendApi';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    Review,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
    ResearchFieldIdParams,
    ReviewSectionComparisonPayload,
    ReviewSectionVisualizationPayload,
    ReviewSectionResourcePayload,
    ReviewSectionPredicatePayload,
    ReviewSectionOntologyPayload,
    ReviewSectionTextPayload,
    Statement,
    ReviewPublishedContents,
} from 'services/backend/types';

export const reviewUrl = `${url}smart-reviews/`;
export const reviewApi = backendApi.extend(() => ({ prefixUrl: reviewUrl }));
const REVIEWS_CONTENT_TYPE = 'application/vnd.orkg.smart-review.v1+json';
const REVIEWS_SECTION_CONTENT_TYPE = 'application/vnd.orkg.smart-review-section.v1+json';

export const getReviews = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    research_field,
    include_subfields,
    sdg,
    published,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & PublishedParam & SdgParam & ObservatoryIdParam & ResearchFieldIdParams) => {
    const searchParams = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        published,
        research_field,
        include_subfields,
    });
    return reviewApi
        .get<PaginatedResponse<Review>>('', {
            searchParams,
            headers: {
                Accept: REVIEWS_CONTENT_TYPE,
            },
        })
        .json();
};

export const getReview = (id: string) => {
    return reviewApi
        .get<Review>(id, {
            headers: {
                Accept: REVIEWS_CONTENT_TYPE,
            },
        })
        .json();
};

export const getReviewPublishedContents = ({ reviewId, entityId }: { reviewId: string; entityId: string }) => {
    return reviewApi.get<ReviewPublishedContents>(`${reviewId}/published-contents/${entityId}`).json();
};

export type UpdateSectionPayload = Partial<
    | ReviewSectionComparisonPayload
    | ReviewSectionVisualizationPayload
    | ReviewSectionResourcePayload
    | ReviewSectionPredicatePayload
    | ReviewSectionOntologyPayload
    | ReviewSectionTextPayload
>;

export type UpdateReviewParams = Partial<
    Omit<Review, 'id' | 'research_fields' | 'sdgs' | 'sections'> & { research_fields: string[] } & { sdgs: string[] } & {
        sections: UpdateSectionPayload[];
    }
>;

export const updateReview = (id: string, data: UpdateReviewParams) => {
    return reviewApi
        .put<void>(id, {
            json: data,
            headers: {
                'Content-Type': REVIEWS_CONTENT_TYPE,
                Accept: REVIEWS_CONTENT_TYPE,
            },
        })
        .json();
};

export const createReviewSection = ({
    reviewId,
    index,
    data,
}: {
    reviewId: string;
    index: number;
    data:
        | ReviewSectionComparisonPayload
        | ReviewSectionVisualizationPayload
        | ReviewSectionResourcePayload
        | ReviewSectionPredicatePayload
        | ReviewSectionOntologyPayload
        | ReviewSectionTextPayload;
}) => {
    return reviewApi
        .post<void>(`${reviewId}/sections/${index}`, {
            json: data,
            headers: {
                'Content-Type': REVIEWS_SECTION_CONTENT_TYPE,
                Accept: REVIEWS_SECTION_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const updateReviewSection = ({
    reviewId,
    sectionId,
    data,
}: {
    reviewId: string;
    sectionId: string;
    data: Partial<
        | ReviewSectionComparisonPayload
        | ReviewSectionVisualizationPayload
        | ReviewSectionResourcePayload
        | ReviewSectionPredicatePayload
        | ReviewSectionOntologyPayload
        | ReviewSectionTextPayload
    >;
}) => {
    return reviewApi
        .put<void>(`${reviewId}/sections/${sectionId}`, {
            json: data,
            headers: {
                'Content-Type': REVIEWS_SECTION_CONTENT_TYPE,
                Accept: REVIEWS_SECTION_CONTENT_TYPE,
            },
        })
        .json();
};

export const deleteReviewSection = ({ reviewId, sectionId }: { reviewId: string; sectionId: string }) => {
    return reviewApi
        .delete<void>(`${reviewId}/sections/${sectionId}`, {
            headers: {
                Accept: REVIEWS_SECTION_CONTENT_TYPE,
            },
        })
        .json();
};

export const publishReview = (
    reviewId: string,
    data: {
        changelog: string;
        assign_doi: boolean;
        description?: string;
    },
) => {
    return reviewApi
        .post<void>(`${reviewId}/publish`, {
            json: data,
            headers: {
                'Content-Type': REVIEWS_CONTENT_TYPE,
                Accept: REVIEWS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const createReview = (data: Partial<Omit<Review, 'research_fields'> & { research_fields: string[] }>) => {
    return reviewApi
        .post<void>('', {
            json: data,
            headers: {
                'Content-Type': REVIEWS_CONTENT_TYPE,
                Accept: REVIEWS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};
