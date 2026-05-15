import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import React from 'react';

const PublishedBadge = () => {
    return (
        <Chip className="mr-2 mb-2">
            <FontAwesomeIcon icon={faBookOpen} />
            Published
        </Chip>
    );
};

export default PublishedBadge;
