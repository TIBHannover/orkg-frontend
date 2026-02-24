import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Badge from '@/components/Ui/Badge/Badge';
import Button from '@/components/Ui/Button/Button';

export default function AppliedFilters() {
    const { comparison, selectedPathsFlattened } = useComparison();
    const { filters, removeFilter } = useFilters();

    if (!comparison) {
        return null;
    }

    return (
        filters?.[comparison.id]?.length > 0 && (
            <div className="tw:py-3 tw:flex tw:flex-col">
                <h5 className="tw:m-0">Applied Filters</h5>
                <div className="tw:flex tw:flex-wrap">
                    {filters?.[comparison.id].map((filter) => (
                        <Badge key={filter.id} color="light" className="tw:me-2 tw:mt-2" style={{ whiteSpace: 'normal' }}>
                            <span className="tw:flex tw:items-center tw:gap-1">
                                <span className="tw:font-bold">{selectedPathsFlattened.find((predicate) => predicate.id === filter.id)?.label}</span>
                                {filter.filterValues.endDate && <span>until: {filter.filterValues.endDate}</span>}
                                {filter.filterValues.startDate && <span>from: {filter.filterValues.startDate}</span>}
                                {filter.filterValues.minValue && <span>minimum: {filter.filterValues.minValue}</span>}
                                {filter.filterValues.maxValue && <span>maximum: {filter.filterValues.maxValue}</span>}
                                {filter.filterValues.values && <span>contains: {filter.filterValues.values.join(', ')}</span>}

                                <Button
                                    color="link"
                                    className="tw:text-secondary tw:!p-0 tw:!leading-none tw:border-0 hover:tw:text-red-600 active:tw:text-red-600"
                                >
                                    <FontAwesomeIcon icon={faTimes} onClick={() => removeFilter({ id: filter.id, path: filter.path })} />
                                </Button>
                            </span>
                        </Badge>
                    ))}
                </div>
            </div>
        )
    );
}
