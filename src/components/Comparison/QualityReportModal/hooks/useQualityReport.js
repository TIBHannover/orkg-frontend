import { getPropertyObjectFromData } from 'components/Comparison/hooks/helpers';
import REVIEW_QUESTIONS from 'components/Comparison/QualityReportModal/reviewQuestions';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import { flattenDeep, isEmpty, reject, values } from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResourceData } from 'services/similarity';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';

const useQualityReport = () => {
    const [issueRecommendations, setIssueRecommendations] = useState([]);
    const [passingRecommendations, setPassingRecommendations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const properties = useSelector(state => state.comparison.properties);
    const data = useSelector(state => state.comparison.data);
    const versions = useSelector(state => state.comparison.versions);

    const performQualityEvaluation = useCallback(async () => {
        try {
            setIsLoading(true);
            // get the reviews from all different comparison versions
            const reviewStatementsPromises = versions.map(version =>
                getStatementsBySubjectAndPredicate({ subjectId: version.id, predicateId: PREDICATES.HAS_QUALITY_REVIEW }),
            );
            const reviewDataPromises = (await Promise.all(reviewStatementsPromises)).reduce(
                (acc, _reviews) => [...acc, ..._reviews.map(review => getResourceData(review.object.id))],
                [],
            );

            const _reviews = (await Promise.all(reviewDataPromises)).map(review => review.data.answers) ?? [];

            setReviews(_reviews);

            // suggestions
            const resourcesAndLiterals = reject(flattenDeep(values(data)), isEmpty);
            const activeProperties = properties.filter(property => property.active).map(property => getPropertyObjectFromData(data, property));
            const descriptionPromises = activeProperties.map(property =>
                getStatementsBySubjectAndPredicate({ subjectId: property.id, predicateId: PREDICATES.DESCRIPTION }),
            );
            const propertiesWithoutDescription = (await Promise.all(descriptionPromises))
                .map((property, index) => ({
                    id: activeProperties[index].id,
                    label: activeProperties[index].label,
                    description: property[0]?.object?.label ?? null,
                }))
                .filter(property => !property.description);

            const qualityCriteria = [
                {
                    title: 'The comparison is published',
                    info: 'When a comparison is published, the current state of the comparison is stored. This means others will see the comparison exactly as you created it. This benefits the integrity of the comparison and makes it suitable for making references from research articles.',
                    solution: 'Click the Publish comparison button.',
                    performEvaluation: () => {
                        const passing = !!comparisonResource?.id;
                        return {
                            passing,
                            evaluation: passing
                                ? `The comparison is published on ${moment(comparisonResource?.created_at).format('DD-MM-YYYY')}.`
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
                            passing: false,
                            evaluation: passing ? (
                                'All properties have a human-readable description.'
                            ) : (
                                <>
                                    The following properties do not have a description yet:
                                    <ul>
                                        {propertiesWithoutDescription.map((property, index) => (
                                            <li key={index}>
                                                <Link to={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank">
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
                        const passing = !!comparisonResource?.doi;
                        return {
                            passing: false,
                            evaluation: passing
                                ? `The comparison is published with the following DOI ${comparisonResource?.doi}.`
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
                            .map(property => getPropertyObjectFromData(data, property))
                            .find(property => property.id === PREDICATES.SAME_AS);
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
                        const passing = comparisonResource?.description?.length > MINIMAL_DESCRIPTION_LENGTH;
                        return {
                            passing,
                            evaluation: passing
                                ? 'The comparison description is sufficiently long (more than 200 characters).'
                                : `The comparison description is ${comparisonResource?.description?.length} characters, while minimum recommended amount of characters is ${MINIMAL_DESCRIPTION_LENGTH}`,
                        };
                    },
                },
                {
                    title: 'Both literals and resources are used within the comparison',
                    info: 'Resources are helpful to ensure others can link to the concepts used within the comparison. Therefore, it makes sense to both have literals and resources within a comparison.',
                    solution:
                        'Edit the contributions and add resources instead of literals. Ensure the resource labels are short, making them more suitable to be reused.',
                    performEvaluation: () => {
                        const resources = resourcesAndLiterals.filter(entity => entity.type === ENTITIES.RESOURCE);
                        const literals = resourcesAndLiterals.filter(entity => entity.type === ENTITIES.LITERAL);
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
                        const resources = resourcesAndLiterals.filter(entity => entity.type === ENTITIES.RESOURCE);
                        const resourcesWithTooLongLabels = resources.filter(resource => resource.label.length > MAX_LENGTH);
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
                                                <Link to={reverse(ROUTES.RESOURCE, { id: resource.resourceId })} target="_blank">
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
                        'If the comparison is suitable to be visualized, click the "Visualize" button on top of a comparison, and create a visualization.',
                    performEvaluation: () => {
                        const visualizationAmount = comparisonResource?.visualizations?.length;
                        const passing = visualizationAmount > 0;
                        return {
                            passing,
                            evaluation: `The comparison has ${visualizationAmount} visualizations.`,
                        };
                    },
                },
                {
                    title: 'Other researchers provided reviews',
                    info: 'Other researcher can help evaluating the correctness and completeness of a comparison. Therefore, it makes sense to share the created comparison and ask other researchers for their opinions.',
                    solution: 'Click the "User reviews" tab above and invite researchers via the "Invite researchers" button.',
                    performEvaluation: () => {
                        const MINIMUM_REVIEWS = 3;
                        return {
                            passing: _reviews.length >= MINIMUM_REVIEWS,
                            evaluation: `The comparison has ${_reviews.length} reviews, a minimum of ${MINIMUM_REVIEWS} reviews is recommended.`,
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

            setIssueRecommendations(suggestions.filter(suggestion => !suggestion.passing));
            setPassingRecommendations(suggestions.filter(suggestion => suggestion.passing));
            setIsLoading(false);
        } catch (e) {
            console.log(e);
            toast.error('Something went wrong while evaluating the comparison. Please try again later.');
        }
    }, [
        comparisonResource?.created_at,
        comparisonResource?.description?.length,
        comparisonResource?.doi,
        comparisonResource?.id,
        comparisonResource?.visualizations?.length,
        data,
        properties,
        versions,
    ]);

    const recommendationsPercentage = useMemo(
        () => Math.round((passingRecommendations.length / (passingRecommendations.length + issueRecommendations.length)) * 100),
        [issueRecommendations.length, passingRecommendations.length],
    );

    const reviewsPercentage = useMemo(
        () =>
            reviews.length > 0
                ? reviews.reduce((acc, questions) => {
                      const likertQuestions = Object.keys(questions).filter(
                          questionId => REVIEW_QUESTIONS.find(question => question.id === parseInt(questionId, 10))?.input === 'likert',
                      );
                      return (
                          acc +
                          likertQuestions.reduce((acc2, questionId) => acc2 + ((parseInt(questions[questionId], 10) + 2) / 4) * 100, 0) /
                              likertQuestions.length
                      );
                  }, 0) / reviews.length
                : 0,
        [reviews],
    );

    useEffect(() => {
        performQualityEvaluation();
    }, [performQualityEvaluation]);

    return { recommendationsPercentage, issueRecommendations, passingRecommendations, reviews, reviewsPercentage, isLoading };
};

export default useQualityReport;
