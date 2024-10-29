import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import VisualizationPreview from 'components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
import DataBrowser from 'components/DataBrowser/DataBrowser';

const PreviewFactory = ({ id, classes }) => {
    const findClass = useCallback((classId) => classes?.includes(classId), [classes]);

    if (findClass(CLASSES.VISUALIZATION)) {
        return <VisualizationPreview id={id} />;
    }
    if (findClass(CLASSES.CSVW_TABLE)) {
        return (
            <div className="p-4">
                <DataBrowser id={id} showHeader={false} editMode={false} />
            </div>
        );
    }
    return null;
};

PreviewFactory.propTypes = {
    id: PropTypes.string.isRequired,
    classes: PropTypes.array,
};

export default PreviewFactory;
