import { toast } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { clearIncorrectStatementIds } from '@/components/Comparison/ComparisonTable/AiReview/incorrectStatementsStorage';
import useAiReviewSourceStatements from '@/components/Comparison/ComparisonTable/AiReview/useAiReviewSourceStatements';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { EXTRACTION_METHODS } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { publishComparison } from '@/services/backend/comparisons';
import { deleteStatementById, setStatementsExtractionMethod } from '@/services/backend/statements';
import { getErrorMessage } from '@/utils';

function usePublish() {
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { comparison } = useComparison();
    const { statements, unverifiedCount, rejectedStatementIds } = useAiReviewSourceStatements(comparison?.id);
    const hasUnverified = unverifiedCount > 0;
    const rejectedCount = rejectedStatementIds.length;
    const router = useRouter();

    const isPublishable =
        comparison &&
        comparison.title &&
        comparison.title.trim() !== '' &&
        comparison.description &&
        comparison.description.trim() !== '' &&
        comparison.research_fields?.[0]?.id &&
        comparison.authors?.length > 0 &&
        comparison.sources?.length > 1;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (hasUnverified) {
            toast.danger('All AI-generated values must be reviewed before publishing');
            return;
        }
        setIsLoading(true);
        try {
            if (
                comparison &&
                comparison.title &&
                comparison.title.trim() !== '' &&
                comparison.description &&
                comparison.description.trim() !== '' &&
                comparison.research_fields?.[0]?.id &&
                comparison.authors?.length > 0
            ) {
                // Remove the rejected statements first, so they are not part of the published version.
                await Promise.all(rejectedStatementIds.map((id) => deleteStatementById(id)));

                const publishedComparisonId = await publishComparison(comparison.id, {
                    subject: comparison.research_fields?.[0]?.label,
                    description: comparison.description,
                    authors: comparison.authors,
                    assign_doi: shouldAssignDoi,
                });

                // Mark the remaining AI-generated statements as manually reviewed so the warning icon
                // no longer appears for this comparison.
                const remainingAiStatements = (statements ?? []).filter(
                    (statement) => !rejectedStatementIds.includes(statement.id) && statement.extraction_method === EXTRACTION_METHODS.AI_GENERATED,
                );
                await setStatementsExtractionMethod(
                    remainingAiStatements.map((statement) => statement.id),
                    EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW,
                );

                clearIncorrectStatementIds(comparison.id);

                sendEvent({ category: 'data-entry', action: 'publish-comparison' });
                toast.success('Comparison published successfully');
                setIsLoading(false);
                router.push(reverse(ROUTES.COMPARISON, { comparisonId: publishedComparisonId }));
            } else {
                throw Error('Please enter a title, description, research field, and creator(s)');
            }
        } catch (error: unknown) {
            console.error(error);
            toast.danger(`Error publishing a comparison : ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        handleSubmit,
        shouldAssignDoi,
        setShouldAssignDoi,
        isPublishable,
        hasUnverified,
        unverifiedCount,
        rejectedCount,
    };
}
export default usePublish;
