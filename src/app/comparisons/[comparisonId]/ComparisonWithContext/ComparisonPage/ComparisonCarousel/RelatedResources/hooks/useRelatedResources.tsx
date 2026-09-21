import { CreateComparisonRelatedResourceRequest } from '@orkg/orkg-client';
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
            comparison?.relatedResources && comparison?.relatedResources.length > 0 ? comparison?.relatedResources.map(({ id: _id }) => _id) : [],
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
                    await errorHandler({ error: e, shouldShowToast: true });
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

    const createRelatedResource = (data: CreateComparisonRelatedResourceRequest) => {
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
                        relatedResources: [
                            ...comparison.relatedResources,
                            {
                                id: _id,
                                label: data.label ?? '',
                            },
                        ],
                    }));
                } catch (e: unknown) {
                    await errorHandler({ error: e, shouldShowToast: true });
                }
                return [...(relatedResources ?? []), { createdAt: '', createdBy: '', description: '', image: '', url: '', id: _id, ...data }];
            },
            {
                optimisticData: [
                    ...(relatedResources ?? []),
                    { createdAt: '', createdBy: '', description: '', image: '', url: '', id: uniqueId(), ...data },
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
                    await errorHandler({ error: e, shouldShowToast: true });
                    console.error(e);
                }
                return {
                    ...comparison,
                    relatedResources: comparison.relatedResources.filter((relatedResource) => relatedResource.id !== relatedResourceId),
                };
            },
            {
                optimisticData: {
                    ...comparison,
                    relatedResources: comparison.relatedResources.filter((relatedResource) => relatedResource.id !== relatedResourceId),
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
