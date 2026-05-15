import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip } from '@heroui/react';
import Link from 'next/link';
import { FC, useState } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Author } from '@/services/backend/types';

const AUTHOR_LIMIT = 15;

type AuthorBadgesProps = {
    authors: Author[];
};

const AuthorBadges: FC<AuthorBadgesProps> = ({ authors }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const authorsLimited = isExpanded ? authors : authors.slice(0, AUTHOR_LIMIT);

    return (
        <>
            {authorsLimited.map((author, index) =>
                author.id ? (
                    <Link
                        key={index}
                        href={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                        target="_blank"
                        rel="author"
                        aria-label={`Visit the author page of ${author.name}`}
                    >
                        <Chip color="default" className="mr-2 mb-2">
                            <FontAwesomeIcon icon={faUser} className="text-accent" /> {author.name}
                        </Chip>
                    </Link>
                ) : (
                    <Link
                        key={index}
                        href={reverse(ROUTES.AUTHOR_LITERAL, { authorString: author.name })}
                        target="_blank"
                        rel="author"
                        aria-label={`Visit the author page of ${author.name}`}
                    >
                        <Chip color="default" className="mr-2 mb-2">
                            <FontAwesomeIcon icon={faUser} aria-label="Author name" /> {author.name}
                        </Chip>
                    </Link>
                ),
            )}
            {authors.length > AUTHOR_LIMIT && (
                <Button size="sm" variant="secondary" className="py-0" onPress={() => setIsExpanded((v) => !v)}>
                    {isExpanded ? 'Show less' : `Show ${authors.length - AUTHOR_LIMIT} more`}
                </Button>
            )}
        </>
    );
};

export default AuthorBadges;
