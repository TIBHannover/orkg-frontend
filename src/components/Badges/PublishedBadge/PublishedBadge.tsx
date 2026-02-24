import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import Badge from '@/components/Ui/Badge/Badge';

const PublishedBadge = () => {
    return (
        <Badge color="light" className="me-2 mb-2">
            <FontAwesomeIcon icon={faBookOpen} /> Published
        </Badge>
    );
};

export default PublishedBadge;
