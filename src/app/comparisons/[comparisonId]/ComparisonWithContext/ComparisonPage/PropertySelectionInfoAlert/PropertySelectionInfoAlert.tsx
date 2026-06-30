import { Alert, CloseButton } from '@heroui/react';
import { useCookies } from 'next-client-cookies';

import useComparison from '@/components/Comparison/hooks/useComparison';
import useAuthentication from '@/components/hooks/useAuthentication';
import Container from '@/components/Ui/Structure/Container';

const COOKIE_NAME = 'isPropertySelectionInfoDismissed';

const PropertySelectionInfoAlert = () => {
    const cookies = useCookies();
    const { comparison, isEditMode, isPublished } = useComparison();
    const { user } = useAuthentication();

    const isCreator = !!user?.id && comparison?.created_by === user.id;

    if (!isEditMode || isPublished || !isCreator || cookies.get(COOKIE_NAME)) {
        return null;
    }

    const onDismiss = () => {
        cookies.set(COOKIE_NAME, 'true', { expires: 30 });
    };

    return (
        <Container className="mb-4">
            <Alert status="accent" className="shadow">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>How property selection works</Alert.Title>
                    <Alert.Description>
                        Properties reflect the full path of nested resources across the comparison sources, up to 10 levels deep. Any property found
                        in only one source is hidden by default, click <strong>Manage properties</strong> below to show it manually.
                    </Alert.Description>
                </Alert.Content>
                <CloseButton aria-label="Dismiss property selection info" onPress={onDismiss} />
            </Alert>
        </Container>
    );
};

export default PropertySelectionInfoAlert;
