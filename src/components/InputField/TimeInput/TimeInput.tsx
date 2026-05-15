import { Input, Label, TextField } from '@heroui/react';
import { FC, useEffect, useId, useState } from 'react';

import { formatTimeValue, parseTimeString, TimeValues } from '@/components/InputField/TimeInput/helpers';

type TimeInputProps = {
    value: string;
    onChange: (value: string) => void;
};

const fields: { key: keyof TimeValues; label: string; placeholder: string; max: string }[] = [
    { key: 'hours', label: 'Hours', placeholder: 'hh', max: '23' },
    { key: 'minutes', label: 'Minutes', placeholder: 'mm', max: '59' },
    { key: 'seconds', label: 'Seconds', placeholder: 'ss', max: '59' },
    { key: 'milliseconds', label: 'Milliseconds', placeholder: 'sss', max: '999' },
];

const TimeInput: FC<TimeInputProps> = ({ value, onChange }) => {
    const [time, setTime] = useState<TimeValues>({
        hours: '',
        minutes: '',
        seconds: '',
        milliseconds: '',
    });
    const formId = useId();

    useEffect(() => {
        if (!value) return;
        const parsedTime = parseTimeString(value);
        if (parsedTime) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTime(parsedTime);
        }
    }, [value]);

    const handleChange = (field: keyof TimeValues, newValue: string) => {
        const cleanValue = newValue.replace(/^0+/, '') || '';
        const newTime = { ...time, [field]: cleanValue };
        setTime(newTime);
        onChange(formatTimeValue(newTime));
    };

    return (
        <div className="flex flex-col gap-3">
            {fields.map(({ key, label, placeholder, max }) => (
                <div key={key} className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <Label htmlFor={`${formId}${key}`} className="text-sm">
                        {label}
                    </Label>
                    <TextField fullWidth value={time[key]} onChange={(v) => handleChange(key, v)}>
                        <Input id={`${formId}${key}`} placeholder={placeholder} type="number" min="0" max={max} />
                    </TextField>
                </div>
            ))}
        </div>
    );
};

export default TimeInput;
