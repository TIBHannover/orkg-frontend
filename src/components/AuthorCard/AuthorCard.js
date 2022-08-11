import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { isString } from 'lodash';
import PropTypes from 'prop-types';

function AuthorCard(props) {
    return (
        <div>
            <div className="d-flex">
                <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                    <div>
                        {!isString(props.author) && <Link to={reverse(ROUTES.AUTHOR_PAGE, { authorId: props.author.id })}>{props.author.label}</Link>}
                        {isString(props.author) && <>{props.author}</>}
                    </div>
                    {props.subTitle && (
                        <div>
                            <small className="text-muted">{props.subTitle}</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

AuthorCard.propTypes = {
    author: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    subTitle: PropTypes.string.isRequired,
};

export default AuthorCard;
