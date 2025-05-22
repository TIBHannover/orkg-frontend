import Link from 'next/link';
import { FC } from 'react';
import { ListGroupItem } from 'reactstrap';

import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import { CardBadge } from '@/components/styled';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';
import { getResourceLink } from '@/utils';

export const getEntityLink = (entity: Thing) => {
    if (entity._class === ENTITIES.CLASS) {
        return getResourceLink(entity._class, entity.id);
    }
    if (entity._class === ENTITIES.PREDICATE) {
        return getResourceLink(entity._class, entity.id);
    }
    if (entity._class === ENTITIES.RESOURCE && 'classes' in entity) {
        let link: string = '';
        for (const c of entity.classes) {
            const cLink = getResourceLink(c, entity.id);
            if (cLink !== getResourceLink(entity._class, entity.id)) {
                link = cLink;
            }
        }
        return link || getResourceLink(entity._class, entity.id);
    }
    return getResourceLink(entity._class, entity.id);
};

const Item: FC<{ item: Thing }> = ({ item }) => {
    const getBadge = () => {
        if (item._class === ENTITIES.LITERAL) {
            return { label: 'Literal' };
        }
        if (
            item._class === ENTITIES.RESOURCE &&
            'classes' in item &&
            item.classes &&
            item.classes.some((c) => DEFAULT_FILTERS.find((f) => f.id === c))
        ) {
            return { label: DEFAULT_FILTERS.find((f) => item.classes.some((c) => c === f.id))?.label };
        }
        if (item._class === ENTITIES.PREDICATE) {
            return { label: 'Predicate' };
        }
        if (item._class === ENTITIES.CLASS) {
            return { label: 'Class' };
        }
        return false;
    };

    const badge = getBadge();

    return (
        <ListGroupItem key={`result-${item.id}`} className="py-2" style={{ overflowWrap: 'anywhere' }}>
            <div className="d-flex align-items-center my-3">
                <Link href={getEntityLink(item)}>{item.label}</Link>{' '}
                {!!badge && (
                    <div className="d-inline-block ms-2 flex-shrink-0">
                        <CardBadge color="primary">{badge.label}</CardBadge>
                    </div>
                )}
            </div>
            <ItemMetadata
                item={item}
                showClasses={!badge}
                showDataType
                showCreatedAt={'classes' in item && item.classes && item.classes.includes(CLASSES.COMPARISON)}
                showExtractionMethod={item._class === ENTITIES.RESOURCE && !badge}
            />
        </ListGroupItem>
    );
};
export default Item;
