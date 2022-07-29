import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import { ENTITIES } from 'constants/graphSettings';
import Video from 'components/ValuePlugins/Video/Video';
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
                        {props.metaData.authors &&
                            props.metaData.authors.length > 0 &&
                            (!props.provenance?.organization?.metadata?.is_double_blind ||
                                moment().format('YYYY-MM-DD') >= props.provenance?.organization?.metadata?.date) && (
                                <AuthorBadges authors={props.metaData.authors} />
                            )}
                    </div>
                    {props.metaData.doi && (
                        <div>
                            {props.metaData.doi && (
                                <div className="mb-1" style={{ lineHeight: 1.5 }}>
                                    <small>
                                        DOI:{' '}
                                        <a href={`https://doi.org/${props.metaData.doi}`} target="_blank" rel="noopener noreferrer">
                                            https://doi.org/{props.metaData.doi}
                                        </a>
                                    </small>
                                </div>
                            )}
                        </div>
                    )}
                    {props.metaData.video && (
                        <small className="d-flex mb-1">
                            <div className="me-2">Video: </div>
                            <Video options={{ inModal: true }} type={ENTITIES.LITERAL}>
                                {props.metaData.video.label}
                            </Video>
                        </small>
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
    authors: PropTypes.array,
    provenance: PropTypes.object,
};

export default ComparisonMetaData;
