import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';

const AUTHOR_LIMIT = 15;

const AuthorBadges = ({ authors }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const authorsLimited = isExpanded ? authors : authors.slice(0, AUTHOR_LIMIT);
    return (
        <>
            {authorsLimited.map((author, index) =>
                author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
                    <Link
                        key={index}
                        to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                        target="_blank"
                        rel="author"
                        typeof="foaf:Person"
                        aria-label={`Visit the author page of ${author.label}`}
                    >
                        <Badge color="light" className="me-2 mb-2" key={index}>
                            <Icon icon={faUser} className="text-primary" /> {author.label}
                        </Badge>
                    </Link>
                ) : (
                    <Link
                        key={index}
                        to={reverse(ROUTES.AUTHOR_LITERAL, { authorString: encodeURIComponent(author.label) })}
                        target="_blank"
                        rel="author"
                        typeof="foaf:Person"
                        aria-label={`Visit the author page of ${author.label}`}
                    >
                        <Badge color="light" className="me-2 mb-2" typeof="foaf:Person">
                            <Icon icon={faUser} aria-label="Author name" /> {author.label}
                        </Badge>
                    </Link>
                ),
            )}
            {authors.length > AUTHOR_LIMIT && (
                <Button color="light" size="sm" className="py-0" onClick={() => setIsExpanded(v => !v)}>
                    {isExpanded ? 'Show less' : `Show ${authors.length - AUTHOR_LIMIT} more`}
                </Button>
            )}
        </>
    );
};

AuthorBadges.propTypes = {
    authors: PropTypes.array.isRequired,
};

export default AuthorBadges;
