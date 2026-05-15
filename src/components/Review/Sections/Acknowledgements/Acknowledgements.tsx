import { Alert } from '@heroui/react';

import Contributors from '@/components/Contributors/Contributors';
import useReview from '@/components/Review/hooks/useReview';

const Acknowledgements = () => {
    const { review } = useReview();

    if (!review) {
        return null;
    }

    const contributors = Object.entries(review.acknowledgements).map(([id, amount]) => ({ id, percentage: Math.floor(amount * 100) }));

    return (
        <>
            <Contributors contributors={contributors} />

            <Alert className="!bg-secondary-200 dark:!bg-secondary-700/50" status="accent">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>About this review</Alert.Title>
                    <Alert.Description>
                        This review article was created using{' '}
                        <a href="https://doi.org/10.1145/3360901.3364435" target="_blank" rel="noopener noreferrer">
                            The Open Research Knowledge Graph
                        </a>{' '}
                        and the{' '}
                        <a href="https://arxiv.org/abs/2111.15342" target="_blank" rel="noreferrer">
                            SmartReview methodology
                        </a>
                        .
                    </Alert.Description>
                </Alert.Content>
            </Alert>
        </>
    );
};

export default Acknowledgements;
