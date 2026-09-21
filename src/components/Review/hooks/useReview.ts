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
    UpdateAuthor,
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
                    await errorHandler({ error: e, shouldShowToast: true });
                }
                return optimisticData;
            },
            {
                optimisticData,
                rollbackOnError: true,
                throwOnError: false,
            },
        );

    // authors come from edit forms, which produce explicit null ids the representation type forbids
    const updateReview = (updatedData: Partial<Omit<Review, 'authors'>> & { authors?: UpdateAuthor[] }) => {
        if (!review) {
            return null;
        }
        return mutateReviewOptimistic({
            updateFunction: () =>
                updateReviewBackend(review.id, {
                    ...(updatedData.researchFields &&
                        updatedData.researchFields.length > 0 && { researchFields: updatedData.researchFields.map((rf) => rf.id) }),
                    ...(updatedData.sdgs && updatedData.sdgs.length > 0 && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                    ...(updatedData.sections &&
                        updatedData.sections.length > 0 && {
                            // each section must carry its variant's full field set — the request
                            // unions dispatch structurally, and an incomplete payload serializes as {}
                            sections: updatedData.sections.map((section): UpdateSectionPayload => {
                                switch (section.type) {
                                    case 'text':
                                        // the representation exposes the class in `classes`, the request expects `_class`
                                        return { heading: section.heading, text: section.text ?? '', _class: section.classes?.[0] ?? null };
                                    case 'ontology':
                                        return {
                                            heading: section.heading,
                                            entities: section.entities?.map((entity) => entity.id).filter((id): id is string => !!id) ?? [],
                                            predicates: section.predicates?.map((predicate) => predicate.id) ?? [],
                                        };
                                    case 'comparison':
                                        return { heading: section.heading, comparison: section.comparison?.id ?? null };
                                    case 'visualization':
                                        return { heading: section.heading, visualization: section.visualization?.id ?? null };
                                    case 'resource':
                                        return { heading: section.heading, resource: section.resource?.id ?? null };
                                    case 'property':
                                        return { heading: section.heading, predicate: section.predicate?.id ?? null };
                                    default:
                                        return section satisfies never;
                                }
                            }),
                        }),
                    ...(({ researchFields, sdgs, sections, ...o }) => o)(updatedData),
                }),
            optimisticData: { ...review, ...updatedData } as Review,
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
                _class: null,
            },
        };
        const newSection = sectionContent[sectionType];

        const sections = [
            ...review.sections.slice(0, atIndex),
            { ...newSection, id: uniqueId(), type: sectionType },
            ...review.sections.slice(atIndex),
        ] as Review['sections'];

        return mutateReviewOptimistic({
            updateFunction: () => createReviewSection({ reviewId: review.id, index: atIndex, data: newSection }),
            optimisticData: { ...review, sections },
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

        const sections = review?.sections.map((section) =>
            section.id === sectionId
                ? {
                      ...section,
                      ...('heading' in updatedData && { heading: updatedData.heading }),
                      ...('text' in updatedData && { text: updatedData.text }),
                      // the request carries the class in `_class`, the representation in `classes`
                      ...('_class' in updatedData && { classes: updatedData._class ? [updatedData._class] : [] }),
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
        ) as Review['sections'];

        return mutateReviewOptimistic({
            updateFunction: () => updateReviewSection({ reviewId: review.id, sectionId, data: updatedData }),
            optimisticData: { ...review, sections },
        });
    };

    const deleteSection = (sectionId: string) => {
        if (!review) {
            return null;
        }
        const sections = review.sections.filter((s) => s.id !== sectionId);
        return mutateReviewOptimistic({
            updateFunction: () => deleteReviewSection({ reviewId: review.id, sectionId }),
            optimisticData: { ...review, sections },
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
