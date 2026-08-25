import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

import { Author } from '@/services/backend/types';

type AuthorsProps = {
    authors?: Author[];
    maxAuthors?: number;
};

/** Author list as a single `MetadataRow` item: the first `maxAuthors` names, the rest folded into "et al." */
const Authors: FC<AuthorsProps> = ({ authors = [], maxAuthors = 5 }) => {
    if (!authors || authors.length === 0) {
        return null;
    }
    const names = authors.map((a) => a.name).join(', ');

    return (
        <span className="inline-flex min-w-0 items-center" title={names}>
            <FontAwesomeIcon size="sm" icon={faUser} className="me-1 text-muted" />
            <span className="sr-only">Authors </span>
            <span className="truncate">
                {authors
                    .slice(0, maxAuthors)
                    .map((a) => a.name)
                    .join(', ')}
                {authors.length > maxAuthors && ' et al.'}
            </span>
        </span>
    );
};

export default Authors;
