import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

/**
 * Component to check if classes of the resource and the route are valid, and makes a redirect to resource page if not
 */
const ClassRedirect = ({ classes = [], targetClass, resourceId }) => {
    if (classes && !classes.includes(targetClass) && targetClass) {
        return <Navigate to={{ pathname: reverse(ROUTES.RESOURCE, { id: resourceId }), state: { status: 301 } }} />;
    }

    return null;
};

ClassRedirect.propTypes = {
    /** Classes of the resource */
    classes: PropTypes.array,
    targetClass: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired
};

export default ClassRedirect;
