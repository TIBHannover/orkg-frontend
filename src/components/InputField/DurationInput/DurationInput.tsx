import { Input, Label, TextField } from '@heroui/react';
import { FC, useEffect, useId, useState } from 'react';

import { DurationValues, formatDurationValue, parseDurationString } from '@/components/InputField/DurationInput/helpers';
import { DurationType } from '@/constants/DataTypes';

type DurationInputProps = { value: string; onChange: (value: string) => void; type?: DurationType };

const DurationField: FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
    const fieldId = useId();
    return (
        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label htmlFor={fieldId} className="text-sm whitespace-nowrap">
                {label}
            </Label>
            <TextField fullWidth value={value} onChange={onChange}>
                <Input id={fieldId} type="number" min="0" />
            </TextField>
        </div>
    );
};

const TimeFields: FC<{ duration: DurationValues; onChange: (field: keyof DurationValues, value: string) => void }> = ({ duration, onChange }) => (
    <>
        <DurationField label="Hours" value={duration.hours} onChange={(v) => onChange('hours', v)} />
        <DurationField label="Minutes" value={duration.minutes} onChange={(v) => onChange('minutes', v)} />
        <DurationField label="Seconds" value={duration.seconds} onChange={(v) => onChange('seconds', v)} />
    </>
);

const DurationInput: FC<DurationInputProps> = ({ value, onChange, type = 'duration' }) => {
    const [duration, setDuration] = useState<DurationValues>({
        years: '',
        months: '',
        days: '',
        hours: '',
        minutes: '',
        seconds: '',
    });

    useEffect(() => {
        const parsedDuration = parseDurationString(value);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsedDuration) setDuration(parsedDuration);
    }, [value]);

    const handleChange = (field: keyof DurationValues, newValue: string) => {
        const newDuration = { ...duration, [field]: newValue };
        setDuration(newDuration);
        onChange(formatDurationValue(newDuration, type));
    };

    if (type === 'dayTimeDuration') {
        return (
            <div className="flex flex-col gap-3">
                <h6 className="font-bold">Day/time duration</h6>
                <DurationField label="Days" value={duration.days} onChange={(v) => handleChange('days', v)} />
                <h6 className="mt-2 font-bold">Time</h6>
                <TimeFields duration={duration} onChange={handleChange} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <h6 className="font-bold">Period</h6>
            {(type === 'duration' || type === 'yearMonthDuration') && (
                <>
                    <DurationField label="Years" value={duration.years} onChange={(v) => handleChange('years', v)} />
                    <DurationField label="Months" value={duration.months} onChange={(v) => handleChange('months', v)} />
                </>
            )}
            {type === 'duration' && (
                <>
                    <DurationField label="Days" value={duration.days} onChange={(v) => handleChange('days', v)} />
                    <h6 className="mt-2 font-bold">Time</h6>
                    <TimeFields duration={duration} onChange={handleChange} />
                </>
            )}
        </div>
    );
};

export default DurationInput;
