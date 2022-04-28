import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useSelector } from 'react-redux';
import { Badge } from 'reactstrap';

export default function ListEntryAmount() {
    const sections = useSelector(state => state.list.sections);

    const entryAmount = sections
        .filter(section => section.type === 'ListSection')
        .map(section => section.entries.length)
        .reduce((a, b) => a + b, 0);

    return (
        <Badge color="light" className="me-2 mb-2">
            <Icon icon={faHashtag} /> {entryAmount} list entries
        </Badge>
    );
}
