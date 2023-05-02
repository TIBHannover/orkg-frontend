import { faArrowRight, faCalendar, faTags, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import CopyId from 'components/CopyId/CopyId';
import ProvenanceBox from 'components/Resource/ProvenanceBox';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { MISC } from 'constants/graphSettings';
import moment from 'moment';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';

const ItemMetadata = ({ item, showClasses, showCreatedAt, showCreatedBy, showProvenance, editMode }) => (
    <div className="d-flex">
        <div className="flex-grow-1">
            {showCreatedAt && (
                <Badge color="light" className="me-2">
                    <Icon size="sm" icon={faCalendar} className="me-1" /> {moment(item.created_at).format('DD MMMM YYYY - H:mm')}
                </Badge>
            )}
            {item.shared > 0 && (
                <Badge color="light" className="me-2">
                    <span>
                        <Icon icon={faArrowRight} />
                    </span>
                    {` Referred ${pluralize('time', item.shared, true)}`}
                </Badge>
            )}
            {showClasses && item.classes?.length > 0 && (
                <Badge color="light" className="me-2">
                    <span>
                        <Icon icon={faTags} /> {' Instance of '}
                    </span>
                    {item.classes.join(', ')}
                </Badge>
            )}
            {showCreatedBy && item.created_by !== MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2">
                    <Icon icon={faUser} /> Created by{' '}
                    <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                        <UserAvatar size={20} userId={item.created_by} showDisplayName={true} />
                    </span>
                </Badge>
            )}
            {showProvenance && (
                <span className="d-inline-block">
                    <ProvenanceBox item={item} editMode={editMode} />
                </span>
            )}
        </div>
        {item.id && (
            <div className="d-flex align-items-end flex-shrink-0">
                <CopyId id={item.id} />
            </div>
        )}
    </div>
);

ItemMetadata.propTypes = {
    item: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
    showClasses: PropTypes.bool,
    showCreatedAt: PropTypes.bool,
    showCreatedBy: PropTypes.bool,
    showProvenance: PropTypes.bool,
};

ItemMetadata.defaultProps = {
    editMode: false,
    showClasses: false,
    showCreatedAt: false,
    showCreatedBy: false,
    showProvenance: false,
};

export default ItemMetadata;
