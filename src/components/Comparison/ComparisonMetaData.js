import { Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import moment from 'moment';
import { CLASSES } from 'constants/graphSettings';

function ComparisonMetaData(props) {
    return (
        <div>
            {props.metaData.title ? (
                <>
                    {props.metaData.description && (
                        <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                            {props.metaData.description}
                        </div>
                    )}
                    <div>
                        {props.metaData.createdAt ? (
                            <span className="badge badge-light mr-2">
                                <Icon icon={faCalendar} className="text-primary" />{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('MMMM') : ''}{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('YYYY') : ''}
                            </span>
                        ) : (
                            ''
                        )}

                        {props.metaData.authors && props.metaData.authors.length > 0 && (
                            <>
                                {props.metaData.authors.map((author, index) =>
                                    author.classes.includes(CLASSES.AUTHOR) ? (
                                        <Link className="p-0" to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} key={index}>
                                            <Badge color="light" className="mr-2 mb-2">
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
                        )}
                    </div>
                    {props.metaData.doi && (
                        <div>
                            {props.metaData.doi && (
                                <div style={{ marginBottom: '20px', lineHeight: 1.5 }}>
                                    <small>
                                        DOI:{' '}
                                        <i>
                                            <ValuePlugins type="literal">{props.metaData.doi}</ValuePlugins>
                                        </i>
                                    </small>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <br />
            )}
        </div>
    );
}

ComparisonMetaData.propTypes = {
    metaData: PropTypes.object,
    authors: PropTypes.array
};

export default ComparisonMetaData;
