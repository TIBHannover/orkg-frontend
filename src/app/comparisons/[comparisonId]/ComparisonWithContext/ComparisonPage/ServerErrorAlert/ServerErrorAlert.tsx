import { Alert, Button } from '@heroui/react';

import useManagePropertiesModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/hooks/useManagePropertiesModal';
import useComparison from '@/components/Comparison/hooks/useComparison';

const ServerErrorAlert = () => {
    const { openManageProperties } = useManagePropertiesModal();
    const { isEditMode } = useComparison();

    return (
        <Alert status="danger" className="border-0 shadow">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Unable to connect to server</Alert.Title>
                <Alert.Description>
                    We are having trouble loading the comparison table. This can happen when too much data is being loaded.{' '}
                    {isEditMode ? (
                        <>Reducing the number of selected properties often helps.</>
                    ) : (
                        <>
                            Click <strong>Edit</strong> to reduce the number of selected properties.
                        </>
                    )}
                </Alert.Description>
            </Alert.Content>
            {isEditMode && (
                <Button size="sm" variant="secondary" onPress={openManageProperties}>
                    Manage properties
                </Button>
            )}
        </Alert>
    );
};

export default ServerErrorAlert;
