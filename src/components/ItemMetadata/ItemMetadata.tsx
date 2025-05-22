import { faArrowRight, faCalendar, faSearch, faTags, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import pluralize from 'pluralize';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Badge, Input } from 'reactstrap';

import CopyId from '@/components/CopyId/CopyId';
import ProvenanceBox from '@/components/Resource/ProvenanceBox';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { MISC } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { updateResource } from '@/services/backend/resources';
import { Thing } from '@/services/backend/things';
import { ExtractionMethod } from '@/services/backend/types';

type ItemMetadataProps = {
    editMode?: boolean;
    showClasses?: boolean;
    showDataType?: boolean;
    showCreatedAt?: boolean;
    showCreatedBy?: boolean;
    showProvenance?: boolean;
    showExtractionMethod?: boolean;
    item: Thing;
};

const ItemMetadata: FC<ItemMetadataProps> = ({
    editMode = false,
    showClasses = false,
    showDataType = false,
    showCreatedAt = false,
    showCreatedBy = false,
    showProvenance = false,
    showExtractionMethod = false,
    item,
}) => {
    const [extractionMethod, setExtractionMethod] = useState<ExtractionMethod>(
        'extraction_method' in item ? item.extraction_method : EXTRACTION_METHODS.UNKNOWN,
    );

    const handleSave = async (selectedOption: ExtractionMethod) => {
        setExtractionMethod(selectedOption);
        // rosetta statement require the version_id to be updated
        if ('version_id' in item) {
            await updateResource(item.version_id as string, {
                label: item?.label,
                classes: 'classes' in item ? item.classes : undefined,
                extractionMethod: selectedOption,
            });
        } else {
            await updateResource(item.id as string, {
                label: item?.label,
                classes: 'classes' in item ? item.classes : undefined,
                extractionMethod: selectedOption,
            });
        }
        toast.success('Resource extraction method updated successfully');
    };

    useEffect(() => {
        if ('extraction_method' in item) {
            setExtractionMethod(item.extraction_method);
        }
    }, [item]);

    return (
        <div className="d-flex">
            <div className="flex-grow-1">
                {showCreatedAt && (
                    <Badge color="light" className="me-2">
                        <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1" /> {dayjs(item.created_at).format('DD MMMM YYYY - H:mm')}
                    </Badge>
                )}
                {'shared' in item && item.shared > 0 && (
                    <Badge color="light" className="me-2">
                        <span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                        {` Referred ${pluralize('time', item.shared, true)}`}
                    </Badge>
                )}
                {showDataType && 'datatype' in item && item.datatype !== null && (
                    <Badge color="light" className="me-2">
                        <span>{' Datatype: '}</span>
                        {item.datatype}
                    </Badge>
                )}
                {showClasses && 'classes' in item && item.classes?.length > 0 && (
                    <Badge color="light" className="me-2">
                        <span>
                            <FontAwesomeIcon icon={faTags} /> {' Instance of '}
                        </span>
                        {item.classes.join(', ')}
                    </Badge>
                )}
                {showCreatedBy && item.created_by !== MISC.UNKNOWN_ID && (
                    <Badge color="light" className="me-2">
                        <FontAwesomeIcon icon={faUser} /> Created by{' '}
                        <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                            <UserAvatar size={20} userId={item.created_by} showDisplayName />
                        </span>
                    </Badge>
                )}
                {showExtractionMethod && (
                    <Badge color="light" className="me-2">
                        <FontAwesomeIcon icon={faSearch} /> Extraction:{' '}
                        {editMode ? (
                            <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                <Input
                                    bsSize="sm"
                                    className="mb-3 py-0"
                                    type="select"
                                    value={extractionMethod}
                                    onChange={(e) => handleSave(e.target.value as ExtractionMethod)}
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
};

export default ItemMetadata;
