import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import useComparison from '@/components/Comparison/hooks/useComparison';
import ROUTES from '@/constants/routes';
import { publishComparison } from '@/services/backend/comparisons';
import { getErrorMessage } from '@/utils';

function usePublish() {
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { comparison } = useComparison();
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
        comparison.sources?.length > 1;

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
            toast.error(`Error publishing a comparison : ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
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
