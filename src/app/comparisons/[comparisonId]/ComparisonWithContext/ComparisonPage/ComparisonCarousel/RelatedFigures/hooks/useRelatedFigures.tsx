import { CreateComparisonRelatedFigureRequest } from '@orkg/orkg-client';
import { uniqueId } from 'lodash';
import useSWR from 'swr';

import useComparison from '@/components/Comparison/hooks/useComparison';
import errorHandler from '@/helpers/errorHandler';
import {
    comparisonUrl,
    createComparisonRelatedFigure,
    deleteComparisonRelatedFigure,
    getComparisonRelatedFigure,
    updateComparisonRelatedFigure,
} from '@/services/backend/comparisons';
import { ComparisonRelatedFigure } from '@/services/backend/types';

const useRelatedFigures = () => {
    const { comparison, mutate } = useComparison();
    const {
        data: relatedFigures,
        mutate: mutateRelatedFigures,
        isLoading: isLoadingRelatedFigures,
    } = useSWR(
        [
            comparison?.relatedFigures && comparison?.relatedFigures.length > 0 ? comparison?.relatedFigures.map(({ id: _id }) => _id) : [],
            comparisonUrl,
            'getComparisonRelatedFigure',
        ],
        ([relatedFigureIds]) => {
            return Promise.all(
                relatedFigureIds.map((relatedFigureId) => getComparisonRelatedFigure({ comparisonId: comparison!.id, relatedFigureId })),
            );
        },
    );

    const updateRelatedFigure = (relatedFigureId: string, updatedData: Partial<ComparisonRelatedFigure>) => {
        if (!comparison || !relatedFigures) {
            return null;
        }
        const newData = relatedFigures.map((figure) => (figure.id === relatedFigureId ? { ...figure, ...updatedData } : figure));

        return mutateRelatedFigures(
            async () => {
                try {
                    await updateComparisonRelatedFigure({
                        comparisonId: comparison.id,
                        relatedFigureId,
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

    const createRelatedFigure = (data: CreateComparisonRelatedFigureRequest) => {
        if (!comparison) {
            return null;
        }

        return mutateRelatedFigures(
            async () => {
                let _id = '';
                try {
                    _id = await createComparisonRelatedFigure({
                        comparisonId: comparison.id,
                        data,
                    });
                    mutate(() => ({
                        ...comparison,
                        relatedFigures: [
                            ...comparison.relatedFigures,
                            {
                                id: _id,
                                label: data.label ?? '',
                            },
                        ],
                    }));
                } catch (e: unknown) {
                    await errorHandler({ error: e, shouldShowToast: true });
                    console.error(e);
                }
                return [...(relatedFigures ?? []), { createdAt: '', createdBy: '', description: '', image: '', id: _id, ...data }];
            },
            {
                optimisticData: [...(relatedFigures ?? []), { createdAt: '', createdBy: '', description: '', image: '', id: uniqueId(), ...data }],
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const deleteRelatedFigure = (relatedFigureId: string) => {
        if (!comparison) {
            return null;
        }
        return mutate(
            async () => {
                try {
                    await deleteComparisonRelatedFigure({
                        comparisonId: comparison.id,
                        relatedFigureId,
                    });
                    mutateRelatedFigures();
                } catch (e: unknown) {
                    await errorHandler({ error: e, shouldShowToast: true });
                    console.error(e);
                }
                return {
                    ...comparison,
                    relatedFigures: comparison.relatedFigures.filter((relatedFigure) => relatedFigure.id !== relatedFigureId),
                };
            },
            {
                optimisticData: {
                    ...comparison,
                    relatedFigures: comparison.relatedFigures.filter((relatedFigure) => relatedFigure.id !== relatedFigureId),
                },
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    return {
        relatedFigures,
        isLoadingRelatedFigures,
        updateRelatedFigure,
        createRelatedFigure,
        deleteRelatedFigure,
    };
};

export default useRelatedFigures;
