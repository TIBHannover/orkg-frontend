import { uniqueId } from 'lodash';
import useSWR from 'swr';

import useComparison from '@/components/Comparison/hooks/useComparison';
import errorHandler from '@/helpers/errorHandler';
import {
    comparisonUrl,
    createComparisonRelatedResource,
    deleteComparisonRelatedResource,
    getComparisonRelatedResource,
    updateComparisonRelatedResource,
} from '@/services/backend/comparisons';
import { ComparisonRelatedResource } from '@/services/backend/types';

const useRelatedResources = () => {
    const { comparison, mutate } = useComparison();

    const {
        data: relatedResources,
        mutate: mutateRelatedResources,
        isLoading: isLoadingRelatedResources,
    } = useSWR(
        [
            comparison?.related_resources && comparison?.related_resources.length > 0 ? comparison?.related_resources.map(({ id: _id }) => _id) : [],
            comparisonUrl,
            'getComparisonRelatedResource',
        ],
        ([relatedResourceIds]) => {
            return Promise.all(
                relatedResourceIds.map((relatedResourceId) => getComparisonRelatedResource({ comparisonId: comparison!.id, relatedResourceId })),
            );
        },
    );

    const updateRelatedResource = (relatedResourceId: string, updatedData: Partial<ComparisonRelatedResource>) => {
        if (!comparison || !relatedResources) {
            return null;
        }
        const newData = relatedResources.map((resource) => (resource.id === relatedResourceId ? { ...resource, ...updatedData } : resource));

        return mutateRelatedResources(
            async () => {
                try {
                    await updateComparisonRelatedResource({
                        comparisonId: comparison.id,
                        relatedResourceId,
                        data: updatedData,
                    });
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                }
                return newData;
            },
            {
                optimisticData: newData,
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const createRelatedResource = (data: Partial<ComparisonRelatedResource>) => {
        if (!comparison) {
            return null;
        }

        return mutateRelatedResources(
            async () => {
                let _id = '';
                try {
                    _id = await createComparisonRelatedResource({
                        comparisonId: comparison.id,
                        data,
                    });
                    mutate(() => ({
                        ...comparison,
                        related_resources: [
                            ...comparison.related_resources,
                            {
                                id: _id,
                                label: data.label ?? '',
                            },
                        ],
                    }));
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                }
                return [
                    ...(relatedResources ?? []),
                    { created_at: '', created_by: '', description: '', image: '', label: '', url: '', id: _id, ...data },
                ];
            },
            {
                optimisticData: [
                    ...(relatedResources ?? []),
                    { created_at: '', created_by: '', description: '', image: '', label: '', url: '', id: uniqueId(), ...data },
                ],
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const deleteRelatedResource = (relatedResourceId: string) => {
        if (!comparison) {
            return null;
        }
        return mutate(
            async () => {
                try {
                    await deleteComparisonRelatedResource({
                        comparisonId: comparison.id,
                        relatedResourceId,
                    });
                    mutateRelatedResources();
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                    console.error(e);
                }
                return {
                    ...comparison,
                    related_resources: comparison.related_resources.filter((relatedResource) => relatedResource.id !== relatedResourceId),
                };
            },
            {
                optimisticData: {
                    ...comparison,
                    related_resources: comparison.related_resources.filter((relatedResource) => relatedResource.id !== relatedResourceId),
                },
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    return {
        relatedResources,
        isLoadingRelatedResources,
        updateRelatedResource,
        createRelatedResource,
        deleteRelatedResource,
    };
};

export default useRelatedResources;
