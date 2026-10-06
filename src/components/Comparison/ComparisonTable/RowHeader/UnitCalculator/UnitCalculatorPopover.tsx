'use client';

import { faCalculator, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Popover, Tooltip } from '@heroui/react';
import { uniqBy } from 'lodash';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import {
    buildConversionInputs,
    conversionsMapParser,
    findConversionEntry,
    FormattedMeasurement,
    getUnitSuffix,
    removeConversion,
    upsertConversion,
} from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import UnitSelector, { UnitSelectorOption } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/UnitSelector';
import useQuantityKind from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/useQuantityKind';
import useQudtUnits from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/useQudtUnits';
import { QuantityUnitItem } from '@/services/qudt/types';

type UnitCalculatorPopoverProps = {
    path: string[];
    columnValueIds?: string[];
    originalUnitMeasurements?: FormattedMeasurement[];
};

export default function UnitCalculatorPopover({ path, columnValueIds = [], originalUnitMeasurements }: UnitCalculatorPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { id: comparisonId } = useComparisonState();
    const [conversionsMap, setConversionsMap] = useQueryState('conversions', conversionsMapParser);
    const savedEntry = findConversionEntry(conversionsMap, comparisonId, path);
    const savedUnitId = savedEntry?.t ?? null;

    const { qudtUnits, isLoading: isLoadingUnits } = useQudtUnits(isOpen);
    const quantityKindSubjectId = columnValueIds.find(Boolean) ?? null;
    const { quantityKind, isLoading: isQuantityKindLoading } = useQuantityKind(isOpen ? quantityKindSubjectId : null);
    // undefined = untouched (fall back to the unit saved in the URL), null = cleared by the user
    const [selectedUnit, setSelectedUnit] = useState<QuantityUnitItem | null | undefined>(undefined);
    const [saveError, setSaveError] = useState<string | null>(null);

    const filteredUnits = useMemo(() => {
        const normalizedKind = quantityKind?.label?.toLowerCase().trim();
        if (!normalizedKind) {
            return [];
        }
        return uniqBy(
            qudtUnits.filter((unit: QuantityUnitItem) => unit.quantityKindLabel?.toLowerCase().trim() === normalizedKind),
            (u) => `${u.id}|${u.label ?? ''}`,
        );
    }, [qudtUnits, quantityKind?.label]);

    const savedUnit = useMemo(() => {
        if (!savedUnitId) return null;
        return filteredUnits.find((unit) => unit.id.endsWith(`/${savedUnitId}`)) ?? null;
    }, [savedUnitId, filteredUnits]);

    const activeUnit = selectedUnit === undefined ? savedUnit : selectedUnit;

    const selectOptions: UnitSelectorOption[] = filteredUnits.filter((unit): unit is UnitSelectorOption => !!unit.label);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setSelectedUnit(undefined);
            setSaveError(null);
        }
    };

    const handleApply = async () => {
        if (!activeUnit || !path.length) return;

        const convertibleInputs = buildConversionInputs(originalUnitMeasurements ?? [], qudtUnits, activeUnit);
        if (!convertibleInputs.length) {
            setSaveError('Conversion failed: none of the values could be converted to the selected unit.');
            return;
        }

        setSaveError(null);
        handleOpenChange(false);
        await setConversionsMap(upsertConversion(conversionsMap, comparisonId, path, getUnitSuffix(activeUnit.id)));
    };
    const handleReset = async () => {
        const updated = removeConversion(conversionsMap, comparisonId, path);
        handleOpenChange(false);
        await setConversionsMap(updated.length > 0 ? updated : null);
    };
    return (
        <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label="Convert unit"
                    className={`min-w-0 h-auto w-auto p-0 bg-transparent hover:bg-transparent opacity-70 hover:opacity-100 ${
                        savedEntry ? 'text-accent' : 'text-secondary'
                    }`}
                >
                    <FontAwesomeIcon icon={faCalculator} />
                </Button>
            </Popover.Trigger>
            <Popover.Content placement="right">
                <Popover.Dialog>
                    <Popover.Arrow />
                    <div className="min-w-72 max-w-80 p-1 flex flex-col gap-3">
                        <span className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
                            Unit conversion{' '}
                            <Tooltip>
                                <Tooltip.Trigger>
                                    <a
                                        href="https://orkg.org/help-center/article/64/Converting_units_in_comparisons"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
                                    </a>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Open help center</Tooltip.Content>
                            </Tooltip>
                        </span>

                        {(isLoadingUnits || isQuantityKindLoading) && <div className="text-sm text-muted">Loading units…</div>}
                        {!isLoadingUnits && !isQuantityKindLoading && !quantityKind?.label && (
                            <Alert status="accent">
                                <Alert.Content>
                                    <Alert.Description>
                                        Select a unit from the same quantity kind. Different dimensions cannot be converted.
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {!isLoadingUnits && !isQuantityKindLoading && quantityKind?.label && (
                            <div className="text-sm text-muted">Quantity kind: {quantityKind.label}</div>
                        )}
                        {!isLoadingUnits && !isQuantityKindLoading && selectOptions.length > 0 && (
                            <UnitSelector
                                options={selectOptions}
                                selectedUnit={activeUnit}
                                disabled={isQuantityKindLoading || isLoadingUnits}
                                onChange={(nextSelected) => {
                                    setSelectedUnit(nextSelected);
                                    setSaveError(null);
                                }}
                            />
                        )}
                        {!isLoadingUnits && !isQuantityKindLoading && quantityKind?.label && selectOptions.length === 0 && (
                            <Alert status="warning">
                                <Alert.Content>
                                    <Alert.Description>No units found for this quantity kind.</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {saveError && (
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>{saveError}</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        <div className="flex justify-between">
                            <Button size="sm" variant="tertiary" onPress={handleReset} isDisabled={!savedEntry || !!selectedUnit}>
                                Reset
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                onPress={handleApply}
                                isDisabled={
                                    isLoadingUnits || isQuantityKindLoading || !activeUnit || getUnitSuffix(activeUnit?.id ?? '') === savedUnitId
                                }
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
