import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC, useState } from 'react';
import { Badge, Button } from 'reactstrap';
import { Author } from 'services/backend/types';

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
                        typeof="foaf:Person"
                        aria-label={`Visit the author page of ${author.name}`}
                    >
                        <Badge color="light" className="me-2 mb-2" key={index}>
                            <FontAwesomeIcon icon={faUser} className="text-primary" /> {author.name}
                        </Badge>
                    </Link>
                ) : (
                    <Link
                        key={index}
                        href={reverse(ROUTES.AUTHOR_LITERAL, { authorString: encodeURIComponent(author.name) })}
                        target="_blank"
                        rel="author"
                        typeof="foaf:Person"
                        aria-label={`Visit the author page of ${author.name}`}
                    >
                        <Badge color="light" className="me-2 mb-2" typeof="foaf:Person">
                            <FontAwesomeIcon icon={faUser} aria-label="Author name" /> {author.name}
                        </Badge>
                    </Link>
                ),
            )}
            {authors.length > AUTHOR_LIMIT && (
                <Button color="light" size="sm" className="py-0" onClick={() => setIsExpanded((v) => !v)}>
                    {isExpanded ? 'Show less' : `Show ${authors.length - AUTHOR_LIMIT} more`}
                </Button>
            )}
        </>
    );
};

export default AuthorBadges;
