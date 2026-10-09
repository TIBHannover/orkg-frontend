'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip } from '@heroui/react';
import { useQueryState } from 'nuqs';

import {
    conversionsMapParser,
    pathKey,
    removeConversion,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import useQudtUnits from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/useQudtUnits';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { PREDICATES } from '@/constants/graphSettings';

export default function AppliedConversions() {
    const { comparison, selectedPathsFlattened } = useComparison();
    const [conversionsMap, setConversionsMap] = useQueryState('conversions', conversionsMapParser);
    const applied = conversionsMap.filter((entry) => entry.c === comparison?.id);
    // Same SWR key as the conversion machinery — no extra fetch when conversions are active.
    const { qudtUnits } = useQudtUnits(applied.length > 0);

    if (!comparison || applied.length === 0) {
        return null;
    }

    return (
        <div className="py-3 flex flex-col gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Applied unit conversions</p>
            <div className="flex flex-wrap gap-2">
                {applied.map((entry) => {
                    const pathLabels = entry.p.map((id) => ({
                        id,
                        label: selectedPathsFlattened.find((predicate) => predicate.id === id)?.label ?? id,
                    }));
                    const lastNode = pathLabels[pathLabels.length - 1];
                    // The quantityValue leaf (P45073) is a technical detail — the parent
                    // property is the name users recognize, so the leaf is dropped when it is that node.
                    const displayedLabels = pathLabels.length > 1 && lastNode.id === PREDICATES.QUANTITY_VALUE ? pathLabels.slice(0, -1) : pathLabels;
                    const predicateLabel = displayedLabels.map((node) => node.label).join(' › ');
                    const unitLabel = qudtUnits.find((unit) => unit.id.endsWith(`/${entry.t}`))?.label ?? entry.t;
                    return (
                        <Chip key={pathKey(entry.p)} variant="soft" className="h-auto py-1 whitespace-normal">
                            <Chip.Label className="flex flex-wrap items-center gap-1.5 text-sm leading-snug">
                                <span className="font-semibold">{predicateLabel}</span>
                                <span className="text-muted">converted to {unitLabel}</span>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Remove conversion"
                                    className="h-4 w-4 min-w-0 p-0 bg-transparent hover:bg-transparent text-muted hover:text-danger"
                                    onPress={() => {
                                        const updated = removeConversion(conversionsMap, comparison.id, entry.p);
                                        setConversionsMap(updated.length > 0 ? updated : null);
                                    }}
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
