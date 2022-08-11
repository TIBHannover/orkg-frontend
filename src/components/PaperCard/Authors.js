import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const Authors = ({ authors, maxAuthors }) =>
    authors?.length > 0 && (
        <>
            <Icon size="sm" icon={faUser} />{' '}
            {authors
                .slice(0, maxAuthors)
                .map(a => a.label)
                .join(', ')}
            {authors.length > maxAuthors && ' et al.'}
        </>
    );

Authors.propTypes = {
    authors: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ),
    maxAuthors: PropTypes.number,
};

Authors.defaultProps = {
    maxAuthors: 5,
};

export default Authors;
