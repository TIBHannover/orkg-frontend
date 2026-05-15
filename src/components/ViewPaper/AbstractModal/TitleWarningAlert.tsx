import { Alert } from '@heroui/react';
import { useSelector } from 'react-redux';

import { RootStore } from '@/slices/types';

const TitleWarningAlert = () => {
    const fetchAbstractTitle = useSelector((state: RootStore) => state.viewPaper.fetchAbstractTitle);
    const isAbstractFailedFetching = useSelector((state: RootStore) => state.viewPaper.isAbstractFailedFetching);
    const abstract = useSelector((state: RootStore) => state.viewPaper.abstract);

    if (!abstract || !fetchAbstractTitle || isAbstractFailedFetching) {
        return null;
    }

    return (
        <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Abstract may not match this paper</Alert.Title>
                <Alert.Description>
                    The displayed abstract was automatically fetched based on the paper's title and is extracted from{' '}
                    <strong>{fetchAbstractTitle}</strong>. Please make sure the title above matches the paper you are viewing.
                </Alert.Description>
            </Alert.Content>
        </Alert>
    );
};

export default TitleWarningAlert;
