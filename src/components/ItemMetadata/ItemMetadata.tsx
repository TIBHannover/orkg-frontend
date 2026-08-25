import { faArrowRight, faCalendar, faGaugeSimpleHigh, faSearch, faTags, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Key } from '@heroui/react';
import { Chip, ListBox, Select, toast } from '@heroui/react';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import { FC, ReactNode, useEffect, useState } from 'react';

import CopyId from '@/components/CopyId/CopyId';
import ProvenanceBox from '@/components/ItemMetadata/ProvenanceBox';
import { ProvenanceItem } from '@/components/ItemMetadata/types';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { MISC } from '@/constants/graphSettings';
import { EXTRACTION_METHODS, getExtractionMethodLabel } from '@/constants/misc';
import { updateResource } from '@/services/backend/resources';
import { ExtractionMethod } from '@/services/backend/types';

type ItemMetadataProps = {
    editMode?: boolean;
    showClasses?: boolean;
    showDataType?: boolean;
    showCreatedAt?: boolean;
    showCreatedBy?: boolean;
    showCertainty?: boolean;
    showProvenance?: boolean;
    showExtractionMethod?: boolean;
    /** Render the copyable ID pill */
    showId?: boolean;
    item: ProvenanceItem;
    handleUrl?: string;
    updateCallBack?: (observatoryId?: string, organizationId?: string) => void;
    /** Extra chips appended to the metadata row */
    children?: ReactNode;
};

/**
 * Roomy, editable provenance row for entity page headers: it can edit the extraction method, assign an
 * observatory and show the handle. Cards and list rows use {@link CompactItemMetadata} instead, which is
 * read-only and drops the labels a dense row cannot afford.
 */
const ItemMetadata: FC<ItemMetadataProps> = ({
    editMode = false,
    showClasses = false,
    showDataType = false,
    showCreatedAt = false,
    showCreatedBy = false,
    showCertainty = false,
    showProvenance = false,
    showExtractionMethod = false,
    showId = true,
    handleUrl,
    item,
    updateCallBack,
    children,
}) => {
    const [extractionMethod, setExtractionMethod] = useState<ExtractionMethod>(item.extraction_method ?? EXTRACTION_METHODS.UNKNOWN);

    const handleSave = async (selectedOption: ExtractionMethod) => {
        setExtractionMethod(selectedOption);
        // rosetta statement require the version_id to be updated
        await updateResource((item.version_id ?? item.id) as string, {
            label: item?.label,
            classes: item.classes,
            extractionMethod: selectedOption,
        });
        toast.success('Resource extraction method updated successfully');
    };

    useEffect(() => {
        if (item.extraction_method) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExtractionMethod(item.extraction_method);
        }
    }, [item]);

    // TODO: remove snake case handling after finishing services migration
    const createdBy = item.created_by ?? item.createdBy;
    const createdAt = item.created_at ?? item.createdAt;

    return (
        <>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="grow flex flex-wrap items-center gap-2 min-w-0">
                    {showCreatedAt && createdAt && (
                        <Chip color="default" className="max-w-full">
                            <FontAwesomeIcon size="sm" icon={faCalendar} className="mr-1 text-muted" />{' '}
                            {dayjs(createdAt).format('DD MMMM YYYY - H:mm')}
                        </Chip>
                    )}
                    {item.shared !== undefined && item.shared > 0 && (
                        <Chip color="default">
                            <span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
                            </span>
                            {` Referred ${pluralize('time', item.shared, true)}`}
                        </Chip>
                    )}
                    {showDataType && item.datatype !== null && item.datatype !== undefined && (
                        <Chip color="default">
                            <span>{' Datatype: '}</span>
                            {item.datatype}
                        </Chip>
                    )}
                    {showClasses && item.classes && item.classes.length > 0 && (
                        <Chip color="default" className="max-w-full">
                            <span>
                                <FontAwesomeIcon icon={faTags} className="text-muted" /> {' Instance of '}
                            </span>
                            <span className="truncate">{item.classes.join(', ')}</span>
                        </Chip>
                    )}
                    {showCreatedBy && createdBy && createdBy !== MISC.UNKNOWN_ID && (
                        <Chip color="default" className="max-w-full">
                            <FontAwesomeIcon icon={faUser} className="text-muted" /> Created by{' '}
                            <span className="ml-1 inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                <UserAvatar size={20} userId={createdBy} showDisplayName />
                            </span>
                        </Chip>
                    )}
                    {showCertainty && item.certainty && (
                        <Chip color="default">
                            <FontAwesomeIcon icon={faGaugeSimpleHigh} className="text-muted" /> Degree of certainty: {item.certainty}
                        </Chip>
                    )}
                    {showExtractionMethod && (
                        <Chip color="default">
                            <FontAwesomeIcon icon={faSearch} className="text-muted" /> Extraction:{' '}
                            {editMode ? (
                                <span className="ml-1 inline-block align-middle" style={{ marginTop: -30, marginBottom: -30 }}>
                                    <Select
                                        aria-label="Extraction method"
                                        value={extractionMethod}
                                        onChange={(key: Key | null) => {
                                            if (key) handleSave(key as ExtractionMethod);
                                        }}
                                    >
                                        <Select.Trigger className="!h-6 !min-h-6 !py-0 text-xs">
                                            <Select.Value />
                                            <Select.Indicator className="size-3" />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {Object.values(EXTRACTION_METHODS).map((method) => (
                                                    <ListBox.Item key={method} id={method} textValue={getExtractionMethodLabel(method)}>
                                                        {getExtractionMethodLabel(method)}
                                                        <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </span>
                            ) : (
                                <span className="ml-1 inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                                    {getExtractionMethodLabel(extractionMethod)}
                                </span>
                            )}
                        </Chip>
                    )}

                    {showProvenance && <ProvenanceBox item={item} editMode={editMode} updateCallBack={updateCallBack} />}

                    {children}
                </div>
                {showId && item.id && (
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
