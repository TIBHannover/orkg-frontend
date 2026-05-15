import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';

import useList from '@/components/List/hooks/useList';
import { LiteratureListSectionList } from '@/services/backend/types';

export default function ListEntryAmount() {
    const { list } = useList();

    const entryAmount = list?.sections
        .filter((section): section is LiteratureListSectionList => section.type === 'list')
        .map((section) => section.entries.length)
        .reduce((a, b) => a + b, 0);

    return (
        <Chip variant="soft" size="sm" className="mr-2 mb-2">
            <FontAwesomeIcon icon={faHashtag} className="text-muted" /> {entryAmount} list entries
        </Chip>
    );
}
