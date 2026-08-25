import Link from 'next/link';
import { FC, ReactNode } from 'react';

import { CardAction } from '@/components/Cards/CardShell/CardActionsMenu';
import CardShell from '@/components/Cards/CardShell/CardShell';
import CompactItemMetadata from '@/components/ItemMetadata/CompactItemMetadata';
import { ProvenanceItem } from '@/components/ItemMetadata/types';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { MISC } from '@/constants/graphSettings';

type EntityCardProps = {
    /** Target of the title link */
    href: string;
    /** Entity whose provenance is rendered below the title. Omit to render no metadata row */
    item?: ProvenanceItem;
    /** Title of the card. Defaults to `item.label` — pass it explicitly for content types, which use `title` */
    label?: ReactNode;
    /** Rendered next to the title, e.g. a type chip */
    badge?: ReactNode;
    showCreatedAt?: boolean;
    /** Render the contributor avatar in the right-hand column, like the content-type cards do */
    showCreatedBy?: boolean;
    showClasses?: boolean;
    showCertainty?: boolean;
    /** Render the copyable ID pill */
    showId?: boolean;
    /** Entries of the card's overflow ("kebab") menu, e.g. a delete action. Forwarded to {@link CardShell} */
    menuActions?: CardAction[];
    /** Extra content rendered between the title and the metadata row */
    children?: ReactNode;
};

/** A title-and-provenance row: the shape most ORKG entities take in a listing. Composes {@link CardShell}. */
const EntityCard: FC<EntityCardProps> = ({
    href,
    item,
    label,
    badge,
    showCreatedAt = true,
    showCreatedBy = true,
    showClasses = true,
    showCertainty = false,
    showId = true,
    menuActions,
    children,
}) => {
    const createdBy = item?.created_by ?? item?.createdBy;
    return (
        <CardShell
            menuActions={menuActions}
            actions={showCreatedBy && createdBy && createdBy !== MISC.UNKNOWN_ID ? <UserAvatar userId={createdBy} /> : undefined}
            footer={
                item && (
                    <CompactItemMetadata
                        item={item}
                        showCreatedAt={showCreatedAt}
                        showClasses={showClasses}
                        showCertainty={showCertainty}
                        showId={showId}
                        showDataType
                        showUri
                    />
                )
            }
        >
            <div className="flex flex-nowrap items-center gap-2">
                <Link href={href} className="line-clamp-2 min-w-0">
                    {label || item?.label || <i>No label</i>}
                </Link>
                {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {children}
        </CardShell>
    );
};

export default EntityCard;
