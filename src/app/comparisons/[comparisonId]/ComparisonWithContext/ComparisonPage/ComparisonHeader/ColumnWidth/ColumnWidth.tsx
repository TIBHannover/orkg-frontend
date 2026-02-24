import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import Input from '@/components/Ui/Input/Input';

export const DEFAULT_COLUMN_WIDTH = 250;

const ColumnWidth = () => {
    const { columnWidth, setColumnWidth } = useColumnWidth();
    const [localColumnWidth, setLocalColumnWidth] = useState<number>(columnWidth ?? DEFAULT_COLUMN_WIDTH);

    const handleChangeColumnWidth = (width: number) => {
        setColumnWidth(width);
    };

    const handleResetColumnWidth = () => {
        setLocalColumnWidth(DEFAULT_COLUMN_WIDTH);
        handleChangeColumnWidth(DEFAULT_COLUMN_WIDTH);
    };

    return (
        <>
            <DropdownItem header>Column minimum width</DropdownItem>
            <DropdownItem toggle={false} className="d-flex" header tag="div">
                <Input
                    type="number"
                    value={localColumnWidth}
                    onChange={(e) => setLocalColumnWidth(e.target.valueAsNumber)}
                    onBlur={(e) => handleChangeColumnWidth(e.target.valueAsNumber)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChangeColumnWidth(e.currentTarget.valueAsNumber)}
                    onFocus={(e) => e.target.select()}
                    min={25}
                    max={500}
                />
                <Tooltip content="Reset to default">
                    <span>
                        <Button
                            color="link"
                            className="ps-2 pe-0"
                            onClick={handleResetColumnWidth}
                            disabled={localColumnWidth === DEFAULT_COLUMN_WIDTH}
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                        </Button>
                    </span>
                </Tooltip>
            </DropdownItem>
        </>
    );
};

export default ColumnWidth;
