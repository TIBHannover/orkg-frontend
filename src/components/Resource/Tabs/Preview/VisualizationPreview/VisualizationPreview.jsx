import { toast } from '@heroui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Alert from '@/components/Ui/Alert/Alert';
import THING_TYPES from '@/constants/thingTypes';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getThing } from '@/services/simcomp';

function VisualizationPreview({ id, height = '500px', width = '100%', className = 'p-3' }) {
    const [visualizationModelForGDC, setVisualizationModelForGDC] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: id })
            .then((model) => {
                setIsLoading(false);
                setIsLoadingFailed(false);
                setVisualizationModelForGDC(model);
            })
            .catch(() => {
                setIsLoading(false);
                setIsLoadingFailed(true);
                setVisualizationModelForGDC(undefined);
                toast.danger('Error loading visualization preview');
            });
    }, [id]);

    return (
        <div>
            {isLoading && 'Loading...'}
            {!isLoading && !isLoadingFailed && visualizationModelForGDC && (
                <div className={className}>
                    <GDCVisualizationRenderer height={height} width={width} model={visualizationModelForGDC} />
                </div>
            )}
            {!isLoading && isLoadingFailed && (
                <div className={className}>
                    <Alert color="warning">Error loading visualization preview</Alert>
                </div>
            )}
        </div>
    );
}

VisualizationPreview.propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
};

export default VisualizationPreview;
