import { FC, useEffect, useId, useState } from 'react';
import { Input, Label } from 'reactstrap';

import {
    DateTimeValues,
    formatDateTimeValue,
    parseDateTimeString,
} from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DateTimeInput/helpers';
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

    // Parse input string to object
    useEffect(() => {
        if (!value) return;
        const parsedDateTime = parseDateTimeString(value);
        if (parsedDateTime) {
            setDateTime(parsedDateTime);
        }
    }, [value]);

    const handleChange = (field: keyof DateTimeValues | 'date', newValue: string) => {
        let newDateTime = { ...dateTime };

        if (field === 'timezone') {
            // Simply update the timezone value without any validation
            newDateTime[field] = newValue;
        } else if (field === 'date') {
            // Handle date input change
            const [year, month, day] = newValue.split('-');
            newDateTime = {
                ...newDateTime,
                year: year || '',
                month: month || '',
                day: day || '',
            };
        } else if (['hours', 'minutes', 'seconds'].includes(field)) {
            // For time fields, keep the value as is, including leading zeros
            newDateTime[field] = newValue;
        } else if (field === 'milliseconds') {
            // Validate milliseconds (0-999)
            const ms = parseInt(newValue, 10) || 0;
            newDateTime[field] = Math.min(999, Math.max(0, ms)).toString();
        } else {
            // For other fields, remove leading zeros
            const cleanValue = newValue.replace(/^0+/, '') || '';
            newDateTime[field] = cleanValue;
        }

        setDateTime(newDateTime);
        onChange(formatDateTimeValue(newDateTime));
    };

    const dateValue =
        dateTime.year && dateTime.month && dateTime.day ? `${dateTime.year}-${dateTime.month.padStart(2, '0')}-${dateTime.day.padStart(2, '0')}` : '';

    return (
        <div className="d-flex flex-column gap-3">
            {/* Date Input */}
            <div className="d-flex flex-column">
                <Label className="mb-1" for={`${formId}date`}>
                    Date
                </Label>
                <Input
                    id={`${formId}date`}
                    className="form-control"
                    type="date"
                    value={dateValue}
                    onChange={(e) => handleChange('date', e.target.value)}
                />
            </div>

            {/* Hours, Minutes, Seconds Row */}
            <div className="d-flex gap-3">
                <div className="d-flex flex-column flex-grow-1">
                    <Label className="mb-1" for={`${formId}hours`}>
                        Hours
                    </Label>
                    <Input
                        placeholder="hh"
                        type="number"
                        min="0"
                        max="23"
                        value={dateTime.hours}
                        onChange={(e) => handleChange('hours', e.target.value)}
                        id={`${formId}hours`}
                    />
                </div>
                <div className="d-flex flex-column flex-grow-1">
                    <Label className="mb-1" for={`${formId}minutes`}>
                        Minutes
                    </Label>
                    <Input
                        placeholder="mm"
                        type="number"
                        min="0"
                        max="59"
                        value={dateTime.minutes}
                        onChange={(e) => handleChange('minutes', e.target.value)}
                        id={`${formId}minutes`}
                    />
                </div>
                <div className="d-flex flex-column flex-grow-1">
                    <Label className="mb-1" for={`${formId}seconds`}>
                        Seconds
                    </Label>
                    <Input
                        placeholder="ss"
                        type="number"
                        min="0"
                        max="59"
                        value={dateTime.seconds}
                        onChange={(e) => handleChange('seconds', e.target.value)}
                        id={`${formId}seconds`}
                    />
                </div>
            </div>

            {/* Milliseconds and Timezone Row */}
            <div className="d-flex gap-3">
                <div className="d-flex flex-column flex-grow-1">
                    <Label className="mb-1" for={`${formId}milliseconds`}>
                        Milliseconds
                    </Label>
                    <Input
                        placeholder="sss"
                        type="number"
                        min="0"
                        max="999"
                        value={dateTime.milliseconds}
                        onChange={(e) => handleChange('milliseconds', e.target.value)}
                        id={`${formId}milliseconds`}
                    />
                </div>
                <div className="d-flex flex-column flex-grow-1">
                    <Label className="mb-1" for={`${formId}timezone`}>
                        Timezone {type === 'dateTimeStamp' ? '(required)' : '(optional)'}
                    </Label>
                    <Input
                        placeholder={type === 'dateTimeStamp' ? 'Z or ±hh:mm' : '[Z or ±hh:mm]'}
                        type="text"
                        value={dateTime.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        required={type === 'dateTimeStamp'}
                        id={`${formId}timezone`}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateTimeInput;
