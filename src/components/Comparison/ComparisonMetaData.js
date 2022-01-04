import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import moment from 'moment';
import PropTypes from 'prop-types';

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
                            <span className="badge bg-light me-2">
                                <Icon icon={faCalendar} className="text-primary" />{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('MMMM') : ''}{' '}
                                {props.metaData.createdAt ? moment(props.metaData.createdAt).format('YYYY') : ''}
                            </span>
                        ) : (
                            ''
                        )}

                        {props.metaData.authors && props.metaData.authors.length > 0 && <AuthorBadges authors={props.metaData.authors} />}
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
