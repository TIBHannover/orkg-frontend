import { reverse } from 'named-urls';
import { redirect } from 'next/navigation';
import PropTypes from 'prop-types';

import ROUTES from '@/constants/routes';

/**
 * Component to check if classes of the resource and the route are valid, and makes a redirect to resource page if not
 */
const ClassRedirect = ({ classes = [], targetClass, resourceId }) => {
    if (classes && !classes.includes(targetClass) && targetClass) {
        return redirect(`${reverse(ROUTES.RESOURCE, { id: resourceId })}?noRedirect`);
    }

    return null;
};

ClassRedirect.propTypes = {
    /** Classes of the resource */
    classes: PropTypes.array,
    targetClass: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
};

export default ClassRedirect;
