import Tippy from '@tippyjs/react';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

const DiffTitle = ({ id, versions }) => {
    const version = versions.find(version => version.id === id);

    if (!version) {
        return null;
    }

    const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY - H:m:s') : null;

    return (
        <div className="d-flex justify-content-between align-items-center">
            <Tippy content={`Update message: ${version.description}`}>
                <span className="d-flex align-items-center">
                    Version {versionNumber} - {publicationDate}
                    <span className="ml-2">
                        <UserAvatar userId={version.creator} />
                    </span>
                </span>
            </Tippy>{' '}
            <Button color="light" size="sm" tag={Link} to={reverse(ROUTES.SMART_ARTICLE, { id })}>
                View article
            </Button>
        </div>
    );
};

DiffTitle.propTypes = {
    id: PropTypes.string.isRequired,
    versions: PropTypes.array.isRequired
};

export default DiffTitle;
