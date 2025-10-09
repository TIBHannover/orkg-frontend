import { motion } from 'motion/react';
import { useQueryState } from 'nuqs';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';
import { comparisonUrl, getComparison, updateComparison } from '@/services/backend/comparisons';

const UpdateComparison = () => {
    const [comparisonId] = useQueryState('comparisonId', { defaultValue: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const { entityIds } = useEntities();
    const {
        data: comparison,
        error,
        isLoading,
        mutate,
    } = useSWR(comparisonId ? [comparisonId, comparisonUrl, 'getComparison'] : null, ([params]) => getComparison(params));

    const currentContributions = comparison?.contributions.map((contribution) => contribution.id) ?? [];
    const newContributions = entityIds?.filter((entity) => !currentContributions.includes(entity)) ?? [];

    if (isLoading || error || !comparison || newContributions.length === 0) {
        return null;
    }

    const handleUpdateComparison = async () => {
        setIsUpdating(true);
        try {
            await updateComparison(comparison.id, {
                contributions: [...currentContributions, ...newContributions],
                config: {
                    ...comparison.config,
                    contributions: [...comparison.config.contributions, ...newContributions],
                },
            });
            mutate();
        } catch (e) {
            toast.error('Error updating comparison');
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
            <Container className="tw:px-4 tw:my-2">
                <Alert color="warning" className="tw:my-2 tw:px-4 tw:md:flex tw:items-center">
                    <p className="tw:!m-0">
                        You are editing the comparison <strong>{comparison.title}</strong>. Some of the contributions you selected are not part of
                        this comparison. To include them, click the button below.
                    </p>
                    <div className="tw:shrink-0 tw:grow-0 tw:flex tw:justify-center">
                        <ButtonWithLoading
                            color="primary"
                            size="sm"
                            onClick={handleUpdateComparison}
                            isLoading={isUpdating}
                            loadingMessage="Updating comparison"
                        >
                            Update comparison
                        </ButtonWithLoading>
                    </div>
                </Alert>
            </Container>
        </motion.div>
    );
};

export default UpdateComparison;
