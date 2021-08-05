import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

const DiffTitle = ({ id, comparison }) => {
    if (!comparison) {
        return null;
    }
    const publicationDate = comparison ? moment(comparison.created_at).format('DD MMMM YYYY - H:m:s') : null;

    return (
        <div className="d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center">
                <span>Published on {publicationDate}</span>

                <span className="ml-2">
                    <UserAvatar userId={comparison.created_by} />
                </span>
            </span>{' '}
            <Button color="light" size="sm" tag={Link} to={reverse(ROUTES.COMPARISON, { comparisonId: id })}>
                View comparison
            </Button>
        </div>
    );
};

DiffTitle.propTypes = {
    id: PropTypes.string.isRequired,
    comparison: PropTypes.object.isRequired
};

export default DiffTitle;
