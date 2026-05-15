import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip } from '@heroui/react';

import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import useComparison from '@/components/Comparison/hooks/useComparison';

export default function AppliedFilters() {
    const { comparison, selectedPathsFlattened } = useComparison();
    const { filters, removeFilter } = useFilters();

    if (!comparison) {
        return null;
    }

    const applied = filters?.[comparison.id];

    if (!applied || applied.length === 0) {
        return null;
    }

    return (
        <div className="py-3 flex flex-col gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Applied filters</p>
            <div className="flex flex-wrap gap-2">
                {applied.map((filter) => {
                    const predicateLabel = selectedPathsFlattened.find((predicate) => predicate.id === filter.id)?.label;
                    return (
                        <Chip key={filter.id} variant="soft" className="h-auto py-1 whitespace-normal">
                            <Chip.Label className="flex flex-wrap items-center gap-1.5 text-sm leading-snug">
                                <span className="font-semibold">{predicateLabel}</span>
                                {filter.filterValues.endDate && <span className="text-muted">until {filter.filterValues.endDate}</span>}
                                {filter.filterValues.startDate && <span className="text-muted">from {filter.filterValues.startDate}</span>}
                                {filter.filterValues.minValue && <span className="text-muted">min {filter.filterValues.minValue}</span>}
                                {filter.filterValues.maxValue && <span className="text-muted">max {filter.filterValues.maxValue}</span>}
                                {filter.filterValues.values && <span className="text-muted">contains {filter.filterValues.values.join(', ')}</span>}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Remove filter"
                                    className="h-4 w-4 min-w-0 p-0 bg-transparent hover:bg-transparent text-muted hover:text-danger"
                                    onPress={() => removeFilter({ id: filter.id, path: filter.path })}
                                >
                                    <FontAwesomeIcon icon={faTimes} size="xs" />
                                </Button>
                            </Chip.Label>
                        </Chip>
                    );
                })}
            </div>
        </div>
    );
}
