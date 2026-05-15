import { Input, ListBox, Select, TextField } from '@heroui/react';
import { FC, useEffect, useState } from 'react';

import {
    daysOptions,
    formatGregorianValue,
    type GregorianValues,
    monthsOptions,
    parseGregorianString,
} from '@/components/InputField/GregorianInput/helpers';
import { GregorianType } from '@/constants/DataTypes';

type GregorianInputProps = {
    value: string;
    onChange: (value: string) => void;
    type: GregorianType;
};

const GregorianInput: FC<GregorianInputProps> = ({ value, onChange, type }) => {
    const [date, setDate] = useState<GregorianValues>({
        year: '',
        month: '',
        day: '',
    });

    useEffect(() => {
        if (!value) return;
        const parsedDate = parseGregorianString(value, type);
        if (parsedDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDate(parsedDate);
        }
    }, [value, type]);

    const handleChange = (field: keyof GregorianValues, newValue: string) => {
        const newDate = { ...date, [field]: newValue };
        setDate(newDate);
        onChange(formatGregorianValue(newDate, type));
    };

    return (
        <div className="flex flex-1 min-w-0 items-center gap-1">
            {(type === 'gYear' || type === 'gYearMonth') && (
                <>
                    <TextField fullWidth value={date.year} onChange={(v) => handleChange('year', v)} className="flex-1 min-w-0">
                        <Input placeholder="YYYY" type="number" min="-9999" max="9999" />
                    </TextField>
                    {type === 'gYearMonth' && <span className="px-1 text-muted">-</span>}
                </>
            )}

            {(type === 'gMonth' || type === 'gYearMonth' || type === 'gMonthDay') && (
                <>
                    <Select
                        aria-label="Month"
                        placeholder="MM"
                        value={date.month || null}
                        onChange={(key) => handleChange('month', key ? String(key) : '')}
                        className="flex-1 min-w-0"
                    >
                        <Select.Trigger className="h-9 w-full">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {monthsOptions.map((month) => (
                                    <ListBox.Item key={month.value} id={month.value} textValue={month.label}>
                                        {month.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    {type === 'gMonthDay' && <span className="px-1 text-muted">-</span>}
                </>
            )}

            {(type === 'gDay' || type === 'gMonthDay') && (
                <Select
                    aria-label="Day"
                    placeholder="DD"
                    value={date.day || null}
                    onChange={(key) => handleChange('day', key ? String(key) : '')}
                    className="flex-1 min-w-0"
                >
                    <Select.Trigger className="h-9 w-full">
                        <Select.Value />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            {daysOptions.map((day) => (
                                <ListBox.Item key={day.value} id={day.value} textValue={day.label}>
                                    {day.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            )}
        </div>
    );
};

export default GregorianInput;
