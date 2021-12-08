import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';

const AuthorBadges = ({ authors }) => {
    return authors.map((author, index) =>
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
            <Badge color="light" className="me-2 mb-2" key={index} typeof="foaf:Person">
                <Icon icon={faUser} className="text-secondary" aria-label="Author name" /> {author.label}
            </Badge>
        )
    );
};

AuthorBadges.propTypes = {
    authors: PropTypes.array.isRequired
};

export default AuthorBadges;
