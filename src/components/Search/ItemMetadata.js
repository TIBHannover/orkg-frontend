import { useState } from 'react';
import { faArrowRight, faCalendar, faTags, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import CopyId from 'components/CopyId/CopyId';
import ProvenanceBox from 'components/Resource/ProvenanceBox';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import moment from 'moment';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Badge, Input } from 'reactstrap';
import { MISC } from 'constants/graphSettings';
import { updateResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { capitalize } from 'lodash';
import { EXTRACTION_METHODS } from 'constants/misc';

const ItemMetadata = ({ editMode = false, showClasses = false, showCreatedAt = false, showCreatedBy = false, showProvenance = false, item }) => {
    const [extractionMethod, setExtractionMethod] = useState(item?.extraction_method);

    const handleSave = async (selectedOption) => {
        setExtractionMethod(selectedOption);
        await updateResource(item.id, item?.label, item?.classes, selectedOption);
        toast.success('Resource extraction method updated successfully');
    };

    return (
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
                            <UserAvatar size={20} userId={item.created_by} showDisplayName />
                        </span>
                    </Badge>
                )}

                <Badge color="light" className="me-2">
                    <Icon icon={faSearch} /> Extraction:{' '}
                    {editMode ? (
                        <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                            <Input
                                bsSize="sm"
                                className="mb-3 py-0"
                                type="select"
                                value={extractionMethod}
                                onChange={(e) => handleSave(e.target.value)}
                            >
                                {Object.values(EXTRACTION_METHODS).map((method) => (
                                    <option key={method} value={method}>
                                        {capitalize(method)}
                                    </option>
                                ))}
                            </Input>
                        </span>
                    ) : (
                        <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                            {capitalize(extractionMethod)}
                        </span>
                    )}
                </Badge>

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
};

ItemMetadata.propTypes = {
    item: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
    showClasses: PropTypes.bool,
    showCreatedAt: PropTypes.bool,
    showCreatedBy: PropTypes.bool,
    showProvenance: PropTypes.bool,
};

export default ItemMetadata;
