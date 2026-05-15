import { Checkbox } from '@heroui/react';
import { Dispatch, FC, SetStateAction } from 'react';
import useSWR from 'swr';

import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import { CardBadge } from '@/components/styled';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Thing } from '@/services/backend/things';
import { ResourceThingReference } from '@/services/backend/types';

const Item: FC<{
    item: Thing;
    showContributions?: boolean;
    selectedEntities: (Thing | ResourceThingReference)[];
    setSelectedEntities: Dispatch<SetStateAction<(Thing | ResourceThingReference)[]>>;
}> = ({ item, showContributions = false, selectedEntities, setSelectedEntities }) => {
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

    const isSelected = (itemId: string) => selectedEntities.some((i) => i.id === itemId);

    const handleSelect = (i: Thing | ResourceThingReference) => {
        if (selectedEntities.some((s) => s.id === i.id)) {
            setSelectedEntities((v) => v.filter((s) => s.id !== i.id));
        } else {
            setSelectedEntities((v) => [...v, i]);
        }
    };

    const isPaper = item._class === ENTITIES.RESOURCE && 'classes' in item && item.classes?.includes(CLASSES.PAPER);
    const {
        data: contributions,
        isLoading,
        error,
    } = useSWR(
        showContributions && isPaper
            ? [
                  { subjectId: item.id, predicateId: PREDICATES.HAS_CONTRIBUTION, sortBy: [{ property: 'created_at', direction: 'asc' as const }] },
                  statementsUrl,
                  'getStatements',
              ]
            : null,
        ([params]) => getStatements({ ...params, returnContent: true }),
    );

    const contributionsList = contributions?.map((contribution) => contribution.object) ?? [];

    const handleSelectAllContributions = () => {
        if (!contributionsList || contributionsList.length === 0) return;

        const allContributionsSelected = contributionsList.every((c) => isSelected(c.id));

        if (allContributionsSelected) {
            const contributionIds = contributionsList.map((c) => c.id);
            setSelectedEntities((v) => v.filter((i) => !contributionIds.includes(i.id)));
        } else {
            const newContributions = contributionsList.filter((c) => !isSelected(c.id));
            setSelectedEntities((v) => [...v, ...newContributions]);
        }
    };

    return (
        <div key={`result-${item.id}`} className="py-3 px-4 flex flex-col gap-2" style={{ overflowWrap: 'anywhere' }}>
            <div className="flex flex-nowrap items-center gap-2">
                <Checkbox isSelected={isSelected(item.id)} onChange={() => handleSelect(item)}>
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content className="text-accent capitalize line-clamp-2 min-w-0">{item.label}</Checkbox.Content>
                </Checkbox>
                {!!badge && (
                    <div className="shrink-0">
                        <CardBadge color="primary">{badge.label}</CardBadge>
                    </div>
                )}
            </div>
            {showContributions && (
                <div className="ml-6 flex flex-col gap-1">
                    {contributionsList && contributionsList.length > 0 && (
                        <>
                            <button
                                type="button"
                                className="self-start px-1 py-0.5 text-[0.625rem] bg-default text-foreground border border-default rounded hover:bg-default/80 transition-colors duration-200"
                                onClick={handleSelectAllContributions}
                            >
                                {contributionsList.every((c) => isSelected(c.id)) ? 'Deselect All' : 'Select All'}
                            </button>
                            {contributionsList.map((contribution) => (
                                <Checkbox key={contribution.id} isSelected={isSelected(contribution.id)} onChange={() => handleSelect(contribution)}>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <Checkbox.Content className="capitalize line-clamp-1">{contribution.label}</Checkbox.Content>
                                </Checkbox>
                            ))}
                        </>
                    )}
                    {isLoading && <div>Loading...</div>}
                    {error && <div>Error: {error.message}</div>}
                </div>
            )}
            <ItemMetadata
                item={item}
                showClasses={!badge}
                showDataType
                showCreatedAt={'classes' in item && item.classes && item.classes.includes(CLASSES.COMPARISON)}
                showExtractionMethod={item._class === ENTITIES.RESOURCE && !badge}
            />
        </div>
    );
};

export default Item;
