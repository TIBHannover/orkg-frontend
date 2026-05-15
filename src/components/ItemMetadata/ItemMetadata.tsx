import { faArrowRight, faCalendar, faSearch, faTags, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Key } from '@heroui/react';
import { Chip, ListBox, Select, toast } from '@heroui/react';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import pluralize from 'pluralize';
import { FC, useEffect, useState } from 'react';

import CopyId from '@/components/CopyId/CopyId';
import ProvenanceBox from '@/components/ItemMetadata/ProvenanceBox';
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
    handleUrl?: string;
    updateCallBack?: () => void;
};

const ItemMetadata: FC<ItemMetadataProps> = ({
    editMode = false,
    showClasses = false,
    showDataType = false,
    showCreatedAt = false,
    showCreatedBy = false,
    showProvenance = false,
    showExtractionMethod = false,
    handleUrl,
    item,
    updateCallBack,
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExtractionMethod(item.extraction_method);
        }
    }, [item]);

    // TODO: remove snake case handling after finishing services migration
    const createdBy = 'created_by' in item ? item.created_by : item.createdBy;
    const createdAt = 'created_at' in item ? item.created_at : item.createdAt;

    return (
        <>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="grow flex flex-wrap items-center gap-2 min-w-0">
                    {showCreatedAt && (
                        <Chip color="default" className="max-w-full">
                            <FontAwesomeIcon size="sm" icon={faCalendar} className="mr-1 text-muted" />{' '}
                            {dayjs(createdAt).format('DD MMMM YYYY - H:mm')}
                        </Chip>
                    )}
                    {'shared' in item && item.shared > 0 && (
                        <Chip color="default">
                            <span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
                            </span>
                            {` Referred ${pluralize('time', item.shared, true)}`}
                        </Chip>
                    )}
                    {showDataType && 'datatype' in item && item.datatype !== null && (
                        <Chip color="default">
                            <span>{' Datatype: '}</span>
                            {item.datatype}
                        </Chip>
                    )}
                    {showClasses && 'classes' in item && item.classes?.length > 0 && (
                        <Chip color="default" className="max-w-full">
                            <span>
                                <FontAwesomeIcon icon={faTags} className="text-muted" /> {' Instance of '}
                            </span>
                            <span className="truncate">{item.classes.join(', ')}</span>
                        </Chip>
                    )}
                    {showCreatedBy && createdBy !== MISC.UNKNOWN_ID && (
                        <Chip color="default" className="max-w-full">
                            <FontAwesomeIcon icon={faUser} className="text-muted" /> Created by{' '}
                            <span className="ml-1 inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                <UserAvatar size={20} userId={createdBy} showDisplayName />
                            </span>
                        </Chip>
                    )}
                    {showExtractionMethod && (
                        <Chip color="default">
                            <FontAwesomeIcon icon={faSearch} className="text-muted" /> Extraction:{' '}
                            {editMode ? (
                                <span className="ml-1 inline-block align-middle" style={{ marginTop: -30, marginBottom: -30 }}>
                                    <Select
                                        aria-label="Extraction method"
                                        className="w-28"
                                        value={extractionMethod}
                                        onChange={(key: Key | null) => {
                                            if (key) handleSave(key as ExtractionMethod);
                                        }}
                                    >
                                        <Select.Trigger className="!h-6 !min-h-6 !py-0 !px-2 text-xs">
                                            <Select.Value />
                                            <Select.Indicator className="size-3" />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {Object.values(EXTRACTION_METHODS).map((method) => (
                                                    <ListBox.Item key={method} id={method} textValue={capitalize(method)}>
                                                        {capitalize(method)}
                                                        <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </span>
                            ) : (
                                <span className="ml-1 inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                    {capitalize(extractionMethod)}
                                </span>
                            )}
                        </Chip>
                    )}

                    {showProvenance && <ProvenanceBox item={item} editMode={editMode} updateCallBack={updateCallBack} />}
                </div>
                {item.id && (
                    <div className="flex shrink-0 sm:items-end">
                        <CopyId id={item.id} />
                    </div>
                )}
            </div>
            {handleUrl && (
                <div className="mt-2">
                    <small>
                        Handle:{' '}
                        <a href={handleUrl} target="_blank" rel="noopener noreferrer">
                            {handleUrl}
                        </a>
                    </small>
                </div>
            )}
        </>
    );
};

export default ItemMetadata;
