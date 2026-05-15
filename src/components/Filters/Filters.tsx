import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label, Skeleton } from '@heroui/react';
import { motion } from 'motion/react';
import { FC, Fragment, useState } from 'react';

import FilterInputField from '@/components/Filters/FilterInputField/FilterInputField';
import FilterLabel from '@/components/Filters/FilterInputField/FilterLabel';
import useFilterConfig from '@/components/Filters/hooks/useFilterConfig';
import AllFiltersDrawer from '@/components/Filters/Panel/AllFiltersDrawer';

type FiltersProps = {
    id: string;
};

const Filters: FC<FiltersProps> = ({ id }) => {
    const { filters, isLoadingFilters, canReset, setFilters, showResult, refreshFilters, resetFilters, updateFilterValue } = useFilterConfig({
        oId: id,
    });

    const [showEditPanel, setShowEditPanel] = useState(false);

    const isShowResultActive = !!filters?.some((f) => f.values && f.values?.length > 0);
    const hasFilters = !!filters && filters.length > 0;
    const hasMoreFilters = !!filters && filters.length > 2;
    const hasActions = isShowResultActive || canReset;

    if (isLoadingFilters) {
        return (
            <div className="max-w-container mx-auto px-3">
                <Skeleton className="w-full h-10 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="max-w-container mx-auto px-3">
            <div className="flex flex-wrap items-stretch gap-2 px-3 py-2 rounded-lg bg-surface-secondary border border-border/40">
                <div className="flex items-center gap-2 shrink-0 pr-2 sm:border-r sm:border-border/40">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                    <span className="font-medium text-sm">Filters</span>
                </div>

                {!hasFilters && (
                    <div className="text-sm text-muted self-center grow">
                        Customize your browsing experience by clicking <FontAwesomeIcon size="xs" icon={faFilter} /> to add filters.
                    </div>
                )}

                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 grow min-w-0">
                        {filters?.slice(0, 2).map((filter, index) => (
                            <Fragment key={filter.id || index}>
                                <div className="flex items-center gap-2 min-w-0 max-w-full">
                                    <Label htmlFor={filter.id || index.toString()} className="text-sm whitespace-nowrap text-muted shrink-0">
                                        <FilterLabel filter={filter} />
                                    </Label>
                                    <div className="min-w-0">
                                        <FilterInputField filter={filter} updateFilterValue={updateFilterValue} />
                                    </div>
                                </div>
                            </Fragment>
                        ))}

                        {hasMoreFilters && (
                            <Button size="sm" variant="tertiary" onPress={() => setShowEditPanel((v) => !v)}>
                                + {(filters?.length ?? 0) - 2} more
                            </Button>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {hasActions && (
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: 'spring', duration: 0.35 }}
                        >
                            {isShowResultActive && (
                                <Button size="sm" onPress={showResult}>
                                    Show result
                                </Button>
                            )}
                            {canReset && (
                                <Button size="sm" variant="secondary" onPress={resetFilters}>
                                    Reset
                                </Button>
                            )}
                        </motion.div>
                    )}

                    <Button size="sm" variant="secondary" isIconOnly aria-label="Open all filters" onPress={() => setShowEditPanel((v) => !v)}>
                        <FontAwesomeIcon icon={faFilter} />
                    </Button>
                </div>
            </div>

            <AllFiltersDrawer
                id={id}
                isOpen={showEditPanel}
                toggle={() => setShowEditPanel((v) => !v)}
                filters={filters ?? []}
                refreshFilters={refreshFilters}
                setFilters={setFilters}
                updateFilterValue={updateFilterValue}
                showResult={showResult}
                resetFilters={resetFilters}
            />
        </div>
    );
};

export default Filters;
