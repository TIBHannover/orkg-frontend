import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import VisualizationPreview from 'components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';

const PreviewFactory = ({ id, classes }) => {
    const findClass = useCallback(classId => classes?.includes(classId), [classes]);

    if (findClass(CLASSES.VISUALIZATION)) {
        return <VisualizationPreview id={id} />;
    }
    return null;
};

PreviewFactory.propTypes = {
    id: PropTypes.string.isRequired,
    classes: PropTypes.array,
};

export default PreviewFactory;
