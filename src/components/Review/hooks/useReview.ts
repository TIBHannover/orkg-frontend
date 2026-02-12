import { Cite } from '@citation-js/core';
import { uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { PublicConfiguration } from 'swr/_internal';

import useParams from '@/components/useParams/useParams';
import { MISC } from '@/constants/graphSettings';
import errorHandler from '@/helpers/errorHandler';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import {
    createReviewSection,
    deleteReviewSection,
    getReview,
    reviewUrl,
    updateReview as updateReviewBackend,
    updateReviewSection,
    UpdateSectionPayload,
} from '@/services/backend/reviews';
import {
    Organization,
    Review,
    ReviewSectionComparisonPayload,
    ReviewSectionOntologyPayload,
    ReviewSectionPredicatePayload,
    ReviewSectionResourcePayload,
    ReviewSectionTextPayload,
    ReviewSectionType,
    ReviewSectionVisualizationPayload,
} from '@/services/backend/types';

const useReview = (reviewId?: string) => {
    let { id } = useParams<{ id: string }>();
    if (reviewId) {
        id = reviewId;
    }

    const {
        data: review,
        isLoading,
        error,
        mutate,
        isValidating,
    } = useSWR(id ? [id, reviewUrl, 'getReview'] : null, ([params]) => getReview(params));

    const mutateReviewOptimistic = ({ updateFunction, optimisticData }: { updateFunction: () => Promise<void | string>; optimisticData: Review }) =>
        mutate(
            async () => {
                try {
                    await updateFunction();
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                }
                return optimisticData;
            },
            {
                optimisticData,
                rollbackOnError: true,
                throwOnError: false,
            },
        );

    const updateReview = (updatedData: Partial<Review>) => {
        if (!review) {
            return null;
        }
        return mutateReviewOptimistic({
            updateFunction: () =>
                updateReviewBackend(review.id, {
                    ...(updatedData.research_fields &&
                        updatedData.research_fields.length > 0 && { research_fields: updatedData.research_fields.map((rf) => rf.id) }),
                    ...(updatedData.sdgs && updatedData.sdgs.length > 0 && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                    ...(updatedData.sections &&
                        updatedData.sections.length > 0 && {
                            sections: updatedData.sections.map((section) => ({
                                ...('heading' in section && { heading: section.heading }),
                                ...('text' in section && { text: section.text }),
                                ...('class' in section && { class: section.class }),
                                ...('comparison' in section && { comparison: section.comparison?.id ?? null }),
                                ...('visualization' in section && {
                                    visualization: section.visualization?.id ?? null,
                                }),
                                ...('resource' in section && { resource: section.resource?.id ?? null }),
                                ...('predicate' in section && { predicate: section.predicate?.id ?? null }),
                                ...('entities' in section && {
                                    entities: section.entities?.map((entity) => entity.id) ?? [],
                                }),
                                ...('predicates' in section && {
                                    predicates: section.predicates?.map((entity) => entity.id) ?? [],
                                }),
                            })),
                        }),
                    ...(({ research_fields, sdgs, sections, ...o }) => o)(updatedData),
                }),
            optimisticData: { ...review, ...updatedData },
        });
    };

    const createSection = ({ sectionType, atIndex }: { sectionType: ReviewSectionType; atIndex: number }) => {
        if (!review) {
            return null;
        }

        const sectionContent: {
            comparison: ReviewSectionComparisonPayload;
            visualization: ReviewSectionVisualizationPayload;
            resource: ReviewSectionResourcePayload;
            property: ReviewSectionPredicatePayload;
            ontology: ReviewSectionOntologyPayload;
            text: ReviewSectionTextPayload;
        } = {
            comparison: {
                heading: '',
                comparison: null,
            },
            visualization: {
                heading: '',
                visualization: null,
            },
            resource: {
                heading: '',
                resource: null,
            },
            property: {
                heading: '',
                predicate: null,
            },
            ontology: {
                heading: '',
                entities: [],
                predicates: [],
            },
            text: {
                heading: '',
                text: '',
                class: null,
            },
        };
        const newSection = sectionContent[sectionType];

        const sections = [
            ...review.sections.slice(0, atIndex),
            { ...newSection, id: uniqueId(), type: sectionType },
            ...review.sections.slice(atIndex),
        ];

        return mutateReviewOptimistic({
            updateFunction: () => createReviewSection({ reviewId: review.id, index: atIndex, data: newSection }),
            optimisticData: { ...review, ...sections },
        });
    };

    const updateSection = (sectionId: string, updatedData: UpdateSectionPayload) => {
        if (!review) {
            return null;
        }

        const generateOptimisticSectionContent = (id: string | null | undefined) => ({
            id: id ?? '',
            label: '',
            classes: [],
            _class: '',
        });

        const sections = {
            sections: review?.sections.map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          ...('heading' in updatedData && { heading: updatedData.heading }),
                          ...('text' in updatedData && { text: updatedData.text }),
                          ...('class' in updatedData && { class: updatedData.class }),
                          ...('comparison' in updatedData && { comparison: generateOptimisticSectionContent(updatedData.comparison) }),
                          ...('visualization' in updatedData && { visualization: generateOptimisticSectionContent(updatedData.visualization) }),
                          ...('resource' in updatedData && { resource: generateOptimisticSectionContent(updatedData.resource) }),
                          ...('predicate' in updatedData && { predicate: generateOptimisticSectionContent(updatedData.predicate) }),
                          ...('entities' in updatedData && { entities: updatedData.entities?.map((id) => generateOptimisticSectionContent(id)) }),
                          ...('predicates' in updatedData && {
                              predicates: updatedData.predicates?.map((id) => generateOptimisticSectionContent(id)),
                          }),
                      }
                    : section,
            ),
        };

        return mutateReviewOptimistic({
            updateFunction: () => updateReviewSection({ reviewId: review.id, sectionId, data: updatedData }),
            optimisticData: { ...review, ...sections },
        });
    };

    const deleteSection = (sectionId: string) => {
        if (!review) {
            return null;
        }
        const sections = review.sections.filter((s) => s.id !== sectionId);
        return mutateReviewOptimistic({
            updateFunction: () => deleteReviewSection({ reviewId: review.id, sectionId }),
            optimisticData: { ...review, ...sections },
        });
    };

    const [parsedReferences, setParsedReferences] = useState<{ parsedReference: any; referenceIndex: number; rawReference: string }[]>([]);
    useEffect(() => {
        const parse = async () => {
            const referencePromises = review?.references.map((reference) => Cite.async(reference).catch((e: unknown) => console.error(e))) ?? [];

            setParsedReferences(
                (await Promise.all(referencePromises)).map((parsedReference, index) => ({
                    parsedReference: parsedReference?.data?.[0] ?? {},
                    rawReference: review?.references[index] ?? '',
                    referenceIndex: index,
                })),
            );
        };
        parse();
    }, [review?.references]);

    const { onErrorRetry } = useSWRConfig();

    const { data: organization } = useSWR(
        review?.organizations?.[0] && review?.organizations?.[0] !== MISC.UNKNOWN_ID
            ? [review?.organizations?.[0], organizationsUrl, 'getOrganization']
            : null,
        ([params]) => getOrganization(params),
        {
            // since organizations and conferenceSeries share the same attribute (i.e., list?.organizations),
            // a 404 will be returned if either one of them is set. This prevent useSWR from retrying in case there is a 404
            // typing doesn't work nicely when overwriting this setting, see: https://github.com/vercel/swr/discussions/1574#discussioncomment-4982649
            onErrorRetry(err, key, config, revalidate, revalidateOpts) {
                const configForDelegate = config as Readonly<PublicConfiguration<Organization, unknown, (path: string) => unknown>>;
                if (err.status === 404) return;
                onErrorRetry(err, key, configForDelegate, revalidate, revalidateOpts);
            },
        },
    );

    const { data: observatory } = useSWR(
        review?.observatories?.[0] && review?.observatories?.[0] !== MISC.UNKNOWN_ID
            ? [review?.observatories?.[0], observatoriesUrl, 'getObservatoryById']
            : null,
        ([params]) => getObservatoryById(params),
    );

    return {
        review,
        isLoading,
        isValidating,
        error,
        mutate,
        observatory,
        organization,
        createSection,
        deleteSection,
        updateSection,
        parsedReferences,
        updateReview,
    };
};

export default useReview;
