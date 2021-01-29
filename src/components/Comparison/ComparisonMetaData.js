import { Badge, NavLink } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import moment from 'moment';

function ComparisonMetaData(props) {
    return (
        <div>
            {props.metaData.title ? (
                <>
                    {/*<PreviewComponent comparisonId={props.metaData.id} propagateClick={props.propagateClick} reloadingFlag={props.reloadingFlag} />*/}
                    {props.metaData.description && (
                        <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                            {props.metaData.description}
                        </div>
                    )}
                    <div>
                        {props.metaData.createdAt ? (
                            <span className="badge badge-lightblue mr-2">
                                <Icon icon={faCalendar} className="text-primary" />{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('MMMM') : ''}{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('YYYY') : ''}
                            </span>
                        ) : (
                            ''
                        )}

                        {props.authors && props.authors.length > 0 && (
                            <>
                                {props.authors.map((author, index) =>
                                    author.id && author.id !== '' && author.orcid && author.orcid !== '' ? (
                                        <Link className="p-0" to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} key={index}>
                                            <Badge color="lightblue" className="mr-2 mb-2">
                                                <Icon icon={faUser} className="text-primary" /> {author.label}
                                            </Badge>
                                        </Link>
                                    ) : author.orcid && author.orcid !== '' ? (
                                        <NavLink
                                            className="p-0"
                                            style={{ display: 'contents' }}
                                            href={'https://orcid.org/' + author.orcid}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            key={index}
                                        >
                                            <Badge color="lightblue" className="mr-2 mb-2">
                                                <Icon icon={faUser} className="text-primary" /> {author.label}
                                            </Badge>
                                        </NavLink>
                                    ) : (
                                        <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                                            <Icon icon={faUser} className="text-darkblue" /> {author.label}
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
    // reloadingFlag: PropTypes.bool,
    // propagateClick: PropTypes.func
};

export default ComparisonMetaData;
