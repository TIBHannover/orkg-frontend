import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert } from 'reactstrap';

import THING_TYPES from '@/constants/thingTypes';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getThing } from '@/services/simcomp';

function VisualizationPreview({ id, height = '500px', width = '100%', className = 'p-3' }) {
    const [visualizationModelForGDC, setVisualizationModelForGDC] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);

    useEffect(() => {
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
                toast.error('Error loading visualization preview');
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
