import { cn, Input, ListBox, Select, TextField } from '@heroui/react';
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
    /** Position inside a joined input group — squares the edges that touch the group neighbors. */
    groupPosition?: 'start' | 'middle';
};

const GregorianInput: FC<GregorianInputProps> = ({ value, onChange, type, groupPosition }) => {
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

    // Only the outer edges touch the group neighbors — inner fields are separated by gaps and keep their rounding
    const outerFields: Record<GregorianType, { first: keyof GregorianValues; last: keyof GregorianValues }> = {
        gYear: { first: 'year', last: 'year' },
        gYearMonth: { first: 'year', last: 'month' },
        gMonth: { first: 'month', last: 'month' },
        gMonthDay: { first: 'month', last: 'day' },
        gDay: { first: 'day', last: 'day' },
    };
    const fieldRounding = (field: keyof GregorianValues) =>
        cn(
            groupPosition === 'middle' && field === outerFields[type].first && '!rounded-s-none',
            groupPosition && field === outerFields[type].last && '!rounded-e-none',
        );

    return (
        <div className="flex flex-1 min-w-0 items-center gap-1">
            {(type === 'gYear' || type === 'gYearMonth') && (
                <>
                    <TextField
                        fullWidth
                        value={date.year}
                        onChange={(v) => handleChange('year', v)}
                        className="flex-1 min-w-0 relative focus-within:z-10"
                    >
                        <Input placeholder="YYYY" type="number" min="-9999" max="9999" className={cn('h-9', fieldRounding('year'))} />
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
                        className="flex-1 min-w-0 relative focus-within:z-10"
                    >
                        <Select.Trigger className={cn('h-9 w-full', fieldRounding('month'))}>
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
                    className="flex-1 min-w-0 relative focus-within:z-10"
                >
                    <Select.Trigger className={cn('h-9 w-full', fieldRounding('day'))}>
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
