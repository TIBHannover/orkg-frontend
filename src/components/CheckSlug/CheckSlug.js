import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { slugify } from 'utils';

/**
 * Component to check if query param slug is valid, and makes a redirect if not
 */
const CheckSlug = ({ label = '', route }) => {
    const params = useParams();
    const prevLabel = usePrevious(label);
    const navigate = useNavigate();

    // also check if the label is updated, to ensure redirect is only performed when the label is loaded
    if (label && prevLabel !== label && params.slug !== slugify(label)) {
        navigate(reverse(route, { ...params, slug: slugify(label) }), { state: { status: 301 } });
    }

    return null;
};

CheckSlug.propTypes = {
    /** Original label of the resource */
    label: PropTypes.string,

    /** Route used for redirect */
    route: PropTypes.string.isRequired
};

export default CheckSlug;
