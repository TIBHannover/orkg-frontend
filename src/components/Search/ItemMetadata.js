import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTags, faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons';
import pluralize from 'pluralize';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { MISC } from 'constants/graphSettings';

const ItemMetadata = ({ item, showClasses, showCreatedAt, showCreatedBy }) => (
    <div className="d-flex">
        <div className="flex-grow-1">
            {showCreatedAt && (
                <small className="d-inline-block me-2">
                    <Icon size="sm" icon={faCalendar} className="me-1" /> {moment(item.created_at).format('DD MMMM YYYY - H:mm')}
                </small>
            )}
            {item.shared > 0 && (
                <small className="d-inline-block me-2">
                    <span>
                        <Icon icon={faArrowRight} />
                    </span>
                    {` Referred: ${pluralize('time', item.shared, true)}`}
                </small>
            )}
            {showClasses && item.classes?.length > 0 && (
                <small className="d-inline-block me-2">
                    <span>
                        <Icon icon={faTags} /> {' Instance of: '}
                    </span>
                    {item.classes.join(', ')}
                </small>
            )}
            {showCreatedBy && item.created_by !== MISC.UNKNOWN_ID && (
                <small className="d-inline-block me-2">
                    <Icon icon={faUser} /> Created by{' '}
                    <span className="ms-1">
                        <UserAvatar size={24} userId={item.created_by} showDisplayName={true} />
                    </span>
                </small>
            )}
        </div>
        <div className="d-flex align-items-end">
            <InputGroup size="sm">
                <InputGroupText className="py-0">ID</InputGroupText>
                <Input
                    bsSize="sm"
                    className="text-muted py-0 bg-white"
                    length={item.id.length}
                    disabled
                    value={item.id}
                    style={{ width: 80, minHeight: 'initial', fontSize: '80%' }}
                    aria-label="ID"
                />
                <CopyToClipboard
                    text={item.id}
                    onCopy={() => {
                        toast.dismiss();
                        toast.success('ID copied to clipboard');
                    }}
                >
                    <Button className="py-0 border border-light-darker d-flex align-items-center" size="sm" color="light">
                        <Icon icon={faClipboard} color="#6c757d" size="xs" />
                    </Button>
                </CopyToClipboard>
            </InputGroup>
        </div>
    </div>
);

ItemMetadata.propTypes = {
    item: PropTypes.object.isRequired,
    showClasses: PropTypes.bool,
    showCreatedAt: PropTypes.bool,
    showCreatedBy: PropTypes.bool,
};

ItemMetadata.defaultProps = {
    showClasses: false,
    showCreatedAt: false,
    showCreatedBy: false,
};

export default ItemMetadata;
