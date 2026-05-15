import { Input, Label, TextField } from '@heroui/react';
import { FC, useEffect, useId, useState } from 'react';

import { DateTimeValues, formatDateTimeValue, parseDateTimeString } from '@/components/InputField/DateTimeInput/helpers';
import { DateTimeType } from '@/constants/DataTypes';

type DateTimeInputProps = {
    value: string;
    onChange: (value: string) => void;
    type?: DateTimeType;
};

const DateTimeInput: FC<DateTimeInputProps> = ({ value, onChange, type = 'dateTime' }) => {
    const [dateTime, setDateTime] = useState<DateTimeValues>({
        year: '',
        month: '',
        day: '',
        hours: '',
        minutes: '',
        seconds: '',
        milliseconds: '',
        timezone: '',
    });
    const formId = useId();

    useEffect(() => {
        if (!value) return;
        const parsedDateTime = parseDateTimeString(value);
        if (parsedDateTime) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDateTime(parsedDateTime);
        }
    }, [value]);

    const handleChange = (field: keyof DateTimeValues | 'date', newValue: string) => {
        let newDateTime = { ...dateTime };

        if (field === 'timezone') {
            newDateTime[field] = newValue;
        } else if (field === 'date') {
            const [year, month, day] = newValue.split('-');
            newDateTime = {
                ...newDateTime,
                year: year || '',
                month: month || '',
                day: day || '',
            };
        } else if (['hours', 'minutes', 'seconds'].includes(field)) {
            newDateTime[field] = newValue;
        } else if (field === 'milliseconds') {
            const ms = parseInt(newValue, 10) || 0;
            newDateTime[field] = Math.min(999, Math.max(0, ms)).toString();
        } else {
            const cleanValue = newValue.replace(/^0+/, '') || '';
            newDateTime[field] = cleanValue;
        }

        setDateTime(newDateTime);
        onChange(formatDateTimeValue(newDateTime));
    };

    const dateValue =
        dateTime.year && dateTime.month && dateTime.day ? `${dateTime.year}-${dateTime.month.padStart(2, '0')}-${dateTime.day.padStart(2, '0')}` : '';

    return (
        <div className="flex flex-col gap-3">
            <TextField fullWidth value={dateValue} onChange={(v) => handleChange('date', v)}>
                <Label htmlFor={`${formId}date`} className="mb-1">
                    Date
                </Label>
                <Input id={`${formId}date`} type="date" />
            </TextField>
            <div className="flex gap-3">
                <TextField fullWidth value={dateTime.hours} onChange={(v) => handleChange('hours', v)} className="grow">
                    <Label htmlFor={`${formId}hours`} className="mb-1">
                        Hours
                    </Label>
                    <Input id={`${formId}hours`} placeholder="hh" type="number" min="0" max="23" />
                </TextField>
                <TextField fullWidth value={dateTime.minutes} onChange={(v) => handleChange('minutes', v)} className="grow">
                    <Label htmlFor={`${formId}minutes`} className="mb-1">
                        Minutes
                    </Label>
                    <Input id={`${formId}minutes`} placeholder="mm" type="number" min="0" max="59" />
                </TextField>
                <TextField fullWidth value={dateTime.seconds} onChange={(v) => handleChange('seconds', v)} className="grow">
                    <Label htmlFor={`${formId}seconds`} className="mb-1">
                        Seconds
                    </Label>
                    <Input id={`${formId}seconds`} placeholder="ss" type="number" min="0" max="59" />
                </TextField>
            </div>
            <div className="flex gap-3">
                <TextField fullWidth value={dateTime.milliseconds} onChange={(v) => handleChange('milliseconds', v)} className="grow">
                    <Label htmlFor={`${formId}milliseconds`} className="mb-1">
                        Milliseconds
                    </Label>
                    <Input id={`${formId}milliseconds`} placeholder="sss" type="number" min="0" max="999" />
                </TextField>
                <TextField
                    fullWidth
                    value={dateTime.timezone}
                    onChange={(v) => handleChange('timezone', v)}
                    isRequired={type === 'dateTimeStamp'}
                    className="grow"
                >
                    <Label htmlFor={`${formId}timezone`} className="mb-1">
                        Timezone {type === 'dateTimeStamp' ? '(required)' : '(optional)'}
                    </Label>
                    <Input id={`${formId}timezone`} placeholder={type === 'dateTimeStamp' ? 'Z or ±hh:mm' : '[Z or ±hh:mm]'} type="text" />
                </TextField>
            </div>
        </div>
    );
};

export default DateTimeInput;
