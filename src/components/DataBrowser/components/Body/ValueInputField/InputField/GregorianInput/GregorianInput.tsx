import { FC, useEffect, useState } from 'react';
import { Input, InputGroupText } from 'reactstrap';

import {
    daysOptions,
    formatGregorianValue,
    type GregorianValues,
    monthsOptions,
    parseGregorianString,
} from '@/components/DataBrowser/components/Body/ValueInputField/InputField/GregorianInput/helpers';
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

    // Parse input string to object
    useEffect(() => {
        if (!value) return;
        const parsedDate = parseGregorianString(value, type);
        if (parsedDate) {
            setDate(parsedDate);
        }
    }, [value, type]);

    const handleChange = (field: keyof GregorianValues, newValue: string) => {
        const newDate = { ...date, [field]: newValue };
        setDate(newDate);
        onChange(formatGregorianValue(newDate, type));
    };

    return (
        <>
            {(type === 'gYear' || type === 'gYearMonth') && (
                <>
                    <Input
                        placeholder="YYYY"
                        type="number"
                        min="-9999"
                        max="9999"
                        value={date.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                    />
                    {type === 'gYearMonth' && <InputGroupText>-</InputGroupText>}
                </>
            )}

            {(type === 'gMonth' || type === 'gYearMonth' || type === 'gMonthDay') && (
                <>
                    <Input type="select" value={date.month} onChange={(e) => handleChange('month', e.target.value)}>
                        <option value="">MM</option>
                        {monthsOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </Input>
                    {type === 'gMonthDay' && <InputGroupText>-</InputGroupText>}
                </>
            )}

            {(type === 'gDay' || type === 'gMonthDay') && (
                <Input type="select" value={date.day} onChange={(e) => handleChange('day', e.target.value)}>
                    <option value="">DD</option>
                    {daysOptions.map((day) => (
                        <option key={day.value} value={day.value}>
                            {day.label}
                        </option>
                    ))}
                </Input>
            )}
        </>
    );
};

export default GregorianInput;
