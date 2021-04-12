import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';

const AuthorsList = ({ authors }) => {
    return (
        <>
            {authors.length === 0 && <span className="text-muted mr-2">No authors added yet</span>}
            {authors.map((author, index) =>
                author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
                    <Link key={index} to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} target="_blank">
                        <Badge color="light" className="mr-2 mb-2" key={index}>
                            <Icon icon={faUser} className="text-primary" /> {author.label}
                        </Badge>
                    </Link>
                ) : (
                    <Badge color="light" className="mr-2 mb-2" key={index}>
                        <Icon icon={faUser} className="text-secondary" /> {author.label}
                    </Badge>
                )
            )}
        </>
    );
};

AuthorsList.propTypes = {
    authors: PropTypes.array.isRequired
};

export default AuthorsList;
