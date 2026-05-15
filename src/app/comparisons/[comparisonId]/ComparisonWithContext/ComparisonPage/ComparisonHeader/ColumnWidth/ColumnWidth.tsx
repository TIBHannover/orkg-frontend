import { faCheck, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useState } from 'react';

import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import Tooltip from '@/components/FloatingUI/Tooltip';

export const DEFAULT_COLUMN_WIDTH = 250;
const MIN_COLUMN_WIDTH = 25;
const MAX_COLUMN_WIDTH = 500;

const clamp = (value: number) => Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, value));

type ColumnWidthProps = {
    onApply?: () => void;
};

const ColumnWidth = ({ onApply }: ColumnWidthProps) => {
    const { columnWidth, setColumnWidth } = useColumnWidth();
    const [localColumnWidth, setLocalColumnWidth] = useState<number>(columnWidth ?? DEFAULT_COLUMN_WIDTH);

    const handleApply = () => {
        if (Number.isNaN(localColumnWidth)) {
            return;
        }
        const next = clamp(localColumnWidth);
        if (next !== localColumnWidth) {
            setLocalColumnWidth(next);
        }
        setColumnWidth(next);
        onApply?.();
    };

    const handleResetColumnWidth = () => {
        setLocalColumnWidth(DEFAULT_COLUMN_WIDTH);
        setColumnWidth(DEFAULT_COLUMN_WIDTH);
    };

    const isInvalid = Number.isNaN(localColumnWidth);

    return (
        <div className="p-2 min-w-[220px]">
            <div className="text-xs font-semibold text-default-500 mb-1">Column minimum width (px)</div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    aria-label="Column minimum width"
                    className="flex-1 border border-default-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    value={Number.isNaN(localColumnWidth) ? '' : localColumnWidth}
                    onChange={(e) => setLocalColumnWidth(e.target.valueAsNumber)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApply();
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    min={MIN_COLUMN_WIDTH}
                    max={MAX_COLUMN_WIDTH}
                />
                <Tooltip content="Reset to default">
                    <span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onPress={handleResetColumnWidth}
                            isDisabled={localColumnWidth === DEFAULT_COLUMN_WIDTH}
                            aria-label="Reset to default"
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                        </Button>
                    </span>
                </Tooltip>
                <Button variant="primary" size="sm" onPress={handleApply} isDisabled={isInvalid || localColumnWidth === columnWidth}>
                    <FontAwesomeIcon icon={faCheck} className="mr-1" /> Apply
                </Button>
            </div>
            <div className="text-xs text-default-400 mt-2">
                Allowed range: {MIN_COLUMN_WIDTH}–{MAX_COLUMN_WIDTH}px
            </div>
        </div>
    );
};

export default ColumnWidth;
