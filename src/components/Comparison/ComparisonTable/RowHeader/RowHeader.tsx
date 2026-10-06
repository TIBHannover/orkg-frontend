import { Button, Tooltip } from '@heroui/react';
import { FC, useState } from 'react';

import FilterPopover from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/FilterPopover';
import UnitCalculatorPopover from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/UnitCalculatorPopover';
import { FormattedMeasurement } from '@/components/Comparison/ComparisonTable/RowHeader/UnitCalculator/unitConversionUtils';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { ComparisonPath } from '@/services/backend/types';

type RowHeaderProps = {
    row?: ComparisonPath;
    path: string[];
    columnValueIds: string[];
    originalUnitMeasurements?: FormattedMeasurement[];
    showUnitCalculator?: boolean;
    isConverted?: boolean;
};

const RowHeader: FC<RowHeaderProps> = ({ row, path, columnValueIds, originalUnitMeasurements, showUnitCalculator = false, isConverted = false }) => {
    const [isOpenDataBrowser, setIsOpenDataBrowser] = useState(false);

    if (!row) {
        return null;
    }

    return (
        <th
            className="sticky left-0 border-border border-b bg-inherit border-r border-l flex z-10 min-w-[250px] w-[2px] grow-[2] shrink-0 basis-auto}"
            scope="row"
            style={{ background: getBackgroundColor(path?.length ? path.length - 1 : 0) }}
        >
            <HierarchyIndicator path={path?.slice(1) ?? []} side="left" showHorizontalLine={false} />
            <div className="py-1 px-2 w-full flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="text-start m-0 p-0 break-words select-auto h-auto text-[length:inherit] font-medium text-dark no-underline hover:underline"
                        onPress={() => setIsOpenDataBrowser(true)}
                    >
                        <DescriptionTooltip id={row.id} _class={ENTITIES.PREDICATE}>
                            <div className="break-words whitespace-normal">{row.label}</div>
                        </DescriptionTooltip>
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    {showUnitCalculator && (
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <UnitCalculatorPopover
                                    path={path}
                                    columnValueIds={columnValueIds ?? []}
                                    originalUnitMeasurements={originalUnitMeasurements ?? []}
                                />
                            </Tooltip.Trigger>
                            <Tooltip.Content showArrow>Convert unit</Tooltip.Content>
                            <Tooltip.Arrow />
                        </Tooltip>
                    )}
                    <Tooltip delay={0}>
                        <Tooltip.Trigger>
                            {' '}
                            <FilterPopover id={row.id} path={path.slice(0, -1)} />
                        </Tooltip.Trigger>
                        <Tooltip.Content showArrow>Select Filter</Tooltip.Content>
                        <Tooltip.Arrow />
                    </Tooltip>
                </div>
            </div>
            {isOpenDataBrowser && <DataBrowserDialog show toggleModal={() => setIsOpenDataBrowser((v) => !v)} id={row.id} />}
        </th>
    );
};

export default RowHeader;
