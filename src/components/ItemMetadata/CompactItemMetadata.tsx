import { faArrowRight, faCalendar, faGaugeSimpleHigh, faLink, faSearch, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import { FC, ReactNode } from 'react';

import MetadataRow, { MetadataRowItem } from '@/components/Cards/CardShell/MetadataRow';
import CopyId from '@/components/CopyId/CopyId';
import { ProvenanceItem } from '@/components/ItemMetadata/types';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { MISC } from '@/constants/graphSettings';
import { EXTRACTION_METHODS, getExtractionMethodLabel } from '@/constants/misc';

type CompactItemMetadataProps = {
    item: ProvenanceItem;
    showCreatedAt?: boolean;
    showCreatedBy?: boolean;
    showClasses?: boolean;
    showDataType?: boolean;
    /** Render the class URI as a link. Only classes carry one, so this is safe to leave on */
    showUri?: boolean;
    showCertainty?: boolean;
    showExtractionMethod?: boolean;
    /** Render the copyable ID pill, as the last item of the row */
    showId?: boolean;
    /** Extra items appended after the built-in ones */
    children?: ReactNode;
};

/**
 * Read-only provenance footer for cards and list rows: the entity's own metadata rendered as
 * {@link MetadataRow} items. The only element styled as interactive is the copy-ID pill (plus links,
 * whose icons share its accent color).
 *
 * Sibling of {@link ItemMetadata}, which is the roomy, editable variant used in entity page headers. This one
 * drops every label that a card cannot afford ("Created by", "Degree of certainty: ", "Instance of ") and keeps
 * it in the `title` instead, so a row reads as icon + value. It renders nothing interactive: no extraction
 * method select, no provenance assignment, no handle. Reach for `ItemMetadata` when you need those.
 */
const CompactItemMetadata: FC<CompactItemMetadataProps> = ({
    item,
    showCreatedAt = false,
    showCreatedBy = false,
    showClasses = false,
    showDataType = false,
    showUri = false,
    showCertainty = false,
    showExtractionMethod = false,
    showId = true,
    children,
}) => {
    // TODO: remove snake case handling after finishing services migration
    const createdBy = item.created_by ?? item.createdBy;
    const createdAt = item.created_at ?? item.createdAt;
    const extractionMethod = item.extraction_method;
    // the backend hands out the string 'null' for classes without a URI
    const uri = item.uri && item.uri !== 'null' ? item.uri : undefined;

    const items: MetadataRowItem[] = [];

    if (showCreatedAt && createdAt) {
        items.push({
            key: 'created-at',
            node: (
                <span className="inline-flex items-center" title={`Created ${dayjs(createdAt).format('DD MMMM YYYY - H:mm')}`}>
                    <FontAwesomeIcon icon={faCalendar} size="sm" className="me-1 text-muted" />
                    <span className="sr-only">Created </span>
                    {dayjs(createdAt).format('DD MMM YYYY')}
                </span>
            ),
        });
    }
    if (showCreatedBy && createdBy && createdBy !== MISC.UNKNOWN_ID) {
        items.push({
            key: 'created-by',
            node: (
                <span className="inline-flex min-w-0 items-center" title="Contributor">
                    <span className="sr-only">Created by </span>
                    <UserAvatar size={20} userId={createdBy} showDisplayName />
                </span>
            ),
        });
    }
    if (showClasses && item.classes && item.classes.length > 0) {
        items.push({
            key: 'classes',
            node: (
                <span className="inline-flex min-w-0 items-center" title={`Instance of ${item.classes.join(', ')}`}>
                    <FontAwesomeIcon icon={faTags} size="sm" className="me-1 text-muted" />
                    <span className="sr-only">Instance of </span>
                    <span className="truncate">{item.classes.join(', ')}</span>
                </span>
            ),
        });
    }
    if (showDataType && item.datatype !== null && item.datatype !== undefined) {
        items.push({
            key: 'datatype',
            node: (
                <span title={`Datatype ${item.datatype}`}>
                    <span className="sr-only">Datatype </span>
                    {item.datatype}
                </span>
            ),
        });
    }
    if (showUri && uri) {
        items.push({
            key: 'uri',
            node: (
                // the accent icon marks the link as interactive; the text inherits so it doesn't outrank the title
                <span className="inline-flex min-w-0 items-center" title={uri}>
                    <FontAwesomeIcon icon={faLink} size="sm" className="me-1 text-accent" />
                    <span className="sr-only">URI </span>
                    <a href={uri} target="_blank" rel="noreferrer" className="min-w-0 truncate text-inherit hover:underline">
                        {uri}
                    </a>
                </span>
            ),
        });
    }
    if (showCertainty && item.certainty) {
        items.push({
            key: 'certainty',
            node: (
                <span className="inline-flex items-center" title={`Degree of certainty: ${item.certainty}`}>
                    <FontAwesomeIcon icon={faGaugeSimpleHigh} size="sm" className="me-1 text-muted" />
                    <span className="sr-only">Degree of certainty </span>
                    {item.certainty}
                </span>
            ),
        });
    }
    if (showExtractionMethod && extractionMethod && extractionMethod !== EXTRACTION_METHODS.UNKNOWN) {
        items.push({
            key: 'extraction-method',
            node: (
                <span className="inline-flex items-center" title={`Extraction method: ${getExtractionMethodLabel(extractionMethod)}`}>
                    <FontAwesomeIcon icon={faSearch} size="sm" className="me-1 text-muted" />
                    <span className="sr-only">Extraction method </span>
                    {getExtractionMethodLabel(extractionMethod)}
                </span>
            ),
        });
    }
    if (item.shared !== undefined && item.shared > 0) {
        items.push({
            key: 'shared',
            node: (
                <span className="inline-flex items-center" title={`Referred ${pluralize('time', item.shared, true)}`}>
                    <FontAwesomeIcon icon={faArrowRight} size="sm" className="me-1 text-muted" />
                    {pluralize('reference', item.shared, true)}
                </span>
            ),
        });
    }
    if (children) {
        items.push({ key: 'children', node: children });
    }
    if (showId && item.id) {
        items.push({
            key: 'id',
            node: (
                // flex, not block: a line box around the inline-flex pill would inflate the wrapper and misalign it vertically
                <span className="flex max-w-[11rem]">
                    <CopyId id={item.id} size="xs" />
                </span>
            ),
        });
    }

    return <MetadataRow items={items} />;
};

export default CompactItemMetadata;
