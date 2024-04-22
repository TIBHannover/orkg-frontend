import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import env from 'components/NextJsMigration/env';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DropdownItem, Input } from 'reactstrap';
import { setConfigurationAttribute } from 'slices/comparisonSlice';

export const DEFAULT_COLUMN_WIDTH = 250;

const ColumnWidth = () => {
    // @ts-expect-error
    const columnWidth = useSelector((state) => state.comparison.configuration.columnWidth);
    const [localColumnWidth, setLocalColumnWidth] = useState<number>(columnWidth ?? DEFAULT_COLUMN_WIDTH);
    const [, setCookie] = useCookies();
    const dispatch = useDispatch();

    const handleChangeColumnWidth = (width: number) => {
        setCookie('comparisonColumnWidth', width, { path: env('PUBLIC_URL'), maxAge: 60 * 60 * 24 * 7 }); // << one week
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
                    min={25}
                    max={500}
                />
                <Tippy content="Reset to default">
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
                </Tippy>
            </DropdownItem>
        </>
    );
};

export default ColumnWidth;
