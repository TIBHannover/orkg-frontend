import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';

import { useComparisonAiReview } from '@/components/Comparison/ComparisonTable/AiReview/ComparisonAiReviewProvider';

const AiReviewAlert = () => {
    const { pendingCount, totalCount, acceptAll } = useComparisonAiReview();

    if (totalCount === 0) {
        return null;
    }

    return (
        <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Items marked with an exclamation mark are AI generated and need your review</Alert.Title>
            </Alert.Content>
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted whitespace-nowrap">
                    {pendingCount}/{totalCount} items pending
                </span>
                <Button size="sm" variant="primary" isDisabled={pendingCount === 0} onPress={() => acceptAll()}>
                    <FontAwesomeIcon icon={faCheck} />
                    Accept all
                </Button>
            </div>
        </Alert>
    );
};

export default AiReviewAlert;
