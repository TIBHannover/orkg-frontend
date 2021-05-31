import { Alert } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const NewerVersionWarning = props => {
    const { versions, isLoading } = useComparisonVersions({ comparisonId: props.comparisonId });

    return (
        <Alert color="warning" className="container">
            Warning: a newer version of this comparison is available.{' '}
            {isLoading && (
                <>
                    <Icon icon={faSpinner} spin={!isLoading} /> Checking last version
                </>
            )}
            {!isLoading && versions?.length > 0 && (
                <>
                    <Link to={reverse(ROUTES.COMPARISON, { comparisonId: versions[0].id })}>View latest version</Link>
                </>
            )}
        </Alert>
    );
};

NewerVersionWarning.propTypes = {
    nextVersions: PropTypes.array.isRequired,
    comparisonId: PropTypes.string
};

export default NewerVersionWarning;
