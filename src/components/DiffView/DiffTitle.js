import UserAvatar from 'components/UserAvatar/UserAvatar';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

const DiffTitle = ({ data }) => (
    <div className="d-flex justify-content-between align-items-center">
        <span className="d-flex align-items-center">
            {data.headerText}
            {data.creator && (
                <span className="ms-2">
                    <UserAvatar userId={data.creator} />
                </span>
            )}
        </span>{' '}
        <Button color="light" size="sm" tag={Link} to={data.route ?? ''}>
            {data.buttonText}
        </Button>
    </div>
);

DiffTitle.propTypes = {
    data: PropTypes.object.isRequired
};

export default DiffTitle;
