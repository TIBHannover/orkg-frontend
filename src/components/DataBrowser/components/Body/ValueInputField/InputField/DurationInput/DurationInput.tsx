import { FC, useEffect, useId, useState } from 'react';
import { Col, FormGroup, Input, Label } from 'reactstrap';

import {
    DurationValues,
    formatDurationValue,
    parseDurationString,
} from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DurationInput/helpers';
import { DurationType } from '@/constants/DataTypes';

type DurationInputProps = { value: string; onChange: (value: string) => void; type?: DurationType };

const DurationField: FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
    const fieldId = useId();
    return (
        <FormGroup row>
            <Label className="me-2 text-nowrap" style={{ minWidth: '100px' }} for={fieldId} sm={2}>
                {label}
            </Label>
            <Col sm={9}>
                <Input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="rounded" id={fieldId} />
            </Col>
        </FormGroup>
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
        if (parsedDuration) setDuration(parsedDuration);
    }, [value]);

    const handleChange = (field: keyof DurationValues, newValue: string) => {
        const newDuration = { ...duration, [field]: newValue };
        setDuration(newDuration);
        onChange(formatDurationValue(newDuration, type));
    };

    if (type === 'dayTimeDuration') {
        return (
            <div>
                <h6 className="mb-3 fw-bold">Day/time duration</h6>
                <DurationField label="Days" value={duration.days} onChange={(v) => handleChange('days', v)} />
                <h6 className="mb-2 mt-3 fw-bold">Time</h6>
                <TimeFields duration={duration} onChange={handleChange} />
            </div>
        );
    }

    return (
        <div>
            <h6 className="mb-3 fw-bold">Period</h6>
            {(type === 'duration' || type === 'yearMonthDuration') && (
                <>
                    <DurationField label="Years" value={duration.years} onChange={(v) => handleChange('years', v)} />
                    <DurationField label="Months" value={duration.months} onChange={(v) => handleChange('months', v)} />
                </>
            )}
            {type === 'duration' && (
                <>
                    <DurationField label="Days" value={duration.days} onChange={(v) => handleChange('days', v)} />
                    <h6 className="mb-2 mt-3 fw-bold">Time</h6>
                    <TimeFields duration={duration} onChange={handleChange} />
                </>
            )}
        </div>
    );
};

export default DurationInput;
