import {
    CreateSmartReviewRequest,
    PublishSmartReviewRequest,
    SmartReviewsApi,
    SmartReviewsApiFindAllRequest,
    SmartReviewsUpdateSectionRequest,
    UpdateSmartReviewRequest,
} from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toAuthorRequest } from '@/services/backend/mapAuthor';
import { PublishedParam, UpdateAuthor, VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const reviewUrl = `${urlNoTrailingSlash}/smart-reviews`;

const smartReviewsApi = new SmartReviewsApi(configuration);

export const getReviews = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    published,
    ...params
}: Omit<WithPaginationParams<SmartReviewsApiFindAllRequest>, 'visibility' | 'published'> & VisibilityParam & PublishedParam) =>
    smartReviewsApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as SmartReviewsApiFindAllRequest['visibility'],
            published: published ?? undefined,
        }),
    );

export const getReview = (id: string) => smartReviewsApi.findById({ id });

export const getReviewPublishedContents = ({ reviewId, entityId }: { reviewId: string; entityId: string }) =>
    smartReviewsApi.findPublishedContentById({ id: reviewId, contentId: entityId });

// section payloads must always carry the variant's full field set: the request unions are
// structural, and a payload matching no variant would serialize as {} (see the vendored issue
// reports on the request unions)
export type UpdateSectionPayload = SmartReviewsUpdateSectionRequest;

export type UpdateReviewParams = Omit<UpdateSmartReviewRequest, 'authors'> & {
    authors?: UpdateAuthor[];
};

export const updateReview = (id: string, data: UpdateReviewParams) =>
    smartReviewsApi.update({ id, updateSmartReviewRequest: { ...data, authors: data.authors?.map(toAuthorRequest) } as UpdateSmartReviewRequest });

export const createReviewSection = ({ reviewId, index, data }: { reviewId: string; index: number; data: UpdateSectionPayload }) =>
    smartReviewsApi.createSectionAtIndexRaw({ id: reviewId, index, smartReviewsCreateSectionAtIndexRequest: data }).then(getCreatedId);

export const updateReviewSection = ({ reviewId, sectionId, data }: { reviewId: string; sectionId: string; data: UpdateSectionPayload }) =>
    smartReviewsApi.updateSection({ id: reviewId, sectionId, smartReviewsUpdateSectionRequest: data });

export const deleteReviewSection = ({ reviewId, sectionId }: { reviewId: string; sectionId: string }) =>
    smartReviewsApi.deleteSection({ id: reviewId, sectionId });

export const publishReview = (reviewId: string, data: PublishSmartReviewRequest) =>
    smartReviewsApi.publishRaw({ id: reviewId, publishSmartReviewRequest: data }).then(getCreatedId);

export const createReview = (data: Omit<CreateSmartReviewRequest, 'authors'> & { authors?: UpdateAuthor[] }) =>
    smartReviewsApi
        .createRaw({ createSmartReviewRequest: { ...data, authors: (data.authors ?? []).map(toAuthorRequest) } as CreateSmartReviewRequest })
        .then(getCreatedId);
