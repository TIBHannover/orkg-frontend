import { Dispatch, FC, SetStateAction } from 'react';
import useSWR from 'swr';

import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import { CardBadge } from '@/components/styled';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Thing } from '@/services/backend/things';

const Item: FC<{
    item: Thing;
    showContributions?: boolean;
    selectedEntities: Thing[];
    setSelectedEntities: Dispatch<SetStateAction<Thing[]>>;
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

    const handleSelect = (i: Thing) => {
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
            // Remove all contributions from selectedEntities
            const contributionIds = contributionsList.map((c) => c.id);
            setSelectedEntities((v) => v.filter((i) => !contributionIds.includes(i.id)));
        } else {
            // Add contributions that aren't already selected
            const newContributions = contributionsList.filter((c) => !isSelected(c.id));
            setSelectedEntities((v) => [...v, ...newContributions]);
        }
    };

    return (
        <ListGroupItem key={`result-${item.id}`} className="py-2" style={{ overflowWrap: 'anywhere' }}>
            <div className="d-flex flex-column my-3">
                <div className="d-flex align-items-center">
                    <FormGroup check>
                        <div className="float-start">
                            <Input
                                key={`checkbox-${item.id}`}
                                id={`checkbox-${item.id}`}
                                type="checkbox"
                                value=""
                                checked={isSelected?.(item.id)}
                                onChange={() => handleSelect?.(item)}
                            />
                        </div>
                        <Label check htmlFor={`checkbox-${item.id}`} className="tw:text-primary tw:capitalize">
                            {item.label}
                        </Label>{' '}
                        {!!badge && (
                            <div className="d-inline-block ms-2 flex-shrink-0">
                                <CardBadge color="primary">{badge.label}</CardBadge>
                            </div>
                        )}
                    </FormGroup>
                </div>
                {showContributions && (
                    <div className="ms-4 d-flex flex-shrink-0 flex-column">
                        {contributionsList && contributionsList.length > 0 && (
                            <>
                                <div className="tw:mb-2">
                                    <button
                                        type="button"
                                        className="tw:px-1 tw:py-0.5 tw:text-xs tw:bg-gray-50 tw:text-gray-600 tw:border tw:border-gray-200 tw:rounded tw:hover:bg-gray-100 tw:transition-colors tw:duration-200"
                                        style={{ fontSize: '0.625rem' }}
                                        onClick={handleSelectAllContributions}
                                    >
                                        {contributionsList.every((c) => isSelected(c.id)) ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                {contributionsList.map((contribution) => (
                                    <FormGroup check className="d-flex align-items-center" key={`${contribution.id}`}>
                                        <Input
                                            key={`checkbox-contrib-${contribution.id}`}
                                            type="checkbox"
                                            value=""
                                            checked={isSelected?.(contribution.id)}
                                            onChange={() => handleSelect?.(contribution)}
                                            id={`checkbox-${contribution.id}`}
                                        />
                                        <Label check htmlFor={`checkbox-${contribution.id}`} className="ms-2 tw:capitalize tw:line-clamp-1">
                                            {contribution.label}
                                        </Label>
                                    </FormGroup>
                                ))}
                            </>
                        )}
                        {isLoading && <div>Loading...</div>}
                        {error && <div>Error: {error.message}</div>}
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
