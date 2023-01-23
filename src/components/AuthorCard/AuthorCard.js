import { faFile, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { isString } from 'lodash';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?q=';

function AuthorCard({ author, paperAmount = null, papers = null, isVisibleGoogleScholar = false }) {
    return (
        <>
            <div>
                {!isString(author) && (
                    <Link to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} target="_blank">
                        {author.label}
                    </Link>
                )}
                {isString(author) && <span>{author}</span>}
            </div>
            <small>
                {isVisibleGoogleScholar && (
                    <span>
                        <a href={GOOGLE_SCHOLAR_URL + encodeURIComponent(isString(author) ? author : author.label)} target="_blank" rel="noreferrer">
                            <Icon icon={faGraduationCap} /> <span>Google Scholar</span>
                        </a>
                        <span className="px-1 text-muted">•</span>
                    </span>
                )}
                {paperAmount && (
                    <>
                        <span className="text-muted">{paperAmount}</span>
                    </>
                )}
                {papers &&
                    papers.map((paper, index) => (
                        <Fragment key={index}>
                            {' '}
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.paper_id })} target="_blank">
                                <Icon icon={faFile} />{' '}
                                <span className="text-primary">{moment.localeData().ordinal(paper.author_index + 1)} author</span>
                            </Link>
                            {papers.length < index && <span className="px-1 text-muted">•</span>}
                        </Fragment>
                    ))}
            </small>
        </>
    );
}

AuthorCard.propTypes = {
    author: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    paperAmount: PropTypes.string,
    papers: PropTypes.array,
    isVisibleGoogleScholar: PropTypes.bool,
};

export default AuthorCard;
