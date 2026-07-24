import { Alert, toast } from '@heroui/react';
import { FC } from 'react';
import useSWR from 'swr';

import THING_TYPES from '@/constants/thingTypes';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getThing, simCompServiceUrl } from '@/services/simcomp';

type VisualizationPreviewProps = {
    id: string;
    height?: string;
    width?: string;
    className?: string;
};

const VisualizationPreview: FC<VisualizationPreviewProps> = ({ id, height = '500px', width = '100%', className = 'p-3' }) => {
    // Shares a cache entry with the visualization card thumbnail, which fetches the same model
    const {
        data: visualizationModelForGDC,
        isLoading,
        error,
    } = useSWR(
        id ? [id, simCompServiceUrl, 'getThing-visualization'] : null,
        ([thingKey]) => getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey }),
        {
            shouldRetryOnError: false,
            onError: () => toast.danger('Error loading visualization preview'),
        },
    );

    return (
        <div>
            {isLoading && 'Loading...'}
            {!isLoading && !error && visualizationModelForGDC && (
                <div className={className}>
                    <GDCVisualizationRenderer height={height} width={width} model={visualizationModelForGDC} />
                </div>
            )}
            {!isLoading && error && (
                <div className={className}>
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Error loading visualization preview</Alert.Title>
                        </Alert.Content>
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default VisualizationPreview;
