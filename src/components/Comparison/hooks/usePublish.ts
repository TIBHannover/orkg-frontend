import { useMatomo } from '@jonkoops/matomo-tracker-react';
import useComparison from 'components/Comparison/hooks/useComparison';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { publishComparison } from 'services/backend/comparisons';
import { getComparison } from 'services/simcomp';
import { getErrorMessage } from 'utils';

function usePublish() {
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // @ts-expect-error awaiting migration
    const predicatesList = useSelector((state) => state.comparison.configuration.predicatesList);
    const { comparison, updateComparison } = useComparison();
    const router = useRouter();
    const { trackEvent } = useMatomo();

    const isPublishable =
        comparison &&
        comparison.title &&
        comparison.title.trim() !== '' &&
        comparison.description &&
        comparison.description.trim() !== '' &&
        comparison.research_fields?.[0]?.id &&
        comparison.authors?.length > 0 &&
        comparison.config?.contributions?.length > 1;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
                const comparisonData = await getComparison({
                    contributionIds: comparison.config.contributions,
                    type: comparison.config.type,
                });
                await updateComparison({
                    data: comparisonData,
                    config: {
                        ...comparison.config,
                        predicates: predicatesList ?? [],
                    },
                });

                const publishedComparisonId = await publishComparison(comparison.id, {
                    subject: comparison.research_fields?.[0]?.label,
                    description: comparison.description,
                    authors: comparison.authors,
                    assign_doi: shouldAssignDoi,
                });

                trackEvent({ category: 'data-entry', action: 'publish-comparison' });
                toast.success('Comparison published successfully');
                setIsLoading(false);
                router.push(reverse(ROUTES.COMPARISON, { comparisonId: publishedComparisonId }));
            } else {
                throw Error('Please enter a title, description, research field, and creator(s)');
            }
        } catch (error: unknown) {
            console.error(error);
            // @ts-expect-error awaiting migration
            toast.error(`Error publishing a comparison : ${getErrorMessage(error)}`);
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        handleSubmit,
        shouldAssignDoi,
        setShouldAssignDoi,
        isPublishable,
    };
}
export default usePublish;
