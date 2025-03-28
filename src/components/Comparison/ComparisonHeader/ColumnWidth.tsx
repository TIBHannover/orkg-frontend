import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { env } from 'next-runtime-env';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DropdownItem, Input } from 'reactstrap';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { setConfigurationAttribute } from '@/slices/comparisonSlice';

export const DEFAULT_COLUMN_WIDTH = 250;

const ColumnWidth = () => {
    // @ts-expect-error
    const columnWidth = useSelector((state) => state.comparison.configuration.columnWidth);
    const [localColumnWidth, setLocalColumnWidth] = useState<number>(columnWidth ?? DEFAULT_COLUMN_WIDTH);
    const [, setCookie] = useCookies();
    const dispatch = useDispatch();

    const handleChangeColumnWidth = (width: number) => {
        setCookie('comparisonColumnWidth', width, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 60 * 60 * 24 * 7 }); // << one week
        dispatch(setConfigurationAttribute({ attribute: 'columnWidth', value: width }));
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
