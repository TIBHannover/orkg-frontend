import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import CSVWTable from 'components/CSVWTable/CSVWTable';

const ItemPreviewFactory = ({ id, classes, children = null }) => {
    const findClass = useCallback(classId => classes?.includes(classId), [classes]);

    if (findClass(CLASSES.CSVW_TABLE)) {
        return <CSVWTable id={id} embedMode={true} />;
    }

    return children;
};

ItemPreviewFactory.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.node]),
    classes: PropTypes.array,
};

export default ItemPreviewFactory;
