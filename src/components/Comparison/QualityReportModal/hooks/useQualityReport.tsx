import dayjs from 'dayjs';
import { flattenDeep, isEmpty, reject, values } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { getPropertyObjectFromData } from '@/components/Comparison/hooks/helpers';
import useComparison from '@/components/Comparison/hooks/useComparison';
import FEEDBACK_QUESTIONS from '@/components/Comparison/QualityReportModal/hooks/feedbackQuestions';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { getStatementsBySubjectAndPredicate } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';
import { getThing } from '@/services/simcomp';

type Property = {
    id: string;
    label: string;
    n_contributions: number;
    active: boolean;
    similar_predicates: string[];
    similar: string[];
};

type Suggestion = {
    title: string;
    info: string;
    solution: string;
    evaluation: string | ReactNode;
    performEvaluation?: () => void;
};

type Answers = {
    [question: string]: string;
};

type Feedback = {
    resourceId: string;
    data: {
        comparisonId: string;
        answers: Answers;
    };
};

const useQualityReport = () => {
    const [issueRecommendations, setIssueRecommendations] = useState<Suggestion[]>([]);
    const [passingRecommendations, setPassingRecommendations] = useState<Suggestion[]>([]);
    const [feedbacks, setFeedbacks] = useState<Answers[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { comparison } = useComparison();
    // @ts-expect-error awaiting migration
    const properties = useSelector((state) => state.comparison.properties);
    // @ts-expect-error awaiting migration
    const data = useSelector((state) => state.comparison.data);

    const performQualityEvaluation = useCallback(async () => {
        try {
            if (!comparison) {
                return;
            }
            setIsLoading(true);
            // get the feedbacks from all different comparison versions
            const feedbackStatementsPromises =
                comparison.versions.published.map((version) =>
                    getStatementsBySubjectAndPredicate({ subjectId: version.id, predicateId: PREDICATES.QUALITY_FEEDBACK }),
                ) ?? [];

            const feedbackIds = (await Promise.all(feedbackStatementsPromises)).flatMap((feedbackStatements) =>
                feedbackStatements.map((feedback) => feedback.object.id),
            );

            const feedbackDataPromises = feedbackIds.map(
                // @ts-expect-error getThing awaiting migration
                (feedbackId) => getThing({ thingType: THING_TYPES.QUALITY_REVIEW, thingKey: feedbackId }) as Promise<Feedback>,
            );
            const _feedbacks = (await Promise.all(feedbackDataPromises)).map((feedback) => feedback.data.answers) ?? [];

            setFeedbacks(_feedbacks);

            // suggestions
            const resourcesAndLiterals = reject(flattenDeep(values(data)), isEmpty);
            const activeProperties = properties
                .filter((property: Property) => property.active)
                .map((property: Property) => getPropertyObjectFromData(data, property));
            const descriptionPromises = activeProperties.map((property: Property) =>
                getStatementsBySubjectAndPredicate({ subjectId: property.id, predicateId: PREDICATES.DESCRIPTION }),
            );
            const propertiesWithoutDescription = (await Promise.all(descriptionPromises))
                .map((property: Statement[], index: number) => ({
                    id: activeProperties[index].id,
                    label: activeProperties[index].label,
                    description: property[0]?.object?.label ?? null,
                }))
                .filter((property: { id: string; label: string; description: string }) => !property.description);

            const qualityCriteria = [
                {
                    title: 'The comparison is published',
                    info: 'When a comparison is published, the current state of the comparison is stored. This means others will see the comparison exactly as you created it. This benefits the integrity of the comparison and makes it suitable for making references from research articles.',
                    solution: 'Click the Publish comparison button.',
                    performEvaluation: () => {
                        const passing = comparison.versions.published.length > 0;
                        return {
                            passing,
                            evaluation: passing
                                ? `The comparison is last published on ${dayjs(comparison.versions.published?.[0]?.created_at)?.format(
                                      'DD-MM-YYYY',
                                  )}.`
                                : 'The comparison is not yet published.',
                        };
                    },
                },
                {
                    title: 'All properties have a human-readable description',
                    info: 'To ensure properties are well understood by users, it is helpful to provide a human-readable description for each of them. Ensure the property description is generic and not specific to your comparison.',
                    solution:
                        'Click on the properties listed above, edit the property, add a "description" property (listed in the suggestions) and provide a value.',
                    performEvaluation: () => {
                        const passing = propertiesWithoutDescription.length === 0;
                        return {
                            passing,
                            evaluation: passing ? (
                                'All properties have a human-readable description.'
                            ) : (
                                <>
                                    The following properties do not have a description yet:
                                    <ul>
                                        {propertiesWithoutDescription.map((property: Property, index: number) => (
                                            <li key={index}>
                                                <Link href={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank">
                                                    {property.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ),
                        };
                    },
                },
                {
                    title: 'A DOI is assigned to the comparison',
                    info: 'A DOI is a persistent identifier and widely used within research communities. Additionally, DOIs can be used when citing a specific comparison.',
                    solution: 'Click the Publish comparison button and assign a DOI.',
                    performEvaluation: () => {
                        const passing = comparison.identifiers.doi && comparison.identifiers.doi?.length > 0;
                        return {
                            passing,
                            evaluation: passing
                                ? `The comparison is published with the following DOI ${comparison.identifiers.doi?.[0]}.`
                                : 'The comparison is not published with a DOI.',
                        };
                    },
                },
                {
                    title: 'Resources are linked to external ontologies',
                    info: 'When resources are linked to external ontologies, machines are better able to understand the data. ORKG has built in Wikidata support but other sources/ontologies can be used as well.',
                    solution:
                        'Visit the resources in your comparison and add a "same as" relation to external ontologies. Alternatively, you can replace resources by selecting their Wikidata counterparts instead.',
                    performEvaluation: () => {
                        const passing = !!properties
                            .map((property: Property) => getPropertyObjectFromData(data, property))
                            .find((property: Property) => property.id === PREDICATES.SAME_AS);
                        return {
                            passing,
                            evaluation: passing
                                ? "The 'same as' property is used, which means that resources are linked to external ontologies."
                                : "The 'same as' is not used, which means resources are not linked to external ontologies.",
                        };
                    },
                },
                {
                    title: 'The comparison description is sufficiently long',
                    info: 'Descriptive comparison descriptions help users to better understand the content and objective of the comparison. Although it is difficult to automatically determine the descriptiveness, we check the length of a description instead.',
                    solution: 'Republish your comparison and provide a longer description.',
                    performEvaluation: () => {
                        const MINIMAL_DESCRIPTION_LENGTH = 200;
                        const passing = comparison.description?.length > MINIMAL_DESCRIPTION_LENGTH;
                        return {
                            passing,
                            evaluation: passing
                                ? 'The comparison description is sufficiently long (more than 200 characters).'
                                : `The comparison description is ${comparison.description?.length} characters, while minimum recommended amount of characters is ${MINIMAL_DESCRIPTION_LENGTH}`,
                        };
                    },
                },
                {
                    title: 'Both literals and resources are used within the comparison',
                    info: 'Resources are helpful to ensure others can link to the concepts used within the comparison. Therefore, it makes sense to both have literals and resources within a comparison.',
                    solution:
                        'Edit the contributions and add resources instead of literals. Ensure the resource labels are short, making them more suitable to be reused.',
                    performEvaluation: () => {
                        const resources = resourcesAndLiterals.filter((entity) => entity._class === ENTITIES.RESOURCE);
                        const literals = resourcesAndLiterals.filter((entity) => entity._class === ENTITIES.LITERAL);
                        const passing = resources.length > 0 && literals.length > 0;
                        return {
                            passing,
                            evaluation: `The comparison consists of ${literals.length} literals and ${resources.length} resources.`,
                        };
                    },
                },
                {
                    title: 'Resource labels are concise',
                    info: 'Resource labels that are concise are more suitable to be reused. If a resource contains too much information (i.e., too specific), others cannot easily reuse the concept, since the description most likely does not fit their specific use case. Bad example: "Berlin is the capital of Germany". Instead, a separate resource "Berlin" should be created, which intern has a statement about it being the capital of Germany.',
                    solution: 'Update the resource labels in the contributions, or change the resources all together.',
                    performEvaluation: () => {
                        const MAX_LENGTH = 100;
                        const resources = resourcesAndLiterals.filter((entity) => entity._class === ENTITIES.RESOURCE);
                        const resourcesWithTooLongLabels = resources.filter((resource) => resource.label.length > MAX_LENGTH);
                        const passing = resourcesWithTooLongLabels.length === 0;
                        return {
                            passing,
                            evaluation: passing ? (
                                `All resources have a label with less than ${MAX_LENGTH} characters.`
                            ) : (
                                <>
                                    The following resource(s) have more than 100 characters:
                                    <ul>
                                        {resourcesWithTooLongLabels.map((resource, index) => (
                                            <li key={index}>
                                                <Link href={reverse(ROUTES.RESOURCE, { id: resource.resourceId })} target="_blank">
                                                    {resource.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ),
                        };
                    },
                },
                {
                    title: 'Visualizations are added to the comparison',
                    info: 'Visualizations are especially useful to visualize numeric data, for which tables are sometimes less suitable. Although visualizations can provide added value, they are not suitable for all types of data, and therefore not all comparison must have a visualization.',
                    solution:
                        'If the comparison is suitable to be visualized, click the "Visualize" button on top of a comparison, and create a visualization or related figures.',
                    performEvaluation: () => {
                        const visualizationAmount = comparison.visualizations?.length;
                        const figuresAmount = comparison.related_figures?.length;
                        const passing = visualizationAmount > 0 || figuresAmount > 0;

                        return {
                            passing,
                            evaluation: `The comparison has ${visualizationAmount + figuresAmount}  visualizations.`,
                        };
                    },
                },
                {
                    title: 'Other researchers provided feedback',
                    info: 'Other researcher can help evaluating the correctness and completeness of a comparison. Therefore, it makes sense to share the created comparison and ask other researchers for their opinions.',
                    solution: 'Click the "User feedback" tab above and invite researchers via the "Invite researchers" button.',
                    performEvaluation: () => {
                        const MINIMUM_FEEDBACKS = 3;
                        return {
                            passing: _feedbacks.length >= MINIMUM_FEEDBACKS,
                            evaluation: `The comparison has ${_feedbacks.length} feedback evaluations, a minimum of ${MINIMUM_FEEDBACKS} evaluations is recommended.`,
                        };
                    },
                },
            ];
            const suggestions = qualityCriteria.map(({ info, solution, title, performEvaluation }) => ({
                title,
                info,
                solution,
                ...performEvaluation(),
            }));

            setIssueRecommendations(suggestions.filter((suggestion) => !suggestion.passing));
            setPassingRecommendations(suggestions.filter((suggestion) => suggestion.passing));
            setIsLoading(false);
        } catch (e) {
            console.log(e);
            toast.error('Something went wrong while evaluating the comparison. Please try again later.');
        }
    }, [comparison, data, properties]);

    const recommendationsPercentage = useMemo(
        () => Math.round((passingRecommendations.length / (passingRecommendations.length + issueRecommendations.length)) * 100),
        [issueRecommendations.length, passingRecommendations.length],
    );

    const feedbacksPercentage = useMemo(
        () =>
            feedbacks.length > 0
                ? feedbacks.reduce((acc, questions) => {
                      const likertQuestions = Object.keys(questions).filter(
                          (questionId) => FEEDBACK_QUESTIONS.find((question) => question.id === parseInt(questionId, 10))?.input === 'likert',
                      );
                      return (
                          acc +
                          likertQuestions.reduce((acc2, questionId) => acc2 + ((parseInt(questions[questionId], 10) + 2) / 4) * 100, 0) /
                              likertQuestions.length
                      );
                  }, 0) / feedbacks.length
                : 0,
        [feedbacks],
    );

    useEffect(() => {
        performQualityEvaluation();
    }, [performQualityEvaluation]);

    return { recommendationsPercentage, issueRecommendations, passingRecommendations, feedbacks, feedbacksPercentage, isLoading };
};

export default useQualityReport;
