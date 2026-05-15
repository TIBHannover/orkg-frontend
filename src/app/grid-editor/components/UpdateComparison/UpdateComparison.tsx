import { Alert, toast } from '@heroui/react';
import { motion } from 'motion/react';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Container from '@/components/Ui/Structure/Container';
import { updateComparison } from '@/services/backend/comparisons';

const UpdateComparison = () => {
    const [comparisonId] = useQueryState('comparisonId', { defaultValue: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const { entityIds } = useEntities();
    const { comparison, isLoading, error, mutate, mutateComparisonContents } = useComparison(comparisonId);

    const currentContributions = comparison?.sources.map((source) => source.id) ?? [];
    const newContributions = entityIds?.filter((entity) => !currentContributions.includes(entity)) ?? [];

    if (isLoading || error || !comparison || newContributions.length === 0) {
        return null;
    }

    const handleUpdateComparison = async () => {
        setIsUpdating(true);
        try {
            await updateComparison(comparison.id, {
                sources: [...comparison.sources, ...newContributions.map((id) => ({ id, type: 'THING' as const }))],
            });
            toast.success('Comparison updated successfully');
            mutate();
            mutateComparisonContents();
        } catch (e) {
            toast.danger('Error updating comparison');
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
        >
            <Container className="my-2">
                <Alert status="warning" className="my-2">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            You are editing the comparison <strong>{comparison.title}</strong>. Some of the contributions you selected are not part of
                            this comparison. To include them, use the button on the right.
                        </Alert.Description>
                    </Alert.Content>
                    <ButtonWithLoading
                        variant="primary"
                        size="sm"
                        onPress={handleUpdateComparison}
                        isLoading={isUpdating}
                        loadingMessage="Updating comparison"
                    >
                        Update comparison
                    </ButtonWithLoading>
                </Alert>
            </Container>
        </motion.div>
    );
};

export default UpdateComparison;
