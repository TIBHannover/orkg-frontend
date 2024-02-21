import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Author } from 'services/backend/types';

type AuthorsProps = {
    authors: Author[];
    maxAuthors?: number;
};

const Authors: FC<AuthorsProps> = ({ authors, maxAuthors = 5 }) =>
    authors?.length > 0 && (
        <>
            <Icon size="sm" icon={faUser} />{' '}
            {authors
                .slice(0, maxAuthors)
                .map(a => a.name)
                .join(', ')}
            {authors.length > maxAuthors && ' et al.'}
        </>
    );

export default Authors;
